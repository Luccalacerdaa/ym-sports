import { useState, useEffect } from 'react';

export interface ExerciseAPI {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

export const useExerciseAPI = () => {
  const [exercises, setExercises] = useState<ExerciseAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async (muscle?: string, type?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Construir URL da API
      let url = 'https://api.api-ninjas.com/v1/exercises';
      const params = new URLSearchParams();
      
      if (muscle) params.append('muscle', muscle);
      if (type) params.append('type', type);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': import.meta.env.VITE_API_NINJAS_KEY || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      setExercises(data);
      return data;
    } catch (err: any) {
      console.error('Erro ao buscar exercícios:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAllExercises = async () => {
    return await fetchExercises();
  };

  const fetchExercisesByMuscle = async (muscle: string) => {
    return await fetchExercises(muscle);
  };

  const fetchExercisesByType = async (type: string) => {
    return await fetchExercises(undefined, type);
  };

  // Função para buscar exercícios específicos por nome
  const searchExercisesByName = async (name: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(name)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': import.meta.env.VITE_API_NINJAS_KEY || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      setExercises(data);
      return data;
    } catch (err: any) {
      console.error('Erro ao buscar exercícios por nome:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    exercises,
    loading,
    error,
    fetchExercises,
    fetchAllExercises,
    fetchExercisesByMuscle,
    fetchExercisesByType,
    searchExercisesByName,
  };
};
