import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  NutritionPlan, 
  DailyPlan, 
  Meal, 
  FoodItem, 
  FoodPreference 
} from '@/types/nutrition';

export const useNutritionPlans = () => {
  const { user } = useAuth();
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<FoodPreference>({
    favorites: [],
    avoid: [],
    allergies: []
  });

  // Buscar planos nutricionais do usuário
  const fetchNutritionPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNutritionPlans(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar planos nutricionais:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Buscar plano nutricional completo (com dias, refeições e alimentos)
  const fetchNutritionPlanDetails = async (planId: string) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar plano base
      const { data: planData, error: planError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', user.id)
        .single();
      
      if (planError) throw planError;
      if (!planData) throw new Error('Plano não encontrado');
      
      // Buscar dias do plano
      const { data: daysData, error: daysError } = await supabase
        .from('nutrition_days')
        .select('*')
        .eq('plan_id', planId)
        .order('day_of_week');
      
      if (daysError) throw daysError;
      
      const days: DailyPlan[] = [];
      
      // Para cada dia, buscar refeições e alimentos
      for (const day of daysData || []) {
        // Buscar refeições
        const { data: mealsData, error: mealsError } = await supabase
          .from('nutrition_meals')
          .select('*')
          .eq('day_id', day.id)
          .order('time');
        
        if (mealsError) throw mealsError;
        
        const meals: Meal[] = [];
        
        // Para cada refeição, buscar alimentos
        for (const meal of mealsData || []) {
          // Buscar alimentos
          const { data: foodsData, error: foodsError } = await supabase
            .from('nutrition_foods')
            .select('*')
            .eq('meal_id', meal.id);
          
          if (foodsError) throw foodsError;
          
          meals.push({
            ...meal,
            foods: foodsData || []
          });
        }
        
        days.push({
          ...day,
          meals
        });
      }
      
      const completePlan: NutritionPlan = {
        ...planData,
        days
      };
      
      setCurrentPlan(completePlan);
      setLoading(false);
      return completePlan;
    } catch (err: any) {
      console.error('Erro ao buscar detalhes do plano nutricional:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // Salvar plano nutricional completo
  const saveNutritionPlan = async (plan: NutritionPlan) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Adicionar user_id ao plano
      const planWithUserId = {
        ...plan,
        user_id: user.id
      };
      
      // Remover dias para inserir o plano base
      const { days, ...planBase } = planWithUserId;
      
      // Inserir plano base
      const { data: planData, error: planError } = await supabase
        .from('nutrition_plans')
        .insert(planBase)
        .select()
        .single();
      
      if (planError) throw planError;
      if (!planData) throw new Error('Erro ao criar plano nutricional');
      
      // Inserir dias
      for (const day of days) {
        // Adicionar plan_id ao dia
        const dayWithPlanId = {
          ...day,
          plan_id: planData.id
        };
        
        // Remover meals para inserir o dia base
        const { meals, ...dayBase } = dayWithPlanId;
        
        // Inserir dia
        const { data: dayData, error: dayError } = await supabase
          .from('nutrition_days')
          .insert(dayBase)
          .select()
          .single();
        
        if (dayError) throw dayError;
        if (!dayData) throw new Error('Erro ao criar dia do plano');
        
        // Inserir refeições
        for (const meal of meals) {
          // Adicionar day_id à refeição
          const mealWithDayId = {
            ...meal,
            day_id: dayData.id
          };
          
          // Remover foods para inserir a refeição base
          const { foods, ...mealBase } = mealWithDayId;
          
          // Inserir refeição
          const { data: mealData, error: mealError } = await supabase
            .from('nutrition_meals')
            .insert(mealBase)
            .select()
            .single();
          
          if (mealError) throw mealError;
          if (!mealData) throw new Error('Erro ao criar refeição');
          
          // Inserir alimentos
          for (const food of foods) {
            // Adicionar meal_id ao alimento
            const foodWithMealId = {
              ...food,
              meal_id: mealData.id
            };
            
            // Inserir alimento
            const { error: foodError } = await supabase
              .from('nutrition_foods')
              .insert(foodWithMealId);
            
            if (foodError) throw foodError;
          }
        }
      }
      
      // Buscar plano completo após salvar
      const savedPlan = await fetchNutritionPlanDetails(planData.id);
      
      setLoading(false);
      return savedPlan;
    } catch (err: any) {
      console.error('Erro ao salvar plano nutricional:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // Excluir plano nutricional
  const deleteNutritionPlan = async (planId: string) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se o plano pertence ao usuário
      const { data: planCheck, error: checkError } = await supabase
        .from('nutrition_plans')
        .select('id')
        .eq('id', planId)
        .eq('user_id', user.id)
        .single();
      
      if (checkError) throw checkError;
      if (!planCheck) throw new Error('Plano não encontrado ou não pertence ao usuário');
      
      // Excluir plano (as tabelas relacionadas serão excluídas em cascata)
      const { error: deleteError } = await supabase
        .from('nutrition_plans')
        .delete()
        .eq('id', planId);
      
      if (deleteError) throw deleteError;
      
      // Atualizar lista de planos
      await fetchNutritionPlans();
      
      // Se o plano atual foi excluído, limpar
      if (currentPlan?.id === planId) {
        setCurrentPlan(null);
      }
      
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir plano nutricional:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Buscar preferências alimentares do usuário
  const fetchFoodPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_food_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }
      
      if (data) {
        setPreferences({
          favorites: data.favorites || [],
          avoid: data.avoid || [],
          allergies: data.allergies || []
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar preferências alimentares:', err);
    }
  };

  // Salvar preferências alimentares do usuário
  const saveFoodPreferences = async (newPreferences: FoodPreference) => {
    if (!user) return false;
    
    try {
      // Verificar se já existem preferências
      const { data: existingData, error: checkError } = await supabase
        .from('user_food_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      let saveError;
      
      if (!existingData) {
        // Inserir novas preferências
        const { error } = await supabase
          .from('user_food_preferences')
          .insert({
            user_id: user.id,
            favorites: newPreferences.favorites,
            avoid: newPreferences.avoid,
            allergies: newPreferences.allergies
          });
        
        saveError = error;
      } else {
        // Atualizar preferências existentes
        const { error } = await supabase
          .from('user_food_preferences')
          .update({
            favorites: newPreferences.favorites,
            avoid: newPreferences.avoid,
            allergies: newPreferences.allergies,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        saveError = error;
      }
      
      if (saveError) throw saveError;
      
      // Atualizar estado local
      setPreferences(newPreferences);
      
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar preferências alimentares:', err);
      return false;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      fetchNutritionPlans();
      fetchFoodPreferences();
    }
  }, [user]);

  return {
    nutritionPlans,
    currentPlan,
    loading,
    error,
    preferences,
    fetchNutritionPlans,
    fetchNutritionPlanDetails,
    saveNutritionPlan,
    deleteNutritionPlan,
    fetchFoodPreferences,
    saveFoodPreferences
  };
};
