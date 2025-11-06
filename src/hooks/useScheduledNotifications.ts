import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export interface ScheduledNotification {
  id?: string;
  user_id?: string;
  title: string;
  body: string;
  type: 'meal' | 'training' | 'hydration' | 'event' | 'general';
  scheduled_for: string; // ISO string
  repeat_type?: 'none' | 'daily' | 'weekly';
  repeat_days?: string[]; // ['monday', 'wednesday', 'friday']
  active: boolean;
  data?: Record<string, any>;
  created_at?: string;
}

export const useScheduledNotifications = () => {
  const { user } = useAuth();
  const { sendLocalNotification, requestNotificationPermission, sendPushNotification } = usePushNotifications();
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Verificar e criar tabela se necessário
  const initializeNotificationsTable = async () => {
    if (initialized) return true;

    try {
      // Verificar se a tabela existe
      const { error: tableCheckError } = await supabase
        .from('scheduled_notifications')
        .select('count(*)', { count: 'exact', head: true });

      if (tableCheckError) {
        console.warn('Tabela scheduled_notifications pode não existir. Tentando criar via SQL...');
        
        // Criar tabela via SQL
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES auth.users(id) NOT NULL,
              title TEXT NOT NULL,
              body TEXT NOT NULL,
              type TEXT NOT NULL,
              scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
              repeat_type TEXT DEFAULT 'none',
              repeat_days TEXT[],
              active BOOLEAN DEFAULT true,
              data JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Adicionar políticas de segurança
            ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
            
            -- Políticas para usuários autenticados
            CREATE POLICY "Users can view their own notifications" 
            ON public.scheduled_notifications FOR SELECT 
            USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert their own notifications" 
            ON public.scheduled_notifications FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY "Users can update their own notifications" 
            ON public.scheduled_notifications FOR UPDATE 
            USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can delete their own notifications" 
            ON public.scheduled_notifications FOR DELETE 
            USING (auth.uid() = user_id);
          `
        });

        if (sqlError) {
          console.error('Erro ao criar tabela de notificações:', sqlError);
          return false;
        }

        console.log('Tabela de notificações criada com sucesso!');
      }

      setInitialized(true);
      return true;
    } catch (err) {
      console.error('Erro ao inicializar tabela de notificações:', err);
      return false;
    }
  };

  // Buscar notificações programadas
  const fetchNotifications = async () => {
    if (!user) return;

    // Garantir que a tabela existe
    const tableInitialized = await initializeNotificationsTable();
    if (!tableInitialized) {
      setError('Não foi possível inicializar a tabela de notificações');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      setNotifications(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar notificações programadas:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Criar notificação programada
  const createNotification = async (notification: Omit<ScheduledNotification, 'user_id'>) => {
    if (!user) return null;

    // Garantir que a tabela existe
    const tableInitialized = await initializeNotificationsTable();
    if (!tableInitialized) {
      toast.error('Não foi possível inicializar a tabela de notificações');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const notificationWithUserId = {
        ...notification,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('scheduled_notifications')
        .insert(notificationWithUserId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de notificações
      setNotifications([...notifications, data]);
      
      // Programar notificação
      scheduleNotification(data);

      setLoading(false);
      return data;
    } catch (err: any) {
      console.error('Erro ao criar notificação programada:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // Atualizar notificação programada
  const updateNotification = async (id: string, updates: Partial<ScheduledNotification>) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de notificações
      setNotifications(notifications.map(n => n.id === id ? data : n));
      
      // Re-programar notificação
      if (data.active) {
        scheduleNotification(data);
      } else {
        unscheduleNotification(id);
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar notificação programada:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Excluir notificação programada
  const deleteNotification = async (id: string) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar lista de notificações
      setNotifications(notifications.filter(n => n.id !== id));
      
      // Remover programação
      unscheduleNotification(id);

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir notificação programada:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Programar notificação
  const scheduleNotification = (notification: ScheduledNotification) => {
    if (!notification.id) return;

    try {
      const scheduledTime = new Date(notification.scheduled_for).getTime();
      const now = Date.now();
      
      // Se a data já passou, não programar
      if (scheduledTime < now) {
        console.log(`Notificação ${notification.id} já expirou:`, notification.scheduled_for);
        
        // Se for recorrente, reprogramar para o próximo período
        if (notification.repeat_type !== 'none') {
          rescheduleRecurringNotification(notification);
        }
        
        return;
      }
      
      // Calcular delay em milissegundos
      const delay = scheduledTime - now;
      
      console.log(`Programando notificação ${notification.id} para ${notification.scheduled_for} (em ${Math.round(delay / 1000 / 60)} minutos)`);
      
      // Salvar ID do timeout para poder cancelar depois
      const timeoutId = setTimeout(() => {
        triggerNotification(notification);
        
        // Se for recorrente, reprogramar para o próximo período
        if (notification.repeat_type !== 'none') {
          rescheduleRecurringNotification(notification);
        }
      }, delay);
      
      // Salvar ID do timeout no localStorage
      const timeouts = JSON.parse(localStorage.getItem('notification_timeouts') || '{}');
      timeouts[notification.id] = timeoutId;
      localStorage.setItem('notification_timeouts', JSON.stringify(timeouts));
    } catch (error) {
      console.error('Erro ao programar notificação:', error);
    }
  };

  // Reprogramar notificação recorrente
  const rescheduleRecurringNotification = (notification: ScheduledNotification) => {
    if (!notification.repeat_type || notification.repeat_type === 'none') return;
    
    try {
      const scheduledDate = new Date(notification.scheduled_for);
      let nextDate = new Date(scheduledDate);
      
      // Calcular próxima data baseada no tipo de repetição
      if (notification.repeat_type === 'daily') {
        // Adicionar 1 dia
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (notification.repeat_type === 'weekly') {
        // Adicionar 7 dias
        nextDate.setDate(nextDate.getDate() + 7);
      }
      
      // Atualizar data programada
      const updatedNotification = {
        ...notification,
        scheduled_for: nextDate.toISOString()
      };
      
      // Atualizar no banco de dados
      updateNotification(notification.id!, { scheduled_for: nextDate.toISOString() });
      
      // Programar próxima notificação
      scheduleNotification(updatedNotification);
    } catch (error) {
      console.error('Erro ao reprogramar notificação recorrente:', error);
    }
  };

  // Cancelar programação de notificação
  const unscheduleNotification = (id: string) => {
    try {
      // Buscar ID do timeout no localStorage
      const timeouts = JSON.parse(localStorage.getItem('notification_timeouts') || '{}');
      const timeoutId = timeouts[id];
      
      // Cancelar timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        
        // Remover do localStorage
        delete timeouts[id];
        localStorage.setItem('notification_timeouts', JSON.stringify(timeouts));
        
        console.log(`Notificação ${id} desprogramada`);
      }
    } catch (error) {
      console.error('Erro ao desprogramar notificação:', error);
    }
  };

  // Disparar notificação
  const triggerNotification = async (notification: ScheduledNotification) => {
    try {
      console.log(`Disparando notificação: ${notification.title}`);
      
      // Enviar notificação local
      sendLocalNotification(notification.title, notification.body, {
        tag: notification.id,
        data: notification.data || {}
      });
      
      // Tentar enviar notificação push se disponível
      try {
        await sendPushNotification(notification.title, notification.body, {
          tag: notification.id,
          data: notification.data || {}
        });
      } catch (pushError) {
        console.log('Não foi possível enviar notificação push:', pushError);
      }
    } catch (error) {
      console.error('Erro ao disparar notificação:', error);
    }
  };

  // Criar notificações para refeições
  const createMealNotifications = async (mealTimes: Array<{type: string, time: string}>, repeatDays: string[] = []) => {
    if (!user) return [];
    
    try {
      const createdNotifications = [];
      
      for (const meal of mealTimes) {
        // Extrair hora e minuto
        const [hour, minute] = meal.time.split(':').map(Number);
        
        // Criar data para hoje com a hora especificada
        const scheduledDate = new Date();
        scheduledDate.setHours(hour, minute, 0, 0);
        
        // Se a hora já passou hoje, programar para amanhã
        if (scheduledDate.getTime() < Date.now()) {
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        }
        
        // Mapear tipo de refeição para título e corpo
        let title, body;
        
        switch (meal.type) {
          case 'cafe_da_manha':
            title = 'Hora do Café da Manhã';
            body = 'Não se esqueça de tomar seu café da manhã para começar o dia com energia!';
            break;
          case 'almoco':
            title = 'Hora do Almoço';
            body = 'Está na hora de almoçar! Lembre-se de fazer uma refeição balanceada.';
            break;
          case 'lanche':
            title = 'Hora do Lanche';
            body = 'Que tal um lanche saudável para manter sua energia?';
            break;
          case 'jantar':
            title = 'Hora do Jantar';
            body = 'Está na hora de jantar! Não se esqueça de sua refeição noturna.';
            break;
          case 'pre_treino':
            title = 'Lanche Pré-Treino';
            body = 'Prepare-se para o treino com uma alimentação adequada!';
            break;
          case 'pos_treino':
            title = 'Recuperação Pós-Treino';
            body = 'Hora de repor os nutrientes após o treino!';
            break;
          default:
            title = 'Lembrete de Refeição';
            body = 'Está na hora de se alimentar conforme seu plano nutricional.';
        }
        
        // Criar notificação
        const notification: Omit<ScheduledNotification, 'user_id'> = {
          title,
          body,
          type: 'meal',
          scheduled_for: scheduledDate.toISOString(),
          repeat_type: repeatDays.length > 0 ? 'weekly' : 'daily',
          repeat_days: repeatDays.length > 0 ? repeatDays : undefined,
          active: true,
          data: {
            meal_type: meal.type,
            meal_time: meal.time
          }
        };
        
        // Salvar no banco de dados
        const createdNotification = await createNotification(notification);
        if (createdNotification) {
          createdNotifications.push(createdNotification);
        }
      }
      
      return createdNotifications;
    } catch (error) {
      console.error('Erro ao criar notificações de refeições:', error);
      return [];
    }
  };

  // Criar notificações para hidratação
  const createHydrationNotifications = async () => {
    if (!user) return [];
    
    try {
      const createdNotifications = [];
      const now = new Date();
      
      // Criar 5 lembretes de hidratação ao longo do dia
      const hours = [9, 11, 14, 16, 19];
      
      for (const hour of hours) {
        // Criar data para hoje com a hora especificada
        const scheduledDate = new Date(now);
        scheduledDate.setHours(hour, 0, 0, 0);
        
        // Se a hora já passou hoje, programar para amanhã
        if (scheduledDate.getTime() < Date.now()) {
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        }
        
        // Criar notificação
        const notification: Omit<ScheduledNotification, 'user_id'> = {
          title: 'Lembrete de Hidratação',
          body: 'Não se esqueça de beber água! A hidratação é essencial para seu desempenho.',
          type: 'hydration',
          scheduled_for: scheduledDate.toISOString(),
          repeat_type: 'daily',
          active: true,
          data: {
            hour
          }
        };
        
        // Salvar no banco de dados
        const createdNotification = await createNotification(notification);
        if (createdNotification) {
          createdNotifications.push(createdNotification);
        }
      }
      
      return createdNotifications;
    } catch (error) {
      console.error('Erro ao criar notificações de hidratação:', error);
      return [];
    }
  };

  // Criar notificações para treinos
  const createTrainingNotifications = async (trainingDays: Array<{day: string, time?: string}>) => {
    if (!user) return [];
    
    try {
      const createdNotifications = [];
      const now = new Date();
      const dayMap: Record<string, number> = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
        'domingo': 0,
        'segunda': 1,
        'terca': 2,
        'quarta': 3,
        'quinta': 4,
        'sexta': 5,
        'sabado': 6
      };
      
      for (const training of trainingDays) {
        // Obter número do dia da semana
        const dayNumber = dayMap[training.day.toLowerCase()];
        if (dayNumber === undefined) continue;
        
        // Criar data para o próximo dia da semana correspondente
        const scheduledDate = new Date(now);
        const currentDay = scheduledDate.getDay();
        const daysUntilTraining = (dayNumber - currentDay + 7) % 7;
        
        scheduledDate.setDate(scheduledDate.getDate() + daysUntilTraining);
        
        // Definir hora (padrão 18:00 se não especificado)
        if (training.time) {
          const [hour, minute] = training.time.split(':').map(Number);
          scheduledDate.setHours(hour, minute, 0, 0);
        } else {
          scheduledDate.setHours(18, 0, 0, 0);
        }
        
        // Criar notificação para lembrete 1 hora antes
        const reminderDate = new Date(scheduledDate);
        reminderDate.setHours(reminderDate.getHours() - 1);
        
        // Criar notificação de lembrete
        const reminderNotification: Omit<ScheduledNotification, 'user_id'> = {
          title: 'Lembrete de Treino',
          body: `Seu treino começa em 1 hora! Prepare-se para dar o seu melhor.`,
          type: 'training',
          scheduled_for: reminderDate.toISOString(),
          repeat_type: 'weekly',
          repeat_days: [training.day],
          active: true,
          data: {
            day: training.day,
            time: training.time || '18:00',
            type: 'reminder'
          }
        };
        
        // Criar notificação do treino
        const trainingNotification: Omit<ScheduledNotification, 'user_id'> = {
          title: 'Hora de Treinar',
          body: `Seu treino está começando agora! Vamos lá!`,
          type: 'training',
          scheduled_for: scheduledDate.toISOString(),
          repeat_type: 'weekly',
          repeat_days: [training.day],
          active: true,
          data: {
            day: training.day,
            time: training.time || '18:00',
            type: 'start'
          }
        };
        
        // Salvar no banco de dados
        const createdReminder = await createNotification(reminderNotification);
        const createdTraining = await createNotification(trainingNotification);
        
        if (createdReminder) createdNotifications.push(createdReminder);
        if (createdTraining) createdNotifications.push(createdTraining);
      }
      
      return createdNotifications;
    } catch (error) {
      console.error('Erro ao criar notificações de treino:', error);
      return [];
    }
  };

  // Configurar notificações padrão para o usuário
  const setupDefaultNotifications = async () => {
    if (!user) return false;
    
    try {
      // Verificar se já existem notificações
      const { count, error } = await supabase
        .from('scheduled_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Se já existem notificações, não criar novas
      if (count && count > 0) {
        console.log(`Usuário já tem ${count} notificações programadas`);
        return true;
      }
      
      // Criar notificações de refeições
      const mealTimes = [
        { type: 'cafe_da_manha', time: '07:30' },
        { type: 'lanche', time: '10:00' },
        { type: 'almoco', time: '12:30' },
        { type: 'lanche', time: '16:00' },
        { type: 'jantar', time: '20:00' }
      ];
      
      await createMealNotifications(mealTimes);
      
      // Criar notificações de hidratação
      await createHydrationNotifications();
      
      // Criar notificações de treino (exemplo)
      const trainingDays = [
        { day: 'monday', time: '18:00' },
        { day: 'wednesday', time: '18:00' },
        { day: 'friday', time: '18:00' }
      ];
      
      await createTrainingNotifications(trainingDays);
      
      return true;
    } catch (error) {
      console.error('Erro ao configurar notificações padrão:', error);
      return false;
    }
  };

  // Programar todas as notificações ativas
  const scheduleAllNotifications = () => {
    notifications
      .filter(notification => notification.active)
      .forEach(notification => {
        scheduleNotification(notification);
      });
  };

  // Carregar e programar notificações quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      // Solicitar permissão para notificações
      requestNotificationPermission();
      
      // Buscar notificações
      fetchNotifications();
    }
  }, [user]);

  // Programar notificações quando forem carregadas
  useEffect(() => {
    if (notifications.length > 0) {
      scheduleAllNotifications();
    }
  }, [notifications]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    createMealNotifications,
    createHydrationNotifications,
    createTrainingNotifications,
    setupDefaultNotifications
  };
};
