/**
 * Hook para Notificações Diárias Agendadas
 * 
 * Envia notificações automáticas durante o dia para:
 * - Motivação matinal
 * - Lembrete de treino
 * - Hidratação
 * - Motivação noturna
 */

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationService from '@/services/notificationService';

// Horários das notificações (formato 24h)
const NOTIFICATION_SCHEDULE = [
  { time: '07:00', type: 'morning' },  // Motivação matinal
  { time: '09:00', type: 'hydration' }, // Hidratação
  { time: '11:30', type: 'workout' },   // Lembrete de treino
  { time: '14:00', type: 'hydration' }, // Hidratação
  { time: '17:00', type: 'workout' },   // Lembrete de treino
  { time: '19:00', type: 'hydration' }, // Hidratação
  { time: '21:00', type: 'evening' },   // Motivação noturna
];

export const useDailyNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('🔔 useDailyNotifications: Iniciando sistema de notificações diárias');

    // Enviar cronograma para o Service Worker
    const setupSchedule = async () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_DAILY_SCHEDULE',
          userId: user.id,
          schedule: NOTIFICATION_SCHEDULE
        });
        console.log('✅ Cronograma de notificações enviado ao Service Worker');
      }
    };

    setupSchedule();

    // Verificar notificações a cada minuto (fallback se SW falhar)
    const checkSchedule = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toDateString();

      console.log(`⏰ Verificando horário: ${currentTime}`);

      NOTIFICATION_SCHEDULE.forEach(schedule => {
        if (currentTime === schedule.time) {
          const sentKey = `daily_notification_${schedule.type}_${today}`;
          const alreadySent = localStorage.getItem(sentKey);

          console.log(`🔍 Horário ${schedule.time} (${schedule.type}) - Já enviada: ${alreadySent}`);

          if (!alreadySent) {
            console.log(`📤 Enviando notificação: ${schedule.type}`);
            sendScheduledNotification(schedule.type);
            localStorage.setItem(sentKey, 'true');

            // Limpar após 24 horas
            setTimeout(() => {
              localStorage.removeItem(sentKey);
            }, 24 * 60 * 60 * 1000);
          }
        }
      });
    };

    const sendScheduledNotification = async (type: string) => {
      console.log(`📢 Enviando notificação agendada: ${type}`);

      switch (type) {
        case 'morning':
          await NotificationService.dailyMotivation(user.id);
          break;
        
        case 'workout':
          await NotificationService.workoutReminder(user.id);
          break;
        
        case 'hydration':
          await NotificationService.hydration(user.id);
          break;
        
        case 'evening':
          await NotificationService.customReminder(
            user.id,
            '🌙 Boa Noite!',
            'Descanse bem para conquistar seus objetivos amanhã!',
            '/dashboard/motivational'
          );
          break;
      }
    };

    // Verificar imediatamente
    checkSchedule();

    // Verificar a cada minuto
    const interval = setInterval(checkSchedule, 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};

export default useDailyNotifications;

