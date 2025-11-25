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

  // Função para enviar notificação imediatamente
  const sendNotificationNow = useCallback((notification: any) => {
    if (!isNotificationSupported()) {
      console.log('🔔 Notificações não suportadas neste navegador');
      return false;
    }
    
    try {
      if (window.Notification && window.Notification.permission === 'granted') {
        console.log(`🔔 Enviando notificação AGORA: "${notification.title}"`);
        
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

  // Sistema de verificação contínua de notificações
  const startNotificationChecker = useCallback(() => {
    if (!user || !isNotificationSupported()) {
      console.log('🔔 Não é possível iniciar verificador - usuário ou suporte não disponível');
      return;
    }
    
    console.log('🔔 Iniciando verificador contínuo de notificações...');
    
    // Verificar a cada minuto se é hora de enviar notificações
    const checkInterval = setInterval(() => {
      if (!window.Notification || window.Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Verificar notificações motivacionais
      motivationalNotifications.forEach((notification) => {
        if (notification.time === currentTime) {
          console.log(`🔔 Hora de enviar notificação motivacional: ${notification.title}`);
          sendNotificationNow(notification);
        }
      });

      // Verificar notificações de conquistas
      achievementNotifications.forEach((notification) => {
        if (notification.time === currentTime) {
          console.log(`🔔 Hora de enviar notificação de conquista: ${notification.title}`);
          sendNotificationNow(notification);
        }
      });

      // Verificar notificações do app
      appNotifications.forEach((notification) => {
        const shouldSend = notification.frequency === 'daily' || 
          (notification.frequency === 'weekly' && now.getDay() === 1); // Segunda-feira
        
        if (shouldSend && notification.time === currentTime) {
          console.log(`🔔 Hora de enviar notificação do app: ${notification.title}`);
          sendNotificationNow(notification);
        }
      });
    }, 60000); // Verificar a cada minuto

    return checkInterval;
  }, [user, sendNotificationNow, isNotificationSupported]);

  // Função para agendar todas as notificações do dia (mantida para compatibilidade)
  const scheduleDailyNotifications = useCallback(() => {
    console.log('🔔 scheduleDailyNotifications chamada - usando verificador contínuo');
    // Agora usamos o verificador contínuo em vez de setTimeout
  }, []);

  // Função para solicitar permissão e configurar notificações
  const setupNotifications = useCallback(async () => {
    if (!isNotificationSupported()) {
      console.log('Este navegador não suporta notificações');
      return false;
    }

    try {
      if (window.Notification.permission === 'granted') {
        console.log('🔔 Permissão já concedida, iniciando verificador...');
        startNotificationChecker();
        return true;
      }

      if (window.Notification.permission !== 'denied') {
        const permission = await window.Notification.requestPermission();
        if (permission === 'granted') {
          console.log('🔔 Permissão concedida, iniciando verificador...');
          startNotificationChecker();
          return true;
        }
      }
    } catch (error) {
      console.warn('Erro ao configurar notificações:', error);
    }

    return false;
  }, [startNotificationChecker, isNotificationSupported]);

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
    let notificationInterval: NodeJS.Timeout | null = null;
    
    if (user) {
      console.log('🔔 Usuário logado, configurando sistema de notificações...');
      
      // Função para tentar configurar notificações
      const trySetupNotifications = async () => {
        try {
          // Verificar se já tem permissão
          if (window.Notification && window.Notification.permission === 'granted') {
            console.log('🔔 Permissão já concedida, iniciando verificador contínuo...');
            notificationInterval = startNotificationChecker();
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

      return () => {
        clearTimeout(timer);
        if (notificationInterval) {
          clearInterval(notificationInterval);
        }
      };
    }
  }, [user, startNotificationChecker]);

  // Monitorar mudanças de permissão e reiniciar verificador se necessário
  useEffect(() => {
    if (user && isNotificationSupported()) {
      console.log('🔔 Monitorando permissões de notificação...');
      
      // Verificar permissões periodicamente e reiniciar se necessário
      const permissionCheckInterval = setInterval(() => {
        if (window.Notification && window.Notification.permission === 'granted') {
          // Verificar se o verificador está rodando, se não, iniciar
          console.log('🔔 Verificação de permissão - sistema ativo');
        } else {
          console.log('🔔 Permissão de notificação perdida ou negada');
        }
      }, 5 * 60 * 1000); // Verificar a cada 5 minutos

      return () => {
        clearInterval(permissionCheckInterval);
      };
    }
  }, [user, isNotificationSupported]);

  // Função para forçar reagendamento (para debug/teste)
  const forceReschedule = useCallback(() => {
    console.log('🔔 Forçando reinício do sistema de notificações...');
    if (window.Notification && window.Notification.permission === 'granted') {
      startNotificationChecker();
    } else {
      console.warn('🔔 Permissão de notificação não concedida');
    }
  }, [startNotificationChecker]);

  // Função para testar o sistema (envia notificação no próximo minuto)
  const testNotificationSystem = useCallback(() => {
    const now = new Date();
    const nextMinute = new Date(now.getTime() + 60000); // 1 minuto no futuro
    const testTime = `${nextMinute.getHours().toString().padStart(2, '0')}:${nextMinute.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`🔔 Teste agendado para ${testTime} (próximo minuto)`);
    
    // Adicionar temporariamente uma notificação de teste
    const testNotification = {
      title: "🧪 Teste do Sistema",
      body: `Notificação de teste enviada às ${testTime}`,
      time: testTime
    };
    
    // Verificar no próximo minuto
    setTimeout(() => {
      sendNotificationNow(testNotification);
    }, 65000); // 65 segundos para garantir que passou do minuto
    
    return testTime;
  }, [sendNotificationNow]);

  return {
    setupNotifications,
    sendImmediateNotification,
    scheduleDailyNotifications,
    forceReschedule,
    testNotificationSystem
  };
};
