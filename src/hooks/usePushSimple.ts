import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export const usePushSimple = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Verificar suporte
  const isSupported = 
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  // Converter VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Desinscrever (limpar subscriptions antigas)
  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    try {
      // Desinscrever do PushManager
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('🗑️ Subscription local removida');
      }

      // Limpar do backend
      const response = await fetch('/api/clear-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (!response.ok) {
        console.warn('⚠️ Erro ao limpar backend, mas continuando...');
      }

      setIsSubscribed(false);
      console.log('✅ Push desativado!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao desinscrever:', error);
      return false;
    }
  }, [user]);

  // Subscrever
  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    setLoading(true);
    try {
      // Primeiro, limpar qualquer subscription antiga
      await unsubscribe();

      // Solicitar permissão
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.log('❌ Permissão negada');
        return false;
      }

      // Registrar SW
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('📝 Nova subscription criada:', subscription.endpoint.substring(0, 50) + '...');

      // Salvar no backend
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao salvar subscription');
      }

      setIsSubscribed(true);
      console.log('✅ Push ativado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao subscrever:', error);
      alert(`Erro ao ativar push: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isSupported, unsubscribe]);

  // Verificar e atualizar subscriptions antigas automaticamente
  useEffect(() => {
    const checkAndUpdateSubscription = async () => {
      if (!isSupported || !user) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        setPermission(Notification.permission);

        // 🔄 AUTO-UPDATE: Verificar se há subscription antiga no backend
        if (subscription) {
          console.log('🔍 Verificando se subscription precisa ser atualizada...');
          
          // Verificar no backend se esta subscription é antiga
          const checkResponse = await fetch('/api/list-devices', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (checkResponse.ok) {
            const data = await checkResponse.json();
            const userDevices = data.devices_by_user?.[user.id] || [];
            
            // Verificar se algum dispositivo deste usuário é antigo (sem updated_at)
            const hasOldDevice = userDevices.some((d: any) => d.is_old);
            
            if (hasOldDevice) {
              console.log('🔄 Subscription antiga detectada! Atualizando automaticamente...');
              
              // Reenviar a subscription atual para atualizar no backend
              const updateResponse = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.id,
                  subscription: subscription.toJSON()
                })
              });

              if (updateResponse.ok) {
                console.log('✅ Subscription atualizada automaticamente para o novo sistema!');
              } else {
                console.warn('⚠️ Falha ao atualizar subscription antiga');
              }
            } else {
              console.log('✅ Subscription já está no novo sistema');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar/atualizar subscription:', error);
      }
    };

    checkAndUpdateSubscription();
  }, [isSupported, user]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe
  };
};

