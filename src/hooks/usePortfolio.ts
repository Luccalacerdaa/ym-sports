import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerPortfolio, ClubHistory, PortfolioView } from '@/types/portfolio';
import { toast } from 'sonner';

export const usePortfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PlayerPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar portfólio do usuário atual
  const fetchMyPortfolio = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('player_portfolios')
        .select(`
          *,
          club_history (*)
        `)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }
      
      setPortfolio(data || null);
    } catch (err: any) {
      console.error('Erro ao buscar portfólio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar portfólio público por slug
  const fetchPortfolioBySlug = async (slug: string): Promise<PlayerPortfolio | null> => {
    try {
      const { data, error } = await supabase
        .from('player_portfolios')
        .select(`
          *,
          club_history (*)
        `)
        .eq('slug', slug)
        .eq('is_public', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        throw error;
      }
      
      // Registrar visualização
      if (data) {
        await registerView(data.id);
      }
      
      return data;
    } catch (err: any) {
      console.error('Erro ao buscar portfólio por slug:', err);
      throw err;
    }
  };

  // Criar portfólio
  const createPortfolio = async (portfolioData: Partial<PlayerPortfolio>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      // Gerar slug único
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_unique_slug', { base_name: portfolioData.full_name || 'jogador' });
      
      if (slugError) throw slugError;
      
      const newPortfolio = {
        ...portfolioData,
        user_id: user.id,
        slug: slugData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views_count: 0
      };
      
      const { data, error } = await supabase
        .from('player_portfolios')
        .insert(newPortfolio)
        .select()
        .single();
      
      if (error) throw error;
      
      setPortfolio(data);
      toast.success('Portfólio criado com sucesso!');
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar portfólio:', err);
      setError(err.message);
      toast.error('Erro ao criar portfólio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar portfólio
  const updatePortfolio = async (updates: Partial<PlayerPortfolio>) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 [UPDATE PORTFOLIO] Iniciando atualização');
    console.log('📝 [UPDATE PORTFOLIO] User ID:', user?.id);
    console.log('📝 [UPDATE PORTFOLIO] Portfolio ID:', portfolio?.id);
    console.log('📝 [UPDATE PORTFOLIO] Dados recebidos:', JSON.stringify(updates, null, 2));
    console.log('═══════════════════════════════════════════════════════');
    
    if (!user || !portfolio) {
      console.error('❌ [UPDATE PORTFOLIO] Erro: Portfólio ou usuário não encontrado');
      throw new Error('Portfólio não encontrado');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const dataToUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      console.log('📤 [UPDATE PORTFOLIO] Enviando para Supabase:', JSON.stringify(dataToUpdate, null, 2));
      
      const { data, error } = await supabase
        .from('player_portfolios')
        .update(dataToUpdate)
        .eq('id', portfolio.id)
        .select()
        .single();
      
      console.log('📥 [UPDATE PORTFOLIO] Resposta do Supabase:');
      console.log('   - Error:', error);
      console.log('   - Data:', data);
      
      if (error) {
        console.error('❌ [UPDATE PORTFOLIO] Erro do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ [UPDATE PORTFOLIO] Atualização bem-sucedida!');
      setPortfolio(data);
      toast.success('Portfólio atualizado com sucesso!');
      
      return data;
    } catch (err: any) {
      console.error('❌ [UPDATE PORTFOLIO] Erro completo:', err);
      console.error('❌ [UPDATE PORTFOLIO] Stack trace:', err.stack);
      setError(err.message);
      toast.error(`Erro ao atualizar portfólio: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
      console.log('═══════════════════════════════════════════════════════');
    }
  };

  // Adicionar clube ao histórico
  const addClubHistory = async (clubData: Omit<ClubHistory, 'id' | 'portfolio_id'>) => {
    if (!portfolio) throw new Error('Portfólio não encontrado');
    
    try {
      const { data, error } = await supabase
        .from('club_history')
        .insert({
          ...clubData,
          portfolio_id: portfolio.id,
          // Garantir que datas vazias sejam null
          end_date: clubData.end_date || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar portfólio local
      setPortfolio(prev => prev ? {
        ...prev,
        club_history: [...(prev.club_history || []), data]
      } : null);
      
      toast.success('Clube adicionado ao histórico!');
      return data;
    } catch (err: any) {
      console.error('Erro ao adicionar clube:', err);
      toast.error('Erro ao adicionar clube');
      throw err;
    }
  };

  // Atualizar clube no histórico
  const updateClubHistory = async (clubId: string, updates: Partial<ClubHistory>) => {
    try {
      const { data, error } = await supabase
        .from('club_history')
        .update(updates)
        .eq('id', clubId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar portfólio local
      setPortfolio(prev => prev ? {
        ...prev,
        club_history: prev.club_history?.map(club => 
          club.id === clubId ? data : club
        ) || []
      } : null);
      
      toast.success('Histórico do clube atualizado!');
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar clube:', err);
      toast.error('Erro ao atualizar clube');
      throw err;
    }
  };

  // Remover clube do histórico
  const removeClubHistory = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('club_history')
        .delete()
        .eq('id', clubId);
      
      if (error) throw error;
      
      // Atualizar portfólio local
      setPortfolio(prev => prev ? {
        ...prev,
        club_history: prev.club_history?.filter(club => club.id !== clubId) || []
      } : null);
      
      toast.success('Clube removido do histórico!');
    } catch (err: any) {
      console.error('Erro ao remover clube:', err);
      toast.error('Erro ao remover clube');
      throw err;
    }
  };

  // Registrar visualização
  const registerView = async (portfolioId: string, referrer?: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_views')
        .insert({
          portfolio_id: portfolioId,
          referrer: referrer || document.referrer || null,
          viewed_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao registrar visualização:', err);
      // Não mostrar erro para o usuário, é apenas tracking
    }
  };

  // Registrar compartilhamento
  const registerShare = async (portfolioId: string, sharedVia: 'link' | 'email' | 'whatsapp' | 'social', recipientInfo?: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_shares')
        .insert({
          portfolio_id: portfolioId,
          shared_via: sharedVia,
          recipient_info: recipientInfo,
          shared_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao registrar compartilhamento:', err);
    }
  };

  // Gerar link de compartilhamento
  const generateShareLink = (slug: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/portfolio/${slug}`;
  };

  // Buscar estatísticas do portfólio
  const getPortfolioStats = async (portfolioId: string) => {
    try {
      const { data: views, error: viewsError } = await supabase
        .from('portfolio_views')
        .select('*')
        .eq('portfolio_id', portfolioId);
      
      if (viewsError) throw viewsError;
      
      const { data: shares, error: sharesError } = await supabase
        .from('portfolio_shares')
        .select('*')
        .eq('portfolio_id', portfolioId);
      
      if (sharesError) throw sharesError;
      
      return {
        totalViews: views?.length || 0,
        totalShares: shares?.length || 0,
        recentViews: views?.slice(-10) || [],
        sharesByPlatform: shares?.reduce((acc, share) => {
          acc[share.shared_via] = (acc[share.shared_via] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      return {
        totalViews: 0,
        totalShares: 0,
        recentViews: [],
        sharesByPlatform: {}
      };
    }
  };

  // Carregar portfólio na inicialização
  useEffect(() => {
    if (user) {
      fetchMyPortfolio();
    }
  }, [user]);

  return {
    portfolio,
    loading,
    error,
    fetchMyPortfolio,
    fetchPortfolioBySlug,
    createPortfolio,
    updatePortfolio,
    addClubHistory,
    updateClubHistory,
    removeClubHistory,
    registerView,
    registerShare,
    generateShareLink,
    getPortfolioStats
  };
};
