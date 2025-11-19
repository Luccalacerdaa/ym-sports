import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Notificações motivacionais
const motivationalNotifications = [
  {
    title: "💪 Hora de Treinar!",
    body: "Seu corpo é seu templo. Que tal um treino hoje?",
    time: "07:00"
  },
  {
    title: "🔥 Motivação Matinal",
    body: "Cristiano Ronaldo treina todos os dias. E você?",
    time: "08:00"
  },
  {
    title: "⚽ Lembre-se do Seu Sonho",
    body: "Cada treino te aproxima do seu objetivo!",
    time: "09:30"
  },
  {
    title: "🏆 Mentalidade Vencedora",
    body: "Messi não desistiu aos 13 anos. Você também não deve!",
    time: "11:00"
  },
  {
    title: "🥗 Hora da Nutrição",
    body: "Seu corpo precisa de combustível de qualidade!",
    time: "12:00"
  },
  {
    title: "💧 Hidratação é Fundamental",
    body: "Já bebeu água suficiente hoje? Seu desempenho agradece!",
    time: "14:00"
  },
  {
    title: "🎯 Foco no Objetivo",
    body: "Pelé disse: 'Sucesso é 99% transpiração e 1% inspiração'",
    time: "15:30"
  },
  {
    title: "⚡ Energia da Tarde",
    body: "Que tal assistir um vídeo motivacional?",
    time: "16:00"
  },
  {
    title: "🌟 Você é Único",
    body: "Ronaldinho mostrou que ser diferente é ser especial!",
    time: "17:30"
  },
  {
    title: "📊 Acompanhe Seu Progresso",
    body: "Veja suas conquistas no app e celebre cada vitória!",
    time: "18:00"
  },
  {
    title: "🍽️ Jantar Inteligente",
    body: "Confira seu plano nutricional para uma refeição perfeita!",
    time: "19:00"
  },
  {
    title: "🧠 Mentalidade Noturna",
    body: "Visualize seus objetivos antes de dormir. Sonhe grande!",
    time: "21:00"
  }
];

// Notificações específicas do app
const appNotifications = [
  {
    title: "📈 Atualize Seu Perfil",
    body: "Complete suas informações para um portfólio mais atrativo!",
    time: "10:00",
    frequency: "weekly"
  },
  {
    title: "🏃‍♂️ Novo Treino Disponível",
    body: "Criamos um treino personalizado para você!",
    time: "08:30",
    frequency: "daily"
  },
  {
    title: "🥇 Ranking Atualizado",
    body: "Veja sua posição no ranking nacional!",
    time: "20:00",
    frequency: "weekly"
  },
  {
    title: "🎨 YM Design",
    body: "Que tal criar uma arte profissional para suas redes?",
    time: "13:00",
    frequency: "weekly"
  },
  {
    title: "📱 Portfólio em Destaque",
    body: "Seu portfólio teve novas visualizações!",
    time: "16:30",
    frequency: "weekly"
  }
];

// Notificações de conquistas
const achievementNotifications = [
  {
    title: "🏆 Nova Conquista Disponível",
    body: "Complete mais treinos para desbloquear uma nova conquista!",
    time: "12:30"
  },
  {
    title: "⭐ Sequência de Treinos",
    body: "Você está em uma boa sequência! Continue assim!",
    time: "18:30"
  },
  {
    title: "📊 Meta de Nutrição",
    body: "Que tal criar um novo plano nutricional?",
    time: "11:30"
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
    if (!isNotificationSupported()) return;
    
    try {
      setTimeout(() => {
        if (window.Notification && window.Notification.permission === 'granted') {
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
          });
        }
      }, delay);
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
    if (!user || !isNotificationSupported()) return;
    
    try {
      if (!window.Notification || window.Notification.permission !== 'granted') return;

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

    // Agendar notificações motivacionais
    motivationalNotifications.forEach((notification) => {
      const delay = calculateDelay(notification.time);
      scheduleNotification(notification, delay);
    });

    // Agendar notificações de conquistas (aleatórias)
    achievementNotifications.forEach((notification, index) => {
      const randomHour = Math.floor(Math.random() * 12) + 9; // Entre 9h e 21h
      const randomMinute = Math.floor(Math.random() * 60);
      const timeString = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`;
      
      const delay = calculateDelay(timeString);
      scheduleNotification(notification, delay);
    });

    // Agendar notificações do app
    appNotifications.forEach((notification) => {
      const shouldSchedule = notification.frequency === 'daily' || 
        (notification.frequency === 'weekly' && new Date().getDay() === 1); // Segunda-feira
      
      if (shouldSchedule) {
        const delay = calculateDelay(notification.time);
        scheduleNotification(notification, delay);
      }
    });

      console.log('✅ Notificações diárias agendadas com sucesso!');
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
      // Aguardar um pouco para garantir que o service worker está pronto
      const timer = setTimeout(() => {
        setupNotifications();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, setupNotifications]);

  // Reagendar notificações diariamente
  useEffect(() => {
    if (user && isNotificationSupported() && window.Notification && window.Notification.permission === 'granted') {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const dailyTimer = setTimeout(() => {
        scheduleDailyNotifications();
        
        // Configurar intervalo diário
        const dailyInterval = setInterval(() => {
          scheduleDailyNotifications();
        }, 24 * 60 * 60 * 1000); // 24 horas
        
        return () => clearInterval(dailyInterval);
      }, msUntilMidnight);

      return () => clearTimeout(dailyTimer);
    }
  }, [user, scheduleDailyNotifications, isNotificationSupported]);

  return {
    setupNotifications,
    sendImmediateNotification,
    scheduleDailyNotifications
  };
};
