import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationLogger } from '@/utils/notificationLogger';

// Cronograma de notificações
const NOTIFICATION_SCHEDULE = [
  { time: "07:00", title: "💪 Motivação Matinal", body: "Seu futuro agradece o esforço de hoje." },
  { time: "08:30", title: "🏃‍♂️ Treino Disponível", body: "Seu treino personalizado está te esperando!" },
  { time: "09:30", title: "💦 Hidratação Matinal", body: "Comece o dia tomando água" },
  { time: "10:30", title: "📈 Atualize Seu Perfil", body: "Complete suas informações!", frequency: "weekly" },
  { time: "12:00", title: "🥗 Hora da Nutrição", body: "Cuide da sua alimentação para ter energia!" },
  { time: "13:00", title: "🏆 Nova Conquista Disponível", body: "Você tem conquistas esperando!" },
  { time: "14:00", title: "💧 Hidratação é Fundamental", body: "Mantenha-se hidratado durante o dia!" },
  { time: "15:30", title: "🎯 Foco no Objetivo", body: "Mantenha o foco nos seus sonhos!" },
  { time: "16:30", title: "📱 Portfólio Online", body: "Divulgue sua marca e seja descoberto!" },
  { time: "18:30", title: "🌟 Motivação Noturna", body: "Orgulhe-se do que você fez hoje." },
  { time: "19:00", title: "🍽️ Jantar Inteligente", body: "Termine o dia com uma refeição saudável!" },
  { time: "20:00", title: "🥇 Ranking Atualizado", body: "Veja sua posição no ranking!", frequency: "weekly" }
];

