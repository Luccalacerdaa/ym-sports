import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SimpleNotification {
  id: string;
  title: string;
  body: string;
  time: string; // HH:MM format
  type: 'meal' | 'training' | 'hydration' | 'general';
  active: boolean;
}

export const useSimpleNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Verificar permissão de notificação
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Solicitar permissão
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações.');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermissionGranted(permission === 'granted');
    
    if (permission === 'granted') {
      toast.success('Notificações ativadas!');
    } else {
      toast.error('Permissão de notificação negada.');
    }
    
    return permission === 'granted';
  };

  // Enviar notificação local
  const sendNotification = (title: string, body: string, icon?: string) => {
    if (!permissionGranted) return;

    try {
      new Notification(title, {
        body,
        icon: icon || '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'ym-sports-notification'
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  // Configurar notificações padrão
  const setupDefaultNotifications = () => {
    if (!user) return;

    const defaultNotifications: SimpleNotification[] = [
      {
        id: 'breakfast',
        title: '🍳 Hora do Café da Manhã!',
        body: 'Não esqueça de tomar seu café da manhã para começar o dia com energia!',
        time: '07:30',
        type: 'meal',
        active: true
      },
      {
        id: 'lunch',
        title: '🍽️ Hora do Almoço!',
        body: 'Está na hora de fazer uma pausa para o almoço!',
        time: '12:30',
        type: 'meal',
        active: true
      },
      {
        id: 'dinner',
        title: '🍲 Hora do Jantar!',
        body: 'Que tal preparar um jantar saudável?',
        time: '19:30',
        type: 'meal',
        active: true
      },
      {
        id: 'hydration-morning',
        title: '💧 Hidrate-se!',
        body: 'Beba um copo de água para manter-se hidratado!',
        time: '09:00',
        type: 'hydration',
        active: true
      },
      {
        id: 'hydration-afternoon',
        title: '💧 Hora da Água!',
        body: 'Não esqueça de beber água durante a tarde!',
        time: '15:00',
        type: 'hydration',
        active: true
      },
      {
        id: 'training-reminder',
        title: '🏃‍♂️ Hora do Treino!',
        body: 'Está na hora do seu treino! Vamos lá!',
        time: '18:00',
        type: 'training',
        active: true
      }
    ];

    setNotifications(defaultNotifications);
    
    // Salvar no localStorage
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(defaultNotifications));
    
    toast.success('Notificações padrão configuradas!');
  };

  // Carregar notificações do localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`notifications_${user.id}`);
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (error) {
          console.error('Erro ao carregar notificações:', error);
          setupDefaultNotifications();
        }
      } else {
        setupDefaultNotifications();
      }
    }
  }, [user]);

  // Programar notificações diárias
  const scheduleNotifications = () => {
    if (!permissionGranted) return;

    notifications
      .filter(n => n.active)
      .forEach(notification => {
        const [hours, minutes] = notification.time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Se o horário já passou hoje, agendar para amanhã
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
          sendNotification(notification.title, notification.body);
          
          // Reagendar para o próximo dia
          setInterval(() => {
            sendNotification(notification.title, notification.body);
          }, 24 * 60 * 60 * 1000); // 24 horas
        }, delay);
      });
  };

  // Iniciar agendamento quando tiver permissão e notificações
  useEffect(() => {
    if (permissionGranted && notifications.length > 0) {
      scheduleNotifications();
    }
  }, [permissionGranted, notifications]);

  return {
    notifications,
    permissionGranted,
    requestPermission,
    sendNotification,
    setupDefaultNotifications,
    scheduleNotifications
  };
};
