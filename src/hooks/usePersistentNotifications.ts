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

export const usePersistentNotifications = () => {
  const { user } = useAuth();

  // Verificar suporte mais detalhado
  const checkNotificationSupport = useCallback(() => {
    const hasNotification = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    
    NotificationLogger.info('PERSISTENT', `Notification API: ${hasNotification}`);
    NotificationLogger.info('PERSISTENT', `Service Worker: ${hasServiceWorker}`);
    NotificationLogger.info('PERSISTENT', `HTTPS/Localhost: ${isSecure}`);
    
    if (!hasNotification) {
      NotificationLogger.error('PERSISTENT', 'Notification API não suportada');
      return false;
    }
    
    if (!hasServiceWorker) {
      NotificationLogger.error('PERSISTENT', 'Service Worker não suportado');
      return false;
    }
    
    if (!isSecure) {
      NotificationLogger.error('PERSISTENT', 'Requer HTTPS ou localhost');
      return false;
    }
    
    return true;
  }, []);

  // Verificar permissão de forma mais robusta
  const checkPermissionStatus = useCallback(async () => {
    if (!checkNotificationSupport()) return 'not-supported';
    
    try {
      const permission = Notification.permission;
      NotificationLogger.info('PERSISTENT', `Permissão atual: ${permission}`);
      
      // Verificar se realmente funciona tentando criar uma notificação
      if (permission === 'granted') {
        try {
          // Teste silencioso - criar notificação sem mostrar
          const testNotification = new Notification('Teste Silencioso', {
            silent: true,
            tag: 'test-permission',
            icon: '/icons/logo.png'
          });
          
          // Fechar imediatamente
          setTimeout(() => {
            testNotification.close();
          }, 1);
          
          NotificationLogger.success('PERSISTENT', '✅ Permissão confirmada funcionando');
          return 'granted';
        } catch (error) {
          NotificationLogger.error('PERSISTENT', '❌ Permissão granted mas não funciona', error);
          return 'denied';
        }
      }
      
      return permission;
    } catch (error) {
      NotificationLogger.error('PERSISTENT', 'Erro ao verificar permissão', error);
      return 'error';
    }
  }, [checkNotificationSupport]);

  // Solicitar permissão de forma mais insistente
  const requestPermissionRobust = useCallback(async () => {
    if (!checkNotificationSupport()) return false;
    
    try {
      NotificationLogger.info('PERSISTENT', '🔐 Solicitando permissão robusta...');
      
      // Verificar estado atual
      let permission = await checkPermissionStatus();
      
      if (permission === 'granted') {
        NotificationLogger.success('PERSISTENT', '✅ Permissão já concedida');
        return true;
      }
      
      if (permission === 'denied') {
        NotificationLogger.error('PERSISTENT', '❌ Permissão negada - usuário deve habilitar manualmente');
        return false;
      }
      
      // Solicitar permissão
      const result = await Notification.requestPermission();
      NotificationLogger.info('PERSISTENT', `Resultado da solicitação: ${result}`);
      
      if (result === 'granted') {
        // Verificar se realmente funciona
        const finalCheck = await checkPermissionStatus();
        if (finalCheck === 'granted') {
          NotificationLogger.success('PERSISTENT', '✅ Permissão concedida e funcionando');
          return true;
        } else {
          NotificationLogger.error('PERSISTENT', '❌ Permissão concedida mas não funciona');
          return false;
        }
      } else {
        NotificationLogger.error('PERSISTENT', `❌ Permissão não concedida: ${result}`);
        return false;
      }
    } catch (error) {
      NotificationLogger.error('PERSISTENT', 'Erro ao solicitar permissão', error);
      return false;
    }
  }, [checkNotificationSupport, checkPermissionStatus]);

  // Enviar notificação usando múltiplas abordagens
  const sendNotificationMultiMethod = useCallback(async (title: string, body: string, data?: any) => {
    NotificationLogger.info('PERSISTENT', `📤 Enviando notificação multi-método: ${title}`);
    
    const permission = await checkPermissionStatus();
    if (permission !== 'granted') {
      NotificationLogger.error('PERSISTENT', `❌ Sem permissão para enviar: ${permission}`);
      return false;
    }
    
    let success = false;
    
    // Método 1: Service Worker showNotification
    try {
      NotificationLogger.info('PERSISTENT', '🔄 Tentativa 1: Service Worker');
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body,
        icon: '/icons/logo.png',
        badge: '/icons/logo.png',
        tag: `ym-sports-persistent-${Date.now()}`,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          url: '/dashboard',
          timestamp: Date.now(),
          source: 'persistent',
          ...data
        },
        actions: [
          {
            action: 'open',
            title: 'Abrir App'
          }
        ]
      });
      
      NotificationLogger.success('PERSISTENT', '✅ Método 1 (SW) funcionou');
      success = true;
    } catch (error) {
      NotificationLogger.warn('PERSISTENT', '⚠️ Método 1 (SW) falhou', error);
    }
    
    // Método 2: Notification API direta (fallback)
    if (!success) {
      try {
        NotificationLogger.info('PERSISTENT', '🔄 Tentativa 2: Notification API');
        
        const notification = new Notification(title, {
          body,
          icon: '/icons/logo.png',
          tag: `ym-sports-direct-${Date.now()}`,
          silent: false,
          data: {
            url: '/dashboard',
            timestamp: Date.now(),
            source: 'direct',
            ...data
          }
        });
        
        // Configurar clique
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        NotificationLogger.success('PERSISTENT', '✅ Método 2 (Direct) funcionou');
        success = true;
      } catch (error) {
        NotificationLogger.error('PERSISTENT', '❌ Método 2 (Direct) falhou', error);
      }
    }
    
    return success;
  }, [checkPermissionStatus]);

  // Agendar notificação com persistência
  const scheduleNotificationPersistent = useCallback((notification: any) => {
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
    
    NotificationLogger.info('PERSISTENT', `⏰ Agendando persistente: ${notification.title}`, {
      horario: notification.time,
      agendadoPara: targetTimeStr,
      delayMs: delay,
      delayMinutos: Math.round(delay / 1000 / 60)
    });
    
    // Verificar frequência semanal
    if (notification.frequency === 'weekly') {
      const targetDay = targetTime.getDay();
      if (targetDay !== 1) { // Não é segunda-feira
        NotificationLogger.info('PERSISTENT', `⏭️ Pulando notificação semanal: ${notification.title}`);
        return null;
      }
    }
    
    // Salvar no localStorage para persistência
    const scheduledKey = `scheduled_${notification.time}_${notification.title}`;
    const scheduledData = {
      notification,
      targetTime: targetTime.getTime(),
      scheduled: Date.now()
    };
    
    try {
      localStorage.setItem(scheduledKey, JSON.stringify(scheduledData));
      NotificationLogger.info('PERSISTENT', `💾 Notificação salva no localStorage: ${scheduledKey}`);
    } catch (error) {
      NotificationLogger.warn('PERSISTENT', 'Erro ao salvar no localStorage', error);
    }
    
    // Agendar com setTimeout
    const timeoutId = setTimeout(async () => {
      NotificationLogger.info('PERSISTENT', `🔔 Executando notificação persistente: ${notification.title}`);
      
      const success = await sendNotificationMultiMethod(
        notification.title, 
        notification.body, 
        { scheduled: true, originalTime: notification.time }
      );
      
      if (success) {
        NotificationLogger.success('PERSISTENT', `✅ Notificação persistente entregue: ${notification.title}`);
        
        // Remover do localStorage após envio
        try {
          localStorage.removeItem(scheduledKey);
          NotificationLogger.info('PERSISTENT', `🗑️ Removido do localStorage: ${scheduledKey}`);
        } catch (error) {
          NotificationLogger.warn('PERSISTENT', 'Erro ao remover do localStorage', error);
        }
      } else {
        NotificationLogger.error('PERSISTENT', `❌ Falha na entrega persistente: ${notification.title}`);
      }
    }, delay);
    
    return {
      timeoutId,
      targetTime: targetTimeStr,
      delay,
      scheduledKey
    };
  }, [sendNotificationMultiMethod]);

  // Verificar e recriar notificações perdidas
  const checkAndRecreateScheduled = useCallback(async () => {
    NotificationLogger.info('PERSISTENT', '🔍 Verificando notificações agendadas perdidas...');
    
    const now = Date.now();
    let recreatedCount = 0;
    
    // Verificar localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('scheduled_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const targetTime = data.targetTime;
          
          if (targetTime && targetTime > now) {
            // Notificação ainda é válida, reagendar
            NotificationLogger.info('PERSISTENT', `🔄 Reagendando notificação perdida: ${data.notification.title}`);
            scheduleNotificationPersistent(data.notification);
            recreatedCount++;
          } else {
            // Notificação expirada, remover
            localStorage.removeItem(key);
            NotificationLogger.info('PERSISTENT', `🗑️ Removendo notificação expirada: ${key}`);
          }
        } catch (error) {
          NotificationLogger.warn('PERSISTENT', `Erro ao processar ${key}`, error);
          localStorage.removeItem(key);
        }
      }
    }
    
    NotificationLogger.success('PERSISTENT', `✅ ${recreatedCount} notificações reagendadas`);
    return recreatedCount;
  }, [scheduleNotificationPersistent]);

  // Agendar todas as notificações
  const scheduleAllPersistent = useCallback(async () => {
    const permission = await checkPermissionStatus();
    if (permission !== 'granted') {
      NotificationLogger.error('PERSISTENT', 'Não é possível agendar - sem permissão');
      return 0;
    }
    
    NotificationLogger.info('PERSISTENT', '📅 Agendando todas as notificações persistentes...');
    
    let scheduledCount = 0;
    
    for (const notification of NOTIFICATION_SCHEDULE) {
      const result = scheduleNotificationPersistent(notification);
      if (result) {
        scheduledCount++;
      }
    }
    
    NotificationLogger.success('PERSISTENT', `✅ ${scheduledCount} notificações persistentes agendadas`);
    return scheduledCount;
  }, [checkPermissionStatus, scheduleNotificationPersistent]);

  // Teste de notificação imediata
  const sendTestNotificationPersistent = useCallback(async (title?: string, body?: string) => {
    const testTitle = title || "🧪 Teste Persistente";
    const testBody = body || "Sistema de notificações persistentes funcionando!";
    
    NotificationLogger.info('PERSISTENT', `🧪 Teste persistente: ${testTitle}`);
    
    const permission = await checkPermissionStatus();
    if (permission !== 'granted') {
      NotificationLogger.error('PERSISTENT', 'Teste falhou - sem permissão');
      
      // Tentar solicitar permissão
      const granted = await requestPermissionRobust();
      if (!granted) {
        return false;
      }
    }
    
    return await sendNotificationMultiMethod(testTitle, testBody, { test: true });
  }, [checkPermissionStatus, requestPermissionRobust, sendNotificationMultiMethod]);

  // Agendar próxima notificação para teste
  const scheduleNextPersistent = useCallback(() => {
    const now = new Date();
    const nextMinute = new Date(now.getTime() + 60000); // 1 minuto no futuro
    
    const testNotification = {
      time: `${nextMinute.getHours().toString().padStart(2, '0')}:${nextMinute.getMinutes().toString().padStart(2, '0')}`,
      title: "🧪 Teste Próxima Notificação",
      body: "Esta notificação foi agendada para 1 minuto no futuro!"
    };
    
    NotificationLogger.info('PERSISTENT', `⏭️ Agendando teste para próximo minuto: ${testNotification.time}`);
    
    const result = scheduleNotificationPersistent(testNotification);
    
    if (result) {
      return {
        notification: testNotification,
        scheduledFor: result.targetTime,
        delay: result.delay
      };
    }
    
    return null;
  }, [scheduleNotificationPersistent]);

  // Inicializar sistema quando usuário faz login
  useEffect(() => {
    if (user && checkNotificationSupport()) {
      NotificationLogger.info('PERSISTENT', '🚀 Inicializando sistema persistente...');
      
      const initializeSystem = async () => {
        // Verificar e recriar notificações perdidas
        await checkAndRecreateScheduled();
        
        // Verificar permissão
        const permission = await checkPermissionStatus();
        
        if (permission === 'granted') {
          // Agendar todas as notificações
          const scheduledCount = await scheduleAllPersistent();
          NotificationLogger.success('PERSISTENT', `🎉 Sistema persistente inicializado! ${scheduledCount} notificações agendadas`);
        } else {
          NotificationLogger.warn('PERSISTENT', '⚠️ Sistema inicializado sem permissão - use os botões de teste para conceder');
        }
      };
      
      initializeSystem();
    }
  }, [user, checkNotificationSupport, checkAndRecreateScheduled, checkPermissionStatus, scheduleAllPersistent]);

  return {
    scheduleAllPersistent,
    scheduleNextPersistent,
    sendTestNotificationPersistent,
    requestPermissionRobust,
    checkPermissionStatus,
    checkNotificationSupport,
    sendNotificationMultiMethod
  };
};
