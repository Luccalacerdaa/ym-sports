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
      // Solicitar permissão PRIMEIRO (não bloqueia)
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.log('❌ Permissão negada');
        setLoading(false);
        return false;
      }

      // Timeout de 10 segundos para evitar congelamento
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao ativar notificações')), 10000)
      );

      const subscribePromise = (async () => {
        // Limpar subscription antiga (com timeout)
        try {
          const registration = await navigator.serviceWorker.ready;
          const oldSubscription = await registration.pushManager.getSubscription();
          if (oldSubscription) {
            await oldSubscription.unsubscribe();
            console.log('🗑️ Subscription antiga removida');
          }
        } catch (err) {
          console.warn('⚠️ Erro ao limpar subscription antiga, continuando...', err);
        }

        // Registrar SW se necessário
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js');
        }
        await navigator.serviceWorker.ready;

        // Criar nova subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        console.log('📝 Nova subscription criada');

        // Salvar no backend (com timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              subscription: subscription.toJSON()
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error('Falha ao salvar no servidor');
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.warn('⚠️ Erro ao salvar no backend, mas subscription local criada', fetchError);
          // Continuar mesmo se o backend falhar
        }

        return true;
      })();

      const result = await Promise.race([subscribePromise, timeoutPromise]);
      setIsSubscribed(result);
      console.log('✅ Push ativado!');
      return result;
    } catch (error: any) {
      console.error('❌ Erro ao subscrever:', error);
      // Não mostrar alert que bloqueia a UI
      console.error(`Erro: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isSupported]);

  // Verificar subscription status (SEM auto-update que causa congelamento)
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) return;

      try {
        // Timeout de 5 segundos para evitar congelamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const checkPromise = (async () => {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
          setPermission(Notification.permission);
        })();

        await Promise.race([checkPromise, timeoutPromise]);
      } catch (error) {
        if (error instanceof Error && error.message === 'Timeout') {
          console.warn('⚠️ Timeout ao verificar subscription, continuando...');
        } else {
          console.error('Erro ao verificar subscription:', error);
        }
        // Não bloquear a UI mesmo em caso de erro
        setPermission(Notification.permission);
      }
    };

    checkSubscription();
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

