import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { NutritionAchievement, NUTRITION_ACHIEVEMENTS } from '@/types/nutrition';

export const useNutritionAchievements = () => {
  const { user } = useAuth();
  const { addPoints } = useProgress();
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
        waterRegistrations,
        plansBy7Days,
        plansByComplexity,
        plansByGoals
      ] = await Promise.all([
        countNutritionPlans(),
        countWaterRegistrations(),
        countPlansBy7Days(),
        countPlansByComplexity(),
        countPlansByGoals()
      ]);
      
      // Lista de conquistas a conceder
      const achievementsToGrant: string[] = [];
      
      // Verificar cada conquista
      if (nutritionPlansCount >= 1) {
        achievementsToGrant.push('nutrition_beginner');
      }
      
      if (plansBy7Days >= 1) {
        achievementsToGrant.push('meal_planner_7days');
      }
      
      if (nutritionPlansCount >= 3) {
        achievementsToGrant.push('nutrition_explorer');
      }
      
      if (waterRegistrations >= 1) {
        achievementsToGrant.push('hydration_starter');
      }
      
      if (waterRegistrations >= 3) {
        achievementsToGrant.push('hydration_consistent');
      }
      
      if (plansByComplexity >= 3) {
        achievementsToGrant.push('nutrition_variety');
      }
      
      if (plansByGoals >= 3) {
        achievementsToGrant.push('goal_oriented');
      }
      
      if (nutritionPlansCount >= 5) {
        achievementsToGrant.push('nutrition_dedicated');
      }
      
      if (waterRegistrations >= 7) {
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

  // Contar DIAS ÚNICOS com registros de água do usuário
  const countWaterRegistrations = async () => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('date')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Contar apenas dias únicos (não contar múltiplos registros no mesmo dia)
      const uniqueDays = new Set((data || []).map(log => log.date));
      console.log('🧪 [ACHIEVEMENTS] Dias únicos com hidratação:', uniqueDays.size, 'dias:', Array.from(uniqueDays));
      
      return uniqueDays.size;
    } catch (err) {
      console.error('Erro ao contar dias de hidratação:', err);
      return 0;
    }
  };

  // Contar planos de 7 dias
  const countPlansBy7Days = async () => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('id, nutrition_days(id)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Contar planos que têm 7 ou mais dias
      const plansBy7Days = (data || []).filter(plan => 
        plan.nutrition_days && plan.nutrition_days.length >= 7
      ).length;
      
      return plansBy7Days;
    } catch (err) {
      console.error('Erro ao contar planos de 7 dias:', err);
      return 0;
    }
  };

  // Contar planos por diferentes complexidades
  const countPlansByComplexity = async () => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('complexity_level')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Contar quantos níveis diferentes de complexidade o usuário já criou
      const uniqueComplexities = new Set((data || []).map(plan => plan.complexity_level));
      return uniqueComplexities.size;
    } catch (err) {
      console.error('Erro ao contar planos por complexidade:', err);
      return 0;
    }
  };

  // Contar planos por diferentes objetivos
  const countPlansByGoals = async () => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('goals')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Contar quantos objetivos diferentes o usuário já criou
      const allGoals = new Set();
      (data || []).forEach(plan => {
        if (plan.goals && Array.isArray(plan.goals)) {
          plan.goals.forEach(goal => allGoals.add(goal));
        }
      });
      
      return allGoals.size;
    } catch (err) {
      console.error('Erro ao contar planos por objetivos:', err);
      return 0;
    }
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
