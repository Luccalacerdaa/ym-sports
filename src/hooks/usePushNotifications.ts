import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  // Verificar suporte do navegador
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      } else {
        console.warn('Push notifications não são suportadas neste navegador');
      }
    };

    checkSupport();
  }, []);

  // Converter chave VAPID de base64 para Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Registrar Service Worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registrado:', registration.scope);
      
      // Aguardar até que o Service Worker esteja ativo
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      return null;
    }
  };

  // Solicitar permissão para notificações
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notificações push não são suportadas neste navegador');
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);
    
    console.log('Permissão de notificação:', perm);
    return perm;
  };

  // Inscrever para receber notificações push
  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    if (!VAPID_PUBLIC_KEY) {
      toast.error('Chave VAPID não configurada');
      console.error('VITE_VAPID_PUBLIC_KEY não encontrada no .env.local');
      return null;
    }

    setLoading(true);

    try {
      // 1. Solicitar permissão
      const perm = await requestPermission();
      
      if (perm !== 'granted') {
        toast.error('Permissão de notificação negada');
        return null;
      }

      // 2. Registrar Service Worker
      const registration = await registerServiceWorker();
      
      if (!registration) {
        throw new Error('Falha ao registrar Service Worker');
      }

      // 3. Verificar se já existe inscrição
      let sub = await registration.pushManager.getSubscription();

      // 4. Se não existe, criar nova inscrição
      if (!sub) {
        console.log('Criando nova inscrição push...');
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true, // Sempre mostrar notificação ao usuário
          applicationServerKey
        });
        
        console.log('✅ Inscrição push criada:', sub.endpoint);
      } else {
        console.log('✅ Inscrição push já existente:', sub.endpoint);
      }

      // 5. Salvar inscrição no backend
      const response = await fetch('/api/save-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          subscription: sub.toJSON()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao salvar inscrição');
      }

      setSubscription(sub);
      toast.success('🔔 Notificações ativadas com sucesso!');
      console.log('✅ Inscrição salva no servidor');
      
      return sub;
    } catch (error: any) {
      console.error('❌ Erro ao inscrever para notificações:', error);
      toast.error('Erro ao ativar notificações: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar inscrição de notificações
  const unsubscribe = async (): Promise<boolean> => {
    if (!user || !subscription) {
      return false;
    }

    setLoading(true);

    try {
      // 1. Cancelar inscrição no navegador
      const success = await subscription.unsubscribe();
      
      if (!success) {
        throw new Error('Falha ao cancelar inscrição');
      }

      // 2. Remover do backend
      await fetch('/api/remove-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          endpoint: subscription.endpoint
        })
      });

      setSubscription(null);
      toast.success('🔕 Notificações desativadas');
      console.log('✅ Inscrição cancelada');
      
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao cancelar inscrição:', error);
      toast.error('Erro ao desativar notificações');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Testar notificação (apenas para desenvolvimento)
  const testNotification = () => {
    if (!isSupported || permission !== 'granted') {
      toast.error('Permissão de notificação não concedida');
      return;
    }

    new Notification('🧪 Teste - YM Sports', {
      body: 'Esta é uma notificação de teste!',
      icon: '/icons/logo.png',
      badge: '/icons/logo.png',
      vibrate: [200, 100, 200]
    });

    toast.success('Notificação de teste enviada');
  };

  // Verificar inscrição existente ao carregar
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        
        if (sub) {
          console.log('✅ Inscrição existente encontrada:', sub.endpoint);
          setSubscription(sub);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar inscrição:', error);
      }
    };

    checkSubscription();
  }, [isSupported, user]);

  return {
    isSupported,
    permission,
    subscription,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
    testNotification
  };
};

