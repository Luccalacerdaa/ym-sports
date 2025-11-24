import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Notificações motivacionais - NOVO CRONOGRAMA
const motivationalNotifications = [
  // 🌅 MANHÃ (4 notificações)
  {
    title: "💪 Motivação Matinal",
    body: "Seu futuro agradece o esforço de hoje.",
    time: "07:00"
  },
  {
    title: "💦 Hidratação Matinal", 
    body: "Comece o dia tomando água",
    time: "09:30"
  },
  
  // 🌞 TARDE (3 notificações)
  {
    title: "🥗 Hora da Nutrição",
    body: "Cuide da sua alimentação para ter energia!",
    time: "12:00"
  },
  {
    title: "💧 Hidratação é Fundamental",
    body: "Mantenha-se hidratado durante o dia!",
    time: "14:00"
  },
  {
    title: "🎯 Foco no Objetivo",
    body: "Mantenha o foco nos seus sonhos!",
    time: "15:30"
  },
  
  // 🌙 NOITE (2 notificações)
  {
    title: "🌟 Motivação Noturna",
    body: "Orgulhe-se do que você fez hoje.",
    time: "18:30"
  },
  {
    title: "🍽️ Jantar Inteligente",
    body: "Termine o dia com uma refeição saudável!",
    time: "19:00"
  }
];

// Notificações específicas do app - NOVO CRONOGRAMA
const appNotifications = [
  {
    title: "🏃‍♂️ Treino Disponível",
    body: "Seu treino personalizado está te esperando!",
    time: "08:30",
    frequency: "daily"
  },
  {
    title: "📈 Atualize Seu Perfil",
    body: "Complete suas informações para um portfólio mais atrativo!",
    time: "10:30",
    frequency: "weekly"
  },
  {
    title: "📱 Portfólio Online",
    body: "Divulgue sua marca e seja descoberto!",
    time: "16:30",
    frequency: "daily"
  },
  {
    title: "🥇 Ranking Atualizado",
    body: "Veja sua posição no ranking nacional!",
    time: "20:00",
    frequency: "weekly"
  }
];

// Notificações de conquistas - NOVO CRONOGRAMA
const achievementNotifications = [
  {
    title: "🏆 Nova Conquista Disponível",
    body: "Você tem conquistas esperando para serem desbloqueadas!",
    time: "13:00"
  }
];

