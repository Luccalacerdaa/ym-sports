import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { WaterIntakeLog } from '@/types/nutrition';

export const useWaterIntake = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [waterLogs, setWaterLogs] = useState<WaterIntakeLog[]>([]);
  const [todayIntake, setTodayIntake] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number>(2500); // Padrão: 2.5L

  // Calcular meta diária de água baseada no peso
  const calculateDailyGoal = () => {
    if (profile?.weight) {
      // Fórmula: 35ml por kg de peso corporal
      const calculatedGoal = Math.round(profile.weight * 35);
      setDailyGoal(calculatedGoal);
      return calculatedGoal;
    }
    return dailyGoal;
  };

  // Buscar registros de hidratação
  const fetchWaterLogs = async (days: number = 7) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Calcular data inicial (hoje - dias)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      // Buscar registros
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setWaterLogs(data || []);
      
      // Calcular consumo de hoje
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = (data || []).filter(log => log.date === today);
      const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
      setTodayIntake(todayTotal);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar registros de hidratação:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Adicionar registro de hidratação
  const addWaterIntake = async (amount: number) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Data de hoje
      const today = new Date().toISOString().split('T')[0];
      
      // Inserir registro
      const { data, error } = await supabase
        .from('water_intake_logs')
        .insert({
          user_id: user.id,
          date: today,
          amount
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar estado local
      setWaterLogs([data, ...waterLogs]);
      setTodayIntake(todayIntake + amount);
      
      setLoading(false);
      return data;
    } catch (err: any) {
      console.error('Erro ao adicionar registro de hidratação:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // Excluir registro de hidratação
  const deleteWaterIntake = async (logId: string) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar registro para saber a quantidade
      const logToDelete = waterLogs.find(log => log.id === logId);
      if (!logToDelete) throw new Error('Registro não encontrado');
      
      // Excluir registro
      const { error } = await supabase
        .from('water_intake_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Atualizar estado local
      setWaterLogs(waterLogs.filter(log => log.id !== logId));
      
      // Se o registro for de hoje, atualizar o total de hoje
      const today = new Date().toISOString().split('T')[0];
      if (logToDelete.date === today) {
        setTodayIntake(Math.max(0, todayIntake - logToDelete.amount));
      }
      
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir registro de hidratação:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Verificar sequência de dias com meta atingida
  const checkWaterStreak = async () => {
    if (!user) return 0;
    
    try {
      // Buscar registros dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Agrupar por dia e somar quantidades
      const dailyTotals: Record<string, number> = {};
      (data || []).forEach(log => {
        if (!dailyTotals[log.date]) {
          dailyTotals[log.date] = 0;
        }
        dailyTotals[log.date] += log.amount;
      });
      
      // Ordenar datas (mais recente primeiro)
      const sortedDates = Object.keys(dailyTotals).sort().reverse();
      
      // Verificar sequência
      let streak = 0;
      const goal = calculateDailyGoal();
      
      // Começar de hoje e ir para trás
      const today = new Date().toISOString().split('T')[0];
      let currentDate = new Date(today);
      
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const total = dailyTotals[dateStr] || 0;
        
        // Se não atingiu a meta, parar
        if (total < goal) break;
        
        streak++;
        
        // Ir para o dia anterior
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      return streak;
    } catch (err: any) {
      console.error('Erro ao verificar sequência de hidratação:', err);
      return 0;
    }
  };

  // Gerar sugestões de hidratação baseadas no perfil
  const generateHydrationTips = () => {
    const tips = [
      "Mantenha uma garrafa de água sempre por perto durante os treinos",
      "Beba água em pequenas quantidades ao longo do dia, não apenas quando sentir sede",
      "Adicione rodelas de limão, laranja ou pepino à água para variar o sabor",
      "Monitore a cor da sua urina: quanto mais clara, melhor sua hidratação",
      "Aumente a ingestão de água em dias quentes ou quando treinar intensamente"
    ];
    
    // Adicionar dicas personalizadas baseadas no perfil
    if (profile) {
      if (profile.age && profile.age < 18) {
        tips.push("Jovens atletas precisam de hidratação extra para desenvolvimento adequado");
      }
      
      if (profile.position) {
        const position = profile.position.toLowerCase();
        if (position.includes('goleiro')) {
          tips.push("Goleiros precisam manter-se bem hidratados para manter reflexos e concentração");
        } else if (position.includes('lateral') || position.includes('meio')) {
          tips.push("Jogadores que percorrem grandes distâncias precisam de hidratação constante");
        }
      }
    }
    
    return tips;
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      fetchWaterLogs();
      calculateDailyGoal();
    }
  }, [user, profile]);

  return {
    waterLogs,
    todayIntake,
    dailyGoal,
    loading,
    error,
    fetchWaterLogs,
    addWaterIntake,
    deleteWaterIntake,
    checkWaterStreak,
    calculateDailyGoal,
    generateHydrationTips,
    progress: Math.min(100, Math.round((todayIntake / dailyGoal) * 100))
  };
};
