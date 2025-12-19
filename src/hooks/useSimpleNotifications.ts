import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useSimpleNotifications = () => {
  const { user } = useAuth();

  // Verificar se notificações são suportadas
  const isSupported = useCallback(() => {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }, []);

  // Solicitar permissão
  const requestPermission = useCallback(async () => {
    if (!isSupported()) {
      console.log('❌ Notificações não suportadas');
      return false;
    }

    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log(`🔔 Permissão de notificação: ${permission}`);
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      return false;
    }
  }, [isSupported]);

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker não suportado');
      return false;
    }

    try {
      // Verificar se já existe SW registrado
      const existingReg = await navigator.serviceWorker.getRegistration();
      
      if (existingReg) {
        console.log('ℹ️ Service Worker já registrado:', existingReg.scope);
        
        // Verificar se há atualização disponível, mas NÃO forçar instalação
        if (existingReg.waiting) {
          console.log('⚠️ Nova versão do SW disponível, mas não será instalada automaticamente');
          // Usuário pode recarregar manualmente para atualizar
        }
        
        return true; // Não fazer nada se já existe
      }

      // Registrar novo SW apenas se não existir
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registrado:', registration);

      // NÃO escutar por atualizações que causam recarregamento
      // registration.addEventListener('updatefound', ...); // REMOVIDO

      // Aguardar ativação
      await navigator.serviceWorker.ready;
      console.log('🚀 Service Worker ativo!');

      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      return false;
    }
  }, []);

  // Enviar notificação de teste
  const sendTestNotification = useCallback(async () => {
    if (!isSupported()) return;

    try {
      // Via Service Worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TEST_NOTIFICATION'
        });
        console.log('🧪 Teste enviado via Service Worker');
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        // Fallback direto (só se Notification existir)
        new Notification('🧪 Teste YM Sports', {
          body: 'Notificação de teste funcionando!',
          icon: '/icons/icon-192.png'
        });
        console.log('🧪 Teste enviado diretamente');
      } else {
        console.log('⚠️ Notification API não disponível');
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }, [isSupported]);

  // Enviar notificação
  const sendNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (!isSupported()) {
      console.warn('⚠️ Notificações não suportadas');
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('⚠️ Notification API não disponível');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Permissão de notificação não concedida');
      return;
    }

    try {
      // Tentar enviar via Service Worker primeiro
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          options: {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            ...options
          }
        });
        console.log(`✅ Notificação enviada via SW: ${title}`);
      } else {
        // Fallback: notificação direta
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          ...options
        });
        console.log(`✅ Notificação enviada diretamente: ${title}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
    }
  }, [isSupported]);

  // Forçar verificação de notificações
  const forceCheck = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'FORCE_CHECK'
      });
      console.log('🔄 Verificação forçada solicitada');
    }
  }, []);

  // Configurar sistema quando usuário faz login
  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      console.log('🔧 Configurando sistema de notificações...');

      // 1. Verificar suporte
      if (!isSupported()) {
        console.log('❌ Dispositivo não suporta notificações');
        return;
      }

      // 2. Solicitar permissão
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.log('❌ Permissão negada');
        return;
      }

      // 3. Registrar Service Worker
      const swRegistered = await registerServiceWorker();
      if (!swRegistered) {
        console.log('❌ Falha ao registrar Service Worker');
        return;
      }

      // 4. Enviar configurações do Supabase para o SW
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_SUPABASE_CONFIG',
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          userId: user.id
        });
        console.log('📤 Configurações do Supabase enviadas ao SW');
      }

      console.log('✅ Sistema de notificações configurado com sucesso!');
    };

    setupNotifications();
  }, [user, isSupported, requestPermission, registerServiceWorker]);

  return {
    isSupported,
    requestPermission,
    sendNotification,
    sendTestNotification,
    forceCheck,
    hasPermission: isSupported() && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
    permissionGranted: isSupported() && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  };
};