export const useDailyNotifications = () => {
  const { user } = useAuth();

  // Verificar se as notificações são suportadas
  const isNotificationSupported = useCallback(() => {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }, []);

  // Função para agendar uma notificação
  const scheduleNotification = useCallback((notification: any, delay: number) => {
    if (!isNotificationSupported()) {
      console.log('🔔 Notificações não suportadas neste navegador');
      return;
    }
    
    try {
      console.log(`🔔 Agendando notificação: "${notification.title}" para ${Math.round(delay/1000/60)} minutos`);
      
      const timeoutId = setTimeout(() => {
        if (window.Notification && window.Notification.permission === 'granted') {
          console.log(`🔔 Enviando notificação: "${notification.title}"`);
          
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(notification.title, {
              body: notification.body,
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
                  title: 'Abrir App',
                  icon: '/icons/logo.png'
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
        } else {
          console.warn('🔔 Permissão de notificação não concedida');
        }
      }, delay);
      
      // Salvar o ID do timeout para possível cancelamento
      return timeoutId;
    } catch (error) {
      console.warn('Erro ao agendar notificação:', error);
    }
  }, [isNotificationSupported]);

  // Função para calcular delay até um horário específico
  const calculateDelay = useCallback((timeString: string) => {
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

  // Função para agendar todas as notificações do dia
  const scheduleDailyNotifications = useCallback(() => {
    if (!user || !isNotificationSupported()) {
      console.log('🔔 Não é possível agendar notificações - usuário ou suporte não disponível');
      return;
    }
    
    try {
      if (!window.Notification || window.Notification.permission !== 'granted') {
        console.log('🔔 Permissão de notificação não concedida');
        return;
      }

      console.log('🔔 Iniciando agendamento de notificações diárias...');

      // Limpar notificações anteriores
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.getNotifications().then((notifications) => {
            notifications.forEach((notification) => {
              if (notification.tag?.startsWith('ym-sports-')) {
                notification.close();
              }
            });
          });
        });
      }

      let scheduledCount = 0;

      // Agendar notificações motivacionais
      motivationalNotifications.forEach((notification) => {
        const delay = calculateDelay(notification.time);
        if (delay > 0) { // Só agendar se for no futuro
          scheduleNotification(notification, delay);
          scheduledCount++;
        }
      });

      // Agendar notificações de conquistas (horário fixo)
      achievementNotifications.forEach((notification) => {
        const delay = calculateDelay(notification.time);
        if (delay > 0) {
          scheduleNotification(notification, delay);
          scheduledCount++;
        }
      });

      // Agendar notificações do app
      appNotifications.forEach((notification) => {
        const shouldSchedule = notification.frequency === 'daily' || 
          (notification.frequency === 'weekly' && new Date().getDay() === 1); // Segunda-feira
        
        if (shouldSchedule) {
          const delay = calculateDelay(notification.time);
          if (delay > 0) {
            scheduleNotification(notification, delay);
            scheduledCount++;
          }
        }
      });

      console.log(`✅ ${scheduledCount} notificações agendadas com sucesso para hoje!`);
    } catch (error) {
      console.warn('Erro ao agendar notificações diárias:', error);
    }
  }, [user, calculateDelay, scheduleNotification, isNotificationSupported]);

  // Função para solicitar permissão e configurar notificações
  const setupNotifications = useCallback(async () => {
    if (!isNotificationSupported()) {
      console.log('Este navegador não suporta notificações');
      return false;
    }

    try {
      if (window.Notification.permission === 'granted') {
        scheduleDailyNotifications();
        return true;
      }

      if (window.Notification.permission !== 'denied') {
        const permission = await window.Notification.requestPermission();
        if (permission === 'granted') {
          scheduleDailyNotifications();
          return true;
        }
      }
    } catch (error) {
      console.warn('Erro ao configurar notificações:', error);
    }

    return false;
  }, [scheduleDailyNotifications, isNotificationSupported]);

  // Função para enviar notificação imediata
  const sendImmediateNotification = useCallback((title: string, body: string) => {
    if (!isNotificationSupported()) return;
    
    try {
      if (window.Notification && window.Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/icons/logo.png',
            badge: '/icons/logo.png',
            tag: `ym-sports-immediate-${Date.now()}`,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: {
              url: '/dashboard',
              timestamp: Date.now()
            }
          });
        });
      }
    } catch (error) {
      console.warn('Erro ao enviar notificação imediata:', error);
    }
  }, [isNotificationSupported]);

  // Configurar notificações quando o usuário fizer login
  useEffect(() => {
    if (user) {
      console.log('🔔 Usuário logado, configurando notificações...');
      
      // Função para tentar configurar notificações
      const trySetupNotifications = async () => {
        try {
          // Verificar se já tem permissão
          if (window.Notification && window.Notification.permission === 'granted') {
            console.log('🔔 Permissão já concedida, agendando notificações imediatamente...');
            scheduleDailyNotifications();
          } else {
            console.log('🔔 Permissão não concedida ainda, aguardando...');
          }
        } catch (error) {
          console.warn('Erro ao configurar notificações:', error);
        }
      };

      // Aguardar um pouco para garantir que o service worker está pronto
      const timer = setTimeout(() => {
        trySetupNotifications();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, scheduleDailyNotifications]);

  // Reagendar notificações diariamente e verificar periodicamente
  useEffect(() => {
    if (user && isNotificationSupported()) {
      console.log('🔔 Configurando reagendamento diário de notificações...');
      
      // Verificar e reagendar a cada 30 minutos
      const checkInterval = setInterval(() => {
        if (window.Notification && window.Notification.permission === 'granted') {
          console.log('🔔 Verificação periódica - reagendando notificações...');
          scheduleDailyNotifications();
        }
      }, 30 * 60 * 1000); // 30 minutos
      
      // Reagendamento diário à meia-noite
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      console.log(`🔔 Próximo reagendamento em ${Math.round(msUntilMidnight/1000/60/60)} horas`);
      
      const dailyTimer = setTimeout(() => {
        console.log('🔔 Reagendando notificações para o novo dia...');
        scheduleDailyNotifications();
        
        // Configurar intervalo diário
        const dailyInterval = setInterval(() => {
          console.log('🔔 Reagendamento diário automático...');
          scheduleDailyNotifications();
        }, 24 * 60 * 60 * 1000); // 24 horas
        
        return () => clearInterval(dailyInterval);
      }, msUntilMidnight);

      return () => {
        clearTimeout(dailyTimer);
        clearInterval(checkInterval);
      };
    }
  }, [user, scheduleDailyNotifications, isNotificationSupported]);

  // Função para forçar reagendamento (para debug/teste)
  const forceReschedule = useCallback(() => {
    console.log('🔔 Forçando reagendamento de todas as notificações...');
    scheduleDailyNotifications();
  }, [scheduleDailyNotifications]);

  return {
    setupNotifications,
    sendImmediateNotification,
    scheduleDailyNotifications,
    forceReschedule
  };
};
