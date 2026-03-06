import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { saveCache, loadCache } from '@/lib/offlineCache';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: 'game' | 'training' | 'personal' | 'other';
  start_date: string;
  end_date?: string;
  location?: string;
  opponent?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at?: string;
  updated_at?: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar eventos do usuário
  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Offline: usar cache
    if (!navigator.onLine) {
      const cached = loadCache<Event[]>('events', user.id);
      if (cached) {
        setEvents(cached);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (fetchError) {
        console.error('Erro ao buscar eventos:', fetchError);
        const cached = loadCache<Event[]>('events', user.id);
        if (cached) setEvents(cached);
        else setError(fetchError.message);
      } else {
        const eventsData = data || [];
        setEvents(eventsData);
        saveCache('events', user.id, eventsData);
      }
    } catch (err) {
      const cached = loadCache<Event[]>('events', user.id);
      if (cached) setEvents(cached);
      else {
        setError('Erro ao carregar eventos');
        console.error('Erro ao carregar eventos:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Criar novo evento
  const createEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      console.log('Criando evento:', { user_id: user.id, ...eventData });

      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          ...eventData,
        })
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar evento:', createError);
        throw createError;
      }

      console.log('Evento criado com sucesso:', data);
      setEvents(prev => {
        const updated = [...prev, data];
        saveCache('events', user.id, updated);
        return updated;
      });
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar evento';
      console.error('Erro no createEvent:', err);
      setError(errorMessage);
      return { data: null, error: err };
    }
  };

  // Atualizar evento
  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setEvents(prev => {
        const updated = prev.map(event => event.id === eventId ? data : event);
        saveCache('events', user.id, updated);
        return updated;
      });
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar evento';
      setError(errorMessage);
      return { data: null, error: err };
    }
  };

  // Deletar evento
  const deleteEvent = async (eventId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setEvents(prev => {
        const updated = prev.filter(event => event.id !== eventId);
        saveCache('events', user.id, updated);
        return updated;
      });
      return { error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao deletar evento';
      setError(errorMessage);
      return { error: err };
    }
  };

  // Obter próximos eventos (para o dashboard)
  const getUpcomingEvents = (limit: number = 3) => {
    const now = new Date();
    const upcomingEvents = events
      .filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate >= now;
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, limit);
    
    return upcomingEvents;
  };

  // Carregar eventos quando o usuário mudar
  useEffect(() => {
    fetchEvents();
    
    // Configurar Service Worker com credenciais do Supabase
    if (user && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_SUPABASE_CONFIG',
        supabaseUrl,
        supabaseKey,
        userId: user.id
      });
      
      console.log('[useEvents] ⚙️ Configuração do Supabase enviada ao Service Worker');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
  };
};
