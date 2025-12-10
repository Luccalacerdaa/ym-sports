import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { subscribeToPush, savePushSubscription, removePushSubscription, unsubscribeFromPush } from '@/lib/webPush';

export const useWebPush = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se já está inscrito
  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push API não suportada');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const subscribed = subscription !== null;
      setIsSubscribed(subscribed);
      return subscribed;
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error);
      return false;
    }
  }, []);

  // Inscrever para push notifications
  const subscribe = useCallback(async () => {
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return false;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('❌ Notification API não disponível');
      return false;
    }

    setIsLoading(true);
    
    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('❌ Permissão negada');
        setIsLoading(false);
        return false;
      }

      // Criar subscription
      const subscription = await subscribeToPush();
      if (!subscription) {
        console.log('❌ Falha ao criar subscription');
        setIsLoading(false);
        return false;
      }

      // Salvar no banco
      const saved = await savePushSubscription(user.id, subscription, supabase);
      if (!saved) {
        console.log('⚠️ Subscription criada mas não salva no banco');
      }

      setIsSubscribed(true);
      setIsLoading(false);
      console.log('✅ Push notifications ativadas!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inscrever:', error);
      setIsLoading(false);
      return false;
    }
  }, [user]);

  // Cancelar inscrição
  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setIsLoading(true);

    try {
      // Cancelar no browser
      await unsubscribeFromPush();

      // Remover do banco
      await removePushSubscription(user.id, supabase);

      setIsSubscribed(false);
      setIsLoading(false);
      console.log('✅ Push notifications desativadas!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar:', error);
      setIsLoading(false);
      return false;
    }
  }, [user]);

  // Verificar ao montar
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Auto-inscrever quando usuário faz login (opcional)
  useEffect(() => {
    if (user && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      checkSubscription().then(async (subscribed) => {
        if (!subscribed) {
          console.log('🔄 Auto-inscrevendo para push notifications...');
          await subscribe();
        }
      });
    }
  }, [user]);

  return {
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    checkSubscription
  };
};