export const useWebPushNotifications = () => {
  const { user } = useAuth();

  // Verificar suporte completo
  const isWebPushSupported = useCallback(() => {
    const supported = typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator &&
           'PushManager' in window;
    
    NotificationLogger.info('WEBPUSH', `Suporte Web Push: ${supported}`);
    return supported;
  }, []);

  // Registrar Service Worker com logs detalhados
  const registerServiceWorker = useCallback(async () => {
    if (!isWebPushSupported()) {
      NotificationLogger.error('WEBPUSH', 'Web Push não suportado');
      return null;
    }

    try {
      NotificationLogger.info('WEBPUSH', '🔄 Registrando Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      NotificationLogger.success('WEBPUSH', '✅ Service Worker registrado', {
        scope: registration.scope,
        state: registration.active?.state
      });

      // Aguardar ativação
      if (registration.installing) {
        NotificationLogger.info('WEBPUSH', '⏳ Aguardando instalação do SW...');
        await new Promise(resolve => {
          registration.installing!.addEventListener('statechange', () => {
            if (registration.installing!.state === 'installed') {
              NotificationLogger.success('WEBPUSH', '✅ Service Worker instalado');
              resolve(true);
            }
          });
        });
      }

      return registration;
    } catch (error) {
      NotificationLogger.error('WEBPUSH', '❌ Erro ao registrar Service Worker', error);
      return null;
    }
  }, [isWebPushSupported]);

  // Solicitar permissão com logs
  const requestPermission = useCallback(async () => {
    if (!isWebPushSupported()) {
      NotificationLogger.error('WEBPUSH', 'Web Push não suportado');
      return false;
    }

    try {
      NotificationLogger.info('WEBPUSH', '🔐 Solicitando permissão...');
      
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        NotificationLogger.success('WEBPUSH', '✅ Permissão concedida');
        return true;
      } else if (permission === 'denied') {
        NotificationLogger.error('WEBPUSH', '❌ Permissão negada pelo usuário');
        return false;
      } else {
        NotificationLogger.warn('WEBPUSH', '⚠️ Permissão padrão (não decidida)');
        return false;
      }
    } catch (error) {
      NotificationLogger.error('WEBPUSH', '❌ Erro ao solicitar permissão', error);
      return false;
    }
  }, [isWebPushSupported]);

  // Enviar notificação via Service Worker
  const sendNotificationViaSW = useCallback(async (title: string, body: string, data?: any) => {
    try {
      NotificationLogger.info('WEBPUSH', `📤 Enviando notificação: ${title}`);
      
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body,
        icon: '/icons/logo.png',
        badge: '/icons/logo.png',
        tag: `ym-sports-${Date.now()}`,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          url: '/dashboard',
          timestamp: Date.now(),
          source: 'webpush',
          ...data
        },
        actions: [
          {
            action: 'open',
            title: 'Abrir App'
          },
          {
            action: 'dismiss',
            title: 'Dispensar'
          }
        ]
      });
      
      NotificationLogger.success('WEBPUSH', `✅ Notificação enviada: ${title}`);
      return true;
    } catch (error) {
      NotificationLogger.error('WEBPUSH', `❌ Erro ao enviar notificação: ${title}`, error);
      return false;
    }
  }, []);

  // Agendar notificação com timeout preciso
  const scheduleNotification = useCallback((notification: any) => {
    const now = new Date();
    const [hours, minutes] = notification.time.split(':').map(Number);
    
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    // Se já passou hoje, agendar para amanhã
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const delay = targetTime.getTime() - now.getTime();
    const targetTimeStr = targetTime.toLocaleString('pt-BR');
    
    NotificationLogger.info('WEBPUSH', `⏰ Agendando: ${notification.title}`, {
      horario: notification.time,
      agendadoPara: targetTimeStr,
      delayMs: delay,
      delayMinutos: Math.round(delay / 1000 / 60)
    });
    
    // Verificar frequência semanal
    if (notification.frequency === 'weekly') {
      const targetDay = targetTime.getDay();
      if (targetDay !== 1) { // Não é segunda-feira
        NotificationLogger.info('WEBPUSH', `⏭️ Pulando notificação semanal (não é segunda): ${notification.title}`);
        return null;
      }
    }
    
    const timeoutId = setTimeout(async () => {
      NotificationLogger.info('WEBPUSH', `🔔 Executando notificação agendada: ${notification.title}`);
      
      // Verificar se ainda temos permissão
      if (Notification.permission !== 'granted') {
        NotificationLogger.error('WEBPUSH', '❌ Permissão perdida, não enviando notificação');
        return;
      }
      
      // Enviar notificação
      const success = await sendNotificationViaSW(notification.title, notification.body, {
        scheduled: true,
        originalTime: notification.time
      });
      
      if (success) {
        NotificationLogger.success('WEBPUSH', `✅ Notificação agendada entregue: ${notification.title}`);
      } else {
        NotificationLogger.error('WEBPUSH', `❌ Falha na entrega da notificação agendada: ${notification.title}`);
      }
    }, delay);
    
    return {
      timeoutId,
      targetTime: targetTimeStr,
      delay
    };
  }, [sendNotificationViaSW]);

  // Agendar todas as notificações
  const scheduleAllNotifications = useCallback(async () => {
    if (!isWebPushSupported()) {
      NotificationLogger.error('WEBPUSH', 'Não é possível agendar - Web Push não suportado');
      return 0;
    }

    if (Notification.permission !== 'granted') {
      NotificationLogger.error('WEBPUSH', 'Não é possível agendar - Permissão não concedida');
      return 0;
    }

    NotificationLogger.info('WEBPUSH', '📅 Iniciando agendamento de todas as notificações...');
    
    let scheduledCount = 0;
    const scheduleResults = [];

    for (const notification of NOTIFICATION_SCHEDULE) {
      const result = scheduleNotification(notification);
      if (result) {
        scheduledCount++;
        scheduleResults.push({
          notification: notification.title,
          time: notification.time,
          scheduledFor: result.targetTime
        });
      }
    }
    
    NotificationLogger.success('WEBPUSH', `✅ ${scheduledCount} notificações agendadas`, scheduleResults);
    return scheduledCount;
  }, [isWebPushSupported, scheduleNotification]);

  // Teste de notificação imediata
  const sendTestNotification = useCallback(async (title?: string, body?: string) => {
    const testTitle = title || "🧪 Teste Web Push";
    const testBody = body || "Sistema de notificações funcionando!";
    
    NotificationLogger.info('WEBPUSH', `🧪 Iniciando teste: ${testTitle}`);
    
    // Verificar status primeiro
    await NotificationLogger.checkNotificationStatus();
    
    if (!isWebPushSupported()) {
      NotificationLogger.error('WEBPUSH', 'Teste falhou - Web Push não suportado');
      return false;
    }

    if (Notification.permission !== 'granted') {
      NotificationLogger.warn('WEBPUSH', 'Solicitando permissão para teste...');
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        NotificationLogger.error('WEBPUSH', 'Teste falhou - Permissão negada');
        return false;
      }
    }

    return await sendNotificationViaSW(testTitle, testBody, { test: true });
  }, [isWebPushSupported, requestPermission, sendNotificationViaSW]);

  // Agendar próxima notificação (para teste)
  const scheduleNextNotification = useCallback(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let nextNotification = null;
    let minDelay = Infinity;
    
    for (const notification of NOTIFICATION_SCHEDULE) {
      const [hours, minutes] = notification.time.split(':').map(Number);
      const notificationMinutes = hours * 60 + minutes;
      
      let delay = (notificationMinutes - currentMinutes) * 60 * 1000;
      if (delay <= 0) {
        delay += 24 * 60 * 60 * 1000; // Adicionar 24 horas
      }
      
      if (delay < minDelay) {
        minDelay = delay;
        nextNotification = notification;
      }
    }
    
    if (nextNotification) {
      NotificationLogger.info('WEBPUSH', `⏭️ Agendando próxima notificação para teste: ${nextNotification.title}`);
      const result = scheduleNotification(nextNotification);
      
      if (result) {
        return {
          notification: nextNotification,
          scheduledFor: result.targetTime,
          delay: result.delay
        };
      }
    }
    
    return null;
  }, [scheduleNotification]);

  // Inicializar sistema quando usuário faz login
  useEffect(() => {
    if (user && isWebPushSupported()) {
      NotificationLogger.info('WEBPUSH', '🚀 Inicializando sistema Web Push...');
      
      const initializeSystem = async () => {
        // Registrar Service Worker
        const registration = await registerServiceWorker();
        if (!registration) {
          NotificationLogger.error('WEBPUSH', '❌ Falha na inicialização - SW não registrado');
          return;
        }
        
        // Solicitar permissão
        const hasPermission = await requestPermission();
        if (!hasPermission) {
          NotificationLogger.warn('WEBPUSH', '⚠️ Sistema inicializado sem permissão');
          return;
        }
        
        // Agendar todas as notificações
        const scheduledCount = await scheduleAllNotifications();
        NotificationLogger.success('WEBPUSH', `🎉 Sistema inicializado com sucesso! ${scheduledCount} notificações agendadas`);
      };
      
      initializeSystem();
    }
  }, [user, isWebPushSupported, registerServiceWorker, requestPermission, scheduleAllNotifications]);

  return {
    scheduleAllNotifications,
    scheduleNextNotification,
    sendTestNotification,
    requestPermission,
    isWebPushSupported,
    sendNotificationViaSW
  };
};
