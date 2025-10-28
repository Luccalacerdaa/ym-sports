import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useEventNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Verificar eventos a cada 5 minutos
    const checkUpcomingEvents = async () => {
      try {
        const now = new Date();
        const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
        
        // Buscar eventos que começam nos próximos 15 minutos
        const { data: upcomingEvents, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_date', now.toISOString())
          .lte('start_date', in15Minutes.toISOString());

        if (error) throw error;

        // Enviar notificação para cada evento próximo
        for (const event of upcomingEvents || []) {
          const eventDate = new Date(event.start_date);
          const minutesUntil = Math.round((eventDate.getTime() - now.getTime()) / 60000);
          
          // Verificar se já enviou notificação para este evento (localStorage)
          const notificationKey = `event_notified_${event.id}`;
          const alreadyNotified = localStorage.getItem(notificationKey);
          
          if (!alreadyNotified && minutesUntil <= 15) {
            // Enviar notificação local
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`📅 ${event.title}`, {
                body: `Começa em ${minutesUntil} minutos${event.location ? ` - ${event.location}` : ''}`,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-96.png',
                tag: `event-${event.id}`,
                requireInteraction: true,
              });
            }

            // Enviar notificação push
            try {
              await fetch('/api/send-notification-to-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.id,
                  title: `📅 ${event.title}`,
                  body: `Começa em ${minutesUntil} minutos${event.location ? ` - ${event.location}` : ''}`,
                  url: '/dashboard/calendar',
                  icon: '/icons/icon-192.png',
                  data: { 
                    type: 'event_reminder', 
                    event_id: event.id,
                    event_title: event.title
                  }
                })
              });
            } catch (error) {
              console.error('Erro ao enviar notificação push:', error);
            }

            // Marcar como notificado
            localStorage.setItem(notificationKey, 'true');
            
            // Limpar após 1 dia
            setTimeout(() => {
              localStorage.removeItem(notificationKey);
            }, 24 * 60 * 60 * 1000);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar eventos:', error);
      }
    };

    // Verificar imediatamente
    checkUpcomingEvents();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkUpcomingEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};

