import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { NutritionAchievement, NUTRITION_ACHIEVEMENTS } from '@/types/nutrition';
import { useWaterIntake } from './useWaterIntake';

export const useNutritionAchievements = () => {
  const { user } = useAuth();
  const { addPoints } = useProgress();
  const { checkWaterStreak } = useWaterIntake();
  const [achievements, setAchievements] = useState<NutritionAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar conquistas do usuário
  const fetchAchievements = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar conquistas já obtidas pelo usuário
      const { data, error } = await supabase
        .from('nutrition_achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Mapear todas as conquistas disponíveis
      const allAchievements = NUTRITION_ACHIEVEMENTS.map(achievement => {
        const userAchievement = (data || []).find(a => a.achievement_id === achievement.id);
        
        return {
          ...achievement,
          achieved: !!userAchievement,
          achieved_at: userAchievement?.achieved_at
        };
      });
      
      setAchievements(allAchievements);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar conquistas nutricionais:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Verificar e conceder conquistas
  const checkAchievements = async () => {
    if (!user) return;
    
    try {
      // Buscar dados necessários para verificar conquistas
      const [
        nutritionPlansCount,
        waterStreak,
        // Outros dados necessários...
      ] = await Promise.all([
        countNutritionPlans(),
        checkWaterStreak(),
        // Outras funções de verificação...
      ]);
      
      // Lista de conquistas a conceder
      const achievementsToGrant: string[] = [];
      
      // Verificar cada conquista
      if (nutritionPlansCount > 0) {
        achievementsToGrant.push('nutrition_beginner');
      }
      
      if (waterStreak >= 7) {
        achievementsToGrant.push('hydration_aware');
      }
      
      if (waterStreak >= 14) {
        achievementsToGrant.push('perfect_hydration');
      }
      
      if (waterStreak >= 30) {
        achievementsToGrant.push('hydration_master');
      }
      
      // Verificar se o usuário já tem todas as outras conquistas para conceder a conquista final
      const otherAchievements = NUTRITION_ACHIEVEMENTS.filter(a => a.id !== 'nutrition_guru');
      const hasAllOtherAchievements = otherAchievements.every(a => 
        achievements.find(ua => ua.id === a.id && ua.achieved)
      );
      
      if (hasAllOtherAchievements) {
        achievementsToGrant.push('nutrition_guru');
      }
      
      // Conceder conquistas
      for (const achievementId of achievementsToGrant) {
        await grantAchievement(achievementId);
      }
      
      // Atualizar lista de conquistas
      await fetchAchievements();
      
      return achievementsToGrant;
    } catch (err: any) {
      console.error('Erro ao verificar conquistas nutricionais:', err);
      return [];
    }
  };

  // Conceder uma conquista ao usuário
  const grantAchievement = async (achievementId: string) => {
    if (!user) return false;
    
    try {
      // Verificar se o usuário já tem esta conquista
      const existingAchievement = achievements.find(a => a.id === achievementId && a.achieved);
      if (existingAchievement) return true; // Já tem a conquista
      
      // Buscar detalhes da conquista
      const achievement = NUTRITION_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) throw new Error('Conquista não encontrada');
      
      // Inserir conquista no banco
      const { error } = await supabase
        .from('nutrition_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId
        });
      
      if (error) throw error;
      
      // Adicionar pontos ao usuário
      await addPoints(achievement.points, `Conquista: ${achievement.title}`);
      
      // Notificar o usuário (pode ser implementado depois)
      console.log(`Conquista obtida: ${achievement.title}`);
      
      return true;
    } catch (err: any) {
      console.error(`Erro ao conceder conquista ${achievementId}:`, err);
      return false;
    }
  };

  // Funções auxiliares para verificar conquistas

  // Contar planos nutricionais do usuário
  const countNutritionPlans = async () => {
    if (!user) return 0;
    
    try {
      const { count, error } = await supabase
        .from('nutrition_plans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return count || 0;
    } catch (err) {
      console.error('Erro ao contar planos nutricionais:', err);
      return 0;
    }
  };

  // Verificar se o usuário seguiu um plano por X dias consecutivos
  const checkPlanAdherence = async (days: number) => {
    // Esta função seria implementada com base em um sistema de registro
    // de acompanhamento de planos nutricionais que ainda será desenvolvido
    return false;
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  return {
    achievements,
    loading,
    error,
    fetchAchievements,
    checkAchievements,
    grantAchievement
  };
};
