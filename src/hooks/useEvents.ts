import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

    try {
      setLoading(true);
      setError(null);

      console.log('Buscando eventos para usuário:', user.id);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (fetchError) {
        console.error('Erro ao buscar eventos:', fetchError);
        setError(fetchError.message);
      } else {
        console.log('Eventos encontrados:', data);
        setEvents(data || []);
      }
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error('Erro ao carregar eventos:', err);
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
      setEvents(prev => [...prev, data]);
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

      setEvents(prev => prev.map(event => 
        event.id === eventId ? data : event
      ));
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

      setEvents(prev => prev.filter(event => event.id !== eventId));
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
    
    console.log('getUpcomingEvents:', { 
      totalEvents: events.length, 
      upcomingEvents: upcomingEvents.length,
      events: events.map(e => ({ id: e.id, title: e.title, start_date: e.start_date }))
    });
    
    return upcomingEvents;
  };

  // Carregar eventos quando o usuário mudar
  useEffect(() => {
    fetchEvents();
  }, [user]);

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
