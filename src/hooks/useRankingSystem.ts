/**
 * 🆕 NOVO SISTEMA DE RANKINGS
 * Arquitetura limpa e eficiente - sem duplicações
 * Criado em: 20/01/2026
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// 📋 TIPOS
// ============================================

export interface RankingPlayer {
  id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  position: number;
  location: string;
  isCurrentUser?: boolean;
}

export interface UserRankingPosition {
  national: number | null;
  regional: number | null;
  local: number | null;
  nationalTotal: number;
  regionalTotal: number;
  localTotal: number;
  region: string | null;
  state: string | null;
  city: string | null;
}

type RankingType = 'national' | 'regional' | 'local';

// ============================================
// 🎯 HOOK PRINCIPAL
// ============================================

export const useRankingSystem = () => {
  const { user } = useAuth();
  
  // Estados
  const [nationalRanking, setNationalRanking] = useState<RankingPlayer[]>([]);
  const [regionalRanking, setRegionalRanking] = useState<RankingPlayer[]>([]);
  const [localRanking, setLocalRanking] = useState<RankingPlayer[]>([]);
  const [userPosition, setUserPosition] = useState<UserRankingPosition>({
    national: null,
    regional: null,
    local: null,
    nationalTotal: 0,
    regionalTotal: 0,
    localTotal: 0,
    region: null,
    state: null,
    city: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // 📍 BUSCAR LOCALIZAÇÃO DO USUÁRIO
  // ============================================
  
  const getUserLocation = useCallback(async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_locations')
      .select('region, state, city_approximate')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar localização:', error);
      return null;
    }
    
    return data;
  }, [user]);

  // ============================================
  // 🏆 BUSCAR RANKING POR TIPO
  // ============================================
  
  const fetchRanking = useCallback(async (
    type: RankingType,
    region?: string | null,
    city?: string | null
  ): Promise<RankingPlayer[]> => {
    try {
      // Query base
      let query = supabase
        .from('rankings_cache')
        .select(`
          user_id,
          points,
          region,
          city
        `)
        .eq('ranking_type', type)
        .order('points', { ascending: false })
        .limit(100);

      // Filtros por tipo
      if (type === 'regional' && region) {
        query = query.eq('region', region);
      } else if (type === 'local' && region) {
        query = query.eq('region', region); // Para local, region = state
      }

      const { data: rankingData, error: rankingError } = await query;

      if (rankingError) throw rankingError;
      if (!rankingData || rankingData.length === 0) return [];

      // Buscar perfis dos usuários
      const userIds = rankingData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      // Montar array de jogadores com posições
      const players: RankingPlayer[] = rankingData.map((rank, index) => {
        const profile = profiles?.find(p => p.id === rank.user_id);
        
        let location = '';
        if (type === 'national') {
          location = rank.region || 'Brasil';
        } else if (type === 'regional') {
          location = rank.region || '';
        } else if (type === 'local') {
          location = rank.city ? `${rank.city}, ${rank.region}` : (rank.region || '');
        }

        return {
          id: rank.user_id,
          name: profile?.name || 'Jogador',
          avatar_url: profile?.avatar_url || null,
          points: rank.points,
          position: index + 1,
          location,
          isCurrentUser: user?.id === rank.user_id,
        };
      });

      return players;
    } catch (err) {
      console.error(`❌ Erro ao buscar ranking ${type}:`, err);
      return [];
    }
  }, [user]);

  // ============================================
  // 📊 BUSCAR POSIÇÃO DO USUÁRIO
  // ============================================
  
  const fetchUserPosition = useCallback(async () => {
    if (!user) return;

    try {
      const location = await getUserLocation();
      
      // Buscar rankings do usuário
      const { data: userRankings } = await supabase
        .from('rankings_cache')
        .select('ranking_type, points, region, city')
        .eq('user_id', user.id);

      if (!userRankings || userRankings.length === 0) {
        console.log('⚠️ Usuário não está nos rankings ainda');
        return;
      }

      // Calcular posições
      const positions: UserRankingPosition = {
        national: null,
        regional: null,
        local: null,
        nationalTotal: 0,
        regionalTotal: 0,
        localTotal: 0,
        region: location?.region || null,
        state: location?.state || null,
        city: location?.city_approximate || null,
      };

      // Nacional
      const nationalRank = userRankings.find(r => r.ranking_type === 'national');
      if (nationalRank) {
        const { count } = await supabase
          .from('rankings_cache')
          .select('*', { count: 'exact', head: true })
          .eq('ranking_type', 'national')
          .gt('points', nationalRank.points);
        
        positions.national = (count || 0) + 1;
        
        const { count: total } = await supabase
          .from('rankings_cache')
          .select('*', { count: 'exact', head: true })
          .eq('ranking_type', 'national');
        
        positions.nationalTotal = total || 0;
      }

      // Regional
      const regionalRank = userRankings.find(r => r.ranking_type === 'regional');
      if (regionalRank && location?.region) {
        const { count } = await supabase
          .from('rankings_cache')
          .select('*', { count: 'exact', head: true })
          .eq('ranking_type', 'regional')
          .eq('region', location.region)
          .gt('points', regionalRank.points);
        
        positions.regional = (count || 0) + 1;
        
        const { count: total } = await supabase
          .from('rankings_cache')
          .select('*', { count: 'exact', head: true })
          .eq('ranking_type', 'regional')
          .eq('region', location.region);
        
        positions.regionalTotal = total || 0;
      }

      // Local
      const localRank = userRankings.find(r => r.ranking_type === 'local');
      if (localRank && location?.state) {
        const { count } = await supabase
          .from('rankings_cache')
          .select('*', { count: 'exact', head: true })
          .eq('ranking_type', 'local')
          .eq('region', location.state)
          .gt('points', localRank.points);
        
        positions.local = (count || 0) + 1;
        
        const { count: total } = await supabase
          .from('rankings_cache')
          .select('*', { count: 'exact', head: true })
          .eq('ranking_type', 'local')
          .eq('region', location.state);
        
        positions.localTotal = total || 0;
      }

      setUserPosition(positions);
    } catch (err) {
      console.error('❌ Erro ao buscar posição do usuário:', err);
    }
  }, [user, getUserLocation]);

  // ============================================
  // 🔄 CARREGAR TODOS OS RANKINGS
  // ============================================
  
  const loadAllRankings = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const location = await getUserLocation();

      // Buscar rankings em paralelo
      const [national, regional, local] = await Promise.all([
        fetchRanking('national'),
        fetchRanking('regional', location?.region),
        fetchRanking('local', location?.state),
      ]);

      setNationalRanking(national);
      setRegionalRanking(regional);
      setLocalRanking(local);

      // Buscar posição do usuário
      await fetchUserPosition();

      console.log('✅ Rankings carregados com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao carregar rankings:', err);
      setError('Erro ao carregar rankings. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [user, getUserLocation, fetchRanking, fetchUserPosition]);

  // ============================================
  // 🔄 ATUALIZAR RANKINGS DO USUÁRIO
  // ============================================
  
  const refreshUserRankings = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔄 Atualizando rankings do usuário...');
      
      const { error } = await supabase.rpc('refresh_user_rankings', {
        target_user_id: user.id
      });

      if (error) throw error;

      console.log('✅ Rankings do usuário atualizados!');
      
      // Recarregar todos os rankings
      await loadAllRankings();
    } catch (err) {
      console.error('❌ Erro ao atualizar rankings:', err);
    }
  }, [user, loadAllRankings]);

  // ============================================
  // 📍 ATUALIZAR LOCALIZAÇÃO (GPS)
  // ============================================
  
  const updateLocationFromGPS = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📍 Buscando localização GPS...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Buscar dados de localização via API de geocodificação
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const geoData = await response.json();

      const state = geoData.address?.state || null;
      const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || null;
      
      // Determinar região
      const stateToRegion: Record<string, string> = {
        'SP': 'Sudeste', 'RJ': 'Sudeste', 'MG': 'Sudeste', 'ES': 'Sudeste',
        'RS': 'Sul', 'SC': 'Sul', 'PR': 'Sul',
        'BA': 'Nordeste', 'CE': 'Nordeste', 'PE': 'Nordeste', 'MA': 'Nordeste', 
        'RN': 'Nordeste', 'PB': 'Nordeste', 'SE': 'Nordeste', 'AL': 'Nordeste', 'PI': 'Nordeste',
        'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'DF': 'Centro-Oeste',
        'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'AC': 'Norte', 'AP': 'Norte', 'TO': 'Norte',
      };
      
      const stateCode = geoData.address?.['ISO3166-2-lvl4']?.split('-')[1] || state;
      const region = stateToRegion[stateCode] || 'Brasil';

      // Atualizar no banco
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude,
          longitude,
          state: stateCode,
          city_approximate: city,
          region,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      console.log('✅ Localização atualizada:', { state: stateCode, city, region });

      // Atualizar rankings
      await refreshUserRankings();
    } catch (err) {
      console.error('❌ Erro ao atualizar localização:', err);
      throw err;
    }
  }, [user, refreshUserRankings]);

  // ============================================
  // 🚀 CARREGAR NA INICIALIZAÇÃO
  // ============================================
  
  useEffect(() => {
    if (user) {
      loadAllRankings();
    }
  }, [user, loadAllRankings]);

  // ============================================
  // 📤 RETORNAR API
  // ============================================
  
  return {
    // Rankings
    nationalRanking,
    regionalRanking,
    localRanking,
    
    // Posição do usuário
    userPosition,
    
    // Estados
    isLoading,
    error,
    
    // Ações
    loadAllRankings,
    refreshUserRankings,
    updateLocationFromGPS,
  };
};
