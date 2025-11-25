import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Cronograma de notificações - NOVO CRONOGRAMA ATUALIZADO
const notificationSchedule = [
  // 🌅 MANHÃ
  { time: "07:00", title: "💪 Motivação Matinal", body: "Seu futuro agradece o esforço de hoje.", type: "motivational" },
  { time: "08:30", title: "🏃‍♂️ Treino Disponível", body: "Seu treino personalizado está te esperando!", type: "app" },
  { time: "09:30", title: "💦 Hidratação Matinal", body: "Comece o dia tomando água", type: "motivational" },
  { time: "10:30", title: "📈 Atualize Seu Perfil", body: "Complete suas informações para um portfólio mais atrativo!", type: "app", frequency: "weekly" },
  
  // 🌞 TARDE
  { time: "12:00", title: "🥗 Hora da Nutrição", body: "Cuide da sua alimentação para ter energia!", type: "motivational" },
  { time: "13:00", title: "🏆 Nova Conquista Disponível", body: "Você tem conquistas esperando para serem desbloqueadas!", type: "achievements" },
  { time: "14:00", title: "💧 Hidratação é Fundamental", body: "Mantenha-se hidratado durante o dia!", type: "motivational" },
  { time: "15:30", title: "🎯 Foco no Objetivo", body: "Mantenha o foco nos seus sonhos!", type: "motivational" },
  { time: "16:30", title: "📱 Portfólio Online", body: "Divulgue sua marca e seja descoberto!", type: "app" },
  
  // 🌙 NOITE
  { time: "18:30", title: "🌟 Motivação Noturna", body: "Orgulhe-se do que você fez hoje.", type: "motivational" },
  { time: "19:00", title: "🍽️ Jantar Inteligente", body: "Termine o dia com uma refeição saudável!", type: "motivational" },
  { time: "20:00", title: "🥇 Ranking Atualizado", body: "Veja sua posição no ranking nacional!", type: "app", frequency: "weekly" }
];

export const useRobustNotifications = () => {
  const { user } = useAuth();

  // Verificar se as notificações são suportadas
  const isNotificationSupported = useCallback(() => {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }, []);

  // Função para enviar notificação imediatamente
  const sendImmediateNotification = useCallback((title?: string, body?: string) => {
    if (!isNotificationSupported()) {
      console.log('🔔 Notificações não suportadas neste navegador');
      return false;
    }
    
    const defaultTitle = title || "🔔 YM Sports";
    const defaultBody = body || "Teste de notificação funcionando!";
    
    try {
      if (window.Notification && window.Notification.permission === 'granted') {
        console.log(`🔔 Enviando notificação AGORA: "${defaultTitle}"`);
        
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(defaultTitle, {
            body: defaultBody,
            icon: '/icons/logo.png',
            badge: '/icons/logo.png',
            tag: `ym-sports-${Date.now()}`,
            requireInteraction: false,
            silent: false,
            vibrate: [200, 100, 200],
            data: {
              url: '/dashboard',
              timestamp: Date.now()
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
        }).catch(error => {
          console.error('Erro ao mostrar notificação:', error);
        });
        
        return true;
      } else {
        console.warn('🔔 Permissão de notificação não concedida');
        return false;
      }
    } catch (error) {
      console.warn('Erro ao enviar notificação:', error);
      return false;
    }
  }, [isNotificationSupported]);

  // Função para verificar e enviar notificações pendentes
  const checkPendingNotifications = useCallback(() => {
    if (!isNotificationSupported() || !window.Notification || window.Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay(); // 0 = domingo, 1 = segunda
    
    console.log(`🔔 Verificando notificações para ${currentTime}...`);

    // Verificar se já enviamos notificações hoje
    const today = now.toDateString();
    const sentToday = JSON.parse(localStorage.getItem('notificationsSentToday') || '{}');
    
    if (sentToday.date !== today) {
      // Novo dia, limpar registro
      localStorage.setItem('notificationsSentToday', JSON.stringify({ date: today, sent: [] }));
      sentToday.date = today;
      sentToday.sent = [];
    }

    // Verificar cada notificação do cronograma
    notificationSchedule.forEach(notification => {
      const notificationKey = `${notification.time}-${notification.title}`;
      
      // Verificar se já foi enviada hoje
      if (sentToday.sent.includes(notificationKey)) {
        return;
      }

      // Verificar frequência semanal (apenas segundas-feiras)
      if (notification.frequency === 'weekly' && currentDay !== 1) {
        return;
      }

      // Verificar se é o horário certo (com tolerância de 1 minuto)
      const [targetHour, targetMinute] = notification.time.split(':').map(Number);
      const targetTime = targetHour * 60 + targetMinute;
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Tolerância de 1 minuto para frente e para trás
      if (Math.abs(currentTimeMinutes - targetTime) <= 1) {
        console.log(`🔔 Enviando notificação agendada: ${notification.title}`);
        
        // Enviar notificação
        sendImmediateNotification(notification.title, notification.body);
        
        // Marcar como enviada
        sentToday.sent.push(notificationKey);
        localStorage.setItem('notificationsSentToday', JSON.stringify(sentToday));
      }
    });
  }, [isNotificationSupported, sendImmediateNotification]);

  // Função para solicitar permissão e configurar notificações
  const setupNotifications = useCallback(async () => {
    if (!isNotificationSupported()) {
      console.log('Este navegador não suporta notificações');
      return false;
    }

    try {
      if (window.Notification.permission === 'granted') {
        console.log('🔔 Permissão já concedida, iniciando verificações...');
        return true;
      }

      if (window.Notification.permission !== 'denied') {
        const permission = await window.Notification.requestPermission();
        if (permission === 'granted') {
          console.log('🔔 Permissão concedida, iniciando verificações...');
          return true;
        }
      }

      console.log('🔔 Permissão de notificação negada');
      return false;
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }, [isNotificationSupported]);

  // Função para forçar reagendamento (para debug/teste)
  const forceReschedule = useCallback(() => {
    console.log('🔔 Forçando limpeza e nova verificação...');
    
    // Limpar registros de hoje
    const now = new Date();
    const today = now.toDateString();
    localStorage.setItem('notificationsSentToday', JSON.stringify({ date: today, sent: [] }));
    
    // Verificar imediatamente
    checkPendingNotifications();
  }, [checkPendingNotifications]);

  // Configurar verificações quando o usuário fizer login
  useEffect(() => {
    if (user && isNotificationSupported()) {
      console.log('🔔 Usuário logado, configurando sistema robusto de notificações...');
      
      // Tentar configurar notificações
      setupNotifications().then(success => {
        if (success) {
          // Verificar imediatamente
          checkPendingNotifications();
        }
      });
    }
  }, [user, isNotificationSupported, setupNotifications, checkPendingNotifications]);

  // Verificar notificações a cada minuto
  useEffect(() => {
    if (user && isNotificationSupported()) {
      console.log('🔔 Iniciando verificação contínua de notificações...');
      
      // Verificar imediatamente
      checkPendingNotifications();
      
      // Configurar intervalo de 1 minuto
      const interval = setInterval(() => {
        if (window.Notification && window.Notification.permission === 'granted') {
          checkPendingNotifications();
        }
      }, 60000); // 1 minuto
      
      return () => {
        console.log('🔔 Parando verificação de notificações...');
        clearInterval(interval);
      };
    }
  }, [user, isNotificationSupported, checkPendingNotifications]);

  return {
    setupNotifications,
    sendImmediateNotification,
    checkPendingNotifications,
    forceReschedule,
    isNotificationSupported
  };
};
