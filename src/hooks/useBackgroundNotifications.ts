import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

export const useBackgroundNotifications = () => {
  const { user } = useAuth();

  // Verificar se as notificações são suportadas
  const isNotificationSupported = useCallback(() => {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }, []);

  // Função para calcular delay até um horário específico
  const calculateDelayToTime = useCallback((timeString: string) => {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agendar para amanhã
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    return targetTime.getTime() - now.getTime();
  }, []);

  // Função para agendar uma notificação específica
  const scheduleNotification = useCallback((notification: any) => {
    if (!isNotificationSupported()) return;
    
    const delay = calculateDelayToTime(notification.time);
    const now = new Date();
    const currentDay = now.getDay();
    
    // Verificar frequência semanal
    if (notification.frequency === 'weekly' && currentDay !== 1) {
      console.log(`[BG] Pulando notificação semanal: ${notification.title} (não é segunda-feira)`);
      return;
    }
    
    console.log(`[BG] Agendando: ${notification.title} para ${new Date(Date.now() + delay).toLocaleString()}`);
    
    // Usar setTimeout para agendar
    setTimeout(async () => {
      try {
        if (window.Notification && window.Notification.permission === 'granted') {
          console.log(`[BG] Enviando notificação: ${notification.title}`);
          
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/icons/logo.png',
            badge: '/icons/logo.png',
            tag: `ym-sports-bg-${Date.now()}`,
            requireInteraction: false,
            silent: false,
            vibrate: [200, 100, 200],
            data: {
              url: '/dashboard',
              timestamp: Date.now(),
              source: 'background'
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
          
          console.log(`[BG] ✅ Notificação enviada: ${notification.title}`);
        }
      } catch (error) {
        console.error(`[BG] Erro ao enviar notificação ${notification.title}:`, error);
      }
    }, delay);
    
    return delay;
  }, [isNotificationSupported, calculateDelayToTime]);

  // Função para agendar todas as notificações do dia
  const scheduleAllNotifications = useCallback(() => {
    if (!isNotificationSupported()) {
      console.log('[BG] Notificações não suportadas');
      return;
    }

    if (!window.Notification || window.Notification.permission !== 'granted') {
      console.log('[BG] Permissão de notificação não concedida');
      return;
    }

    console.log('[BG] 🔔 Agendando todas as notificações do dia...');
    
    let scheduledCount = 0;
    NOTIFICATION_SCHEDULE.forEach(notification => {
      const delay = scheduleNotification(notification);
      if (delay !== undefined) {
        scheduledCount++;
      }
    });
    
    console.log(`[BG] ✅ ${scheduledCount} notificações agendadas para hoje!`);
    return scheduledCount;
  }, [isNotificationSupported, scheduleNotification]);

  // Função para enviar notificação de teste imediata
  const sendTestNotification = useCallback(async (title?: string, body?: string) => {
    if (!isNotificationSupported()) {
      console.log('[BG] Notificações não suportadas');
      return false;
    }
    
    try {
      if (window.Notification && window.Notification.permission === 'granted') {
        const testTitle = title || "🔔 Teste Background";
        const testBody = body || "Sistema de notificações em segundo plano funcionando!";
        
        console.log(`[BG] Enviando teste: ${testTitle}`);
        
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(testTitle, {
          body: testBody,
          icon: '/icons/logo.png',
          badge: '/icons/logo.png',
          tag: `ym-sports-test-${Date.now()}`,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
          data: {
            url: '/dashboard',
            timestamp: Date.now(),
            source: 'test'
          }
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('[BG] Erro ao enviar notificação de teste:', error);
      return false;
    }
  }, [isNotificationSupported]);

  // Função para agendar próxima notificação (para teste)
  const scheduleNextNotification = useCallback(() => {
    if (!isNotificationSupported()) return null;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Encontrar a próxima notificação
    let nextNotification = null;
    let minDelay = Infinity;
    
    NOTIFICATION_SCHEDULE.forEach(notification => {
      const [hours, minutes] = notification.time.split(':').map(Number);
      const notificationMinutes = hours * 60 + minutes;
      
      // Calcular delay (se já passou hoje, será para amanhã)
      let delay = (notificationMinutes - currentMinutes) * 60 * 1000; // converter para ms
      if (delay <= 0) {
        delay += 24 * 60 * 60 * 1000; // adicionar 24 horas
      }
      
      if (delay < minDelay) {
        minDelay = delay;
        nextNotification = notification;
      }
    });
    
    if (nextNotification) {
      console.log(`[BG] Agendando próxima notificação: ${nextNotification.title} em ${Math.round(minDelay/1000/60)} minutos`);
      
      setTimeout(async () => {
        try {
          if (window.Notification && window.Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(nextNotification.title, {
              body: nextNotification.body,
              icon: '/icons/logo.png',
              badge: '/icons/logo.png',
              tag: `ym-sports-next-${Date.now()}`,
              requireInteraction: false,
              silent: false,
              vibrate: [200, 100, 200],
              data: {
                url: '/dashboard',
                timestamp: Date.now(),
                source: 'scheduled'
              }
            });
          }
        } catch (error) {
          console.error('[BG] Erro ao enviar próxima notificação:', error);
        }
      }, minDelay);
      
      return {
        notification: nextNotification,
        delay: minDelay,
        time: new Date(Date.now() + minDelay).toLocaleTimeString()
      };
    }
    
    return null;
  }, [isNotificationSupported]);

  // Função para solicitar permissão
  const requestPermission = useCallback(async () => {
    if (!isNotificationSupported()) {
      return false;
    }

    try {
      if (window.Notification.permission === 'granted') {
        return true;
      }

      if (window.Notification.permission !== 'denied') {
        const permission = await window.Notification.requestPermission();
        return permission === 'granted';
      }

      return false;
    } catch (error) {
      console.error('[BG] Erro ao solicitar permissão:', error);
      return false;
    }
  }, [isNotificationSupported]);

  // Configurar notificações quando o usuário fizer login
  useEffect(() => {
    if (user && isNotificationSupported()) {
      console.log('[BG] 🔔 Usuário logado, configurando notificações em segundo plano...');
      
      requestPermission().then(hasPermission => {
        if (hasPermission) {
          scheduleAllNotifications();
        } else {
          console.log('[BG] Permissão de notificação não concedida');
        }
      });
    }
  }, [user, isNotificationSupported, requestPermission, scheduleAllNotifications]);

  return {
    scheduleAllNotifications,
    scheduleNextNotification,
    sendTestNotification,
    requestPermission,
    isNotificationSupported
  };
};
