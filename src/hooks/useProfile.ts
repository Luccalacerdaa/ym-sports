import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  name?: string;
  age?: number;
  height?: number;
  weight?: number;
  email?: string;
  avatar_url?: string;
  bio?: string;
  current_team?: string;
  previous_teams?: string[];
  championships_won?: string[];
  position?: string;
  phone?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar perfil do usuário
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Perfil não encontrado - criar perfil básico
          console.log('Perfil não encontrado, criando perfil básico...');
          await createBasicProfile();
        } else {
          console.error('Erro ao buscar perfil:', fetchError);
          setError(fetchError.message);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError('Erro ao carregar perfil');
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { data: null, error: err };
    }
  };

  // Criar perfil
  const createProfile = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          ...profileData,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setProfile(data);
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar perfil';
      setError(errorMessage);
      return { data: null, error: err };
    }
  };

  // Criar perfil básico se não existir
  const createBasicProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.email?.split('@')[0] || 'Usuário',
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil básico:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Erro ao criar perfil básico:', err);
      setProfile(null);
    }
  };

  // Carregar perfil quando o usuário mudar
  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createProfile,
  };
};