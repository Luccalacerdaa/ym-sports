import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import NotificationService from '@/services/notificationService';

export const useEventNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // ⚠️ DESATIVADO: GitHub Actions agora cuida das notificações de eventos
    // Isso evita notificações duplicadas ao abrir o app
    console.log('ℹ️ Notificações de eventos gerenciadas pelo GitHub Actions');
    return; // Desativa o hook
    
    // Verificar eventos a cada 5 minutos
    const checkUpcomingEvents = async () => {
      try {
        const now = new Date();
        const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
        const exactStart = new Date(now.getTime());
        
        // Buscar eventos que começam nos próximos 30 minutos ou estão começando agora
        const { data: upcomingEvents, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_date', now.toISOString())
          .lte('start_date', in30Minutes.toISOString());

        if (error) throw error;

        // Enviar notificação para cada evento próximo
        for (const event of upcomingEvents || []) {
          const eventDate = new Date(event.start_date);
          const minutesUntil = Math.round((eventDate.getTime() - now.getTime()) / 60000);
          
          // Verificar se já enviou notificação para este evento (localStorage)
          const notificationKey = `event_notified_${event.id}`;
          const notificationStartKey = `event_start_notified_${event.id}`;
          const alreadyNotified = localStorage.getItem(notificationKey);
          const alreadyNotifiedStart = localStorage.getItem(notificationStartKey);
          
          // Notificar 30 minutos antes ou quando o evento estiver começando
          if (!alreadyNotified && minutesUntil <= 30 && minutesUntil > 5) {
            // Enviar notificação push
            await NotificationService.eventReminder(user.id, event.title, minutesUntil, event.location);

            // Marcar como notificado
            localStorage.setItem(notificationKey, 'true');
            
            // Limpar após 1 dia
            setTimeout(() => {
              localStorage.removeItem(notificationKey);
            }, 24 * 60 * 60 * 1000);
          }
          
          // Notificar quando o evento estiver começando (entre 0 e 5 minutos)
          if (!alreadyNotifiedStart && minutesUntil <= 5 && minutesUntil >= 0) {
            // Enviar notificação push
            await NotificationService.eventReminder(user.id, event.title, minutesUntil, event.location);

            // Marcar como notificado
            localStorage.setItem(notificationStartKey, 'true');
            
            // Limpar após 1 dia
            setTimeout(() => {
              localStorage.removeItem(notificationStartKey);
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

