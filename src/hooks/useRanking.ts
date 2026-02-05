import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserLocation {
  id: string;
  user_id: string;
  state: string;
  region: string;
  city_approximate: string;
  postal_code_prefix: string;
  latitude_approximate: number | null;
  longitude_approximate: number | null;

  created_at: string;
  updated_at: string;
}

export interface RankingEntry {
  id: string;
  user_id: string;
  ranking_type: 'national' | 'regional' | 'local';
  region?: string;
  position: number;
  total_points: number;
  period: 'weekly' | 'monthly' | 'all_time';
  calculated_at: string;
  user_name?: string;
  user_avatar?: string;
  user_location?: string;
}

export interface RegionalAchievement {
  id: string;
  name: string;
  description: string;
  region: string;
  requirement_type: 'points' | 'position' | 'streak';
  requirement_value: number;
  points_reward: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserRegionalAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;

  achievement?: RegionalAchievement;
}

// Mapeamento de estados para regiões
const STATE_TO_REGION: { [key: string]: string } = {
  'AC': 'Norte', 'AP': 'Norte', 'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
  'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
  'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'DF': 'Centro-Oeste',
  'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
  'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
};

// Função para calcular distância entre dois pontos em km (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const useRanking = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  // Carregar rankings do localStorage se existirem
  const loadFromStorage = (key: string): RankingEntry[] => {
    try {
      const stored = localStorage.getItem(`ym_rankings_${key}`);
      if (stored) {
        const data = JSON.parse(stored);
        // Cache de 5 minutos
        if (data.timestamp && Date.now() - data.timestamp < 5 * 60 * 1000) {
          return data.rankings || [];
        }
      }
    } catch (e) {
      console.error('Erro ao carregar rankings do localStorage:', e);
    }
    return [];
  };
  
  const [nationalRanking, setNationalRanking] = useState<RankingEntry[]>(() => loadFromStorage('national'));
  const [regionalRanking, setRegionalRanking] = useState<RankingEntry[]>(() => loadFromStorage('regional'));
  const [localRanking, setLocalRanking] = useState<RankingEntry[]>(() => loadFromStorage('local'));
  const [regionalAchievements, setRegionalAchievements] = useState<RegionalAchievement[]>([]);
  const [userRegionalAchievements, setUserRegionalAchievements] = useState<UserRegionalAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  
  // Controle de cache para evitar recargas múltiplas (POR TIPO!)
  const [isFetchingRankings, setIsFetchingRankings] = useState<{ [key: string]: boolean }>({});
  const [lastFetchTime, setLastFetchTime] = useState<{ [key: string]: number }>({});
  const [lastAchievementCheck, setLastAchievementCheck] = useState<number>(0);

  // Buscar localização do usuário
  const fetchUserLocation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserLocation(data);
    } catch (err: any) {
      console.error('Erro ao buscar localização do usuário:', err);
      setError(err.message);
    }
  };

  // Obter localização do usuário via geolocalização
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo seu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  };

  // Obter cidade/estado a partir das coordenadas
  const getLocationFromCoordinates = async (lat: number, lng: number): Promise<{
    state: string;
    state_code: string;
    city: string;
    postal_code?: string;
  }> => {
    try {
      // Usar API de geocodificação reversa
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`);
      const data = await response.json();

      return {
        state: data.principalSubdivision || 'Desconhecido',
        state_code: data.principalSubdivisionCode?.split('-')[1] || 'XX',
        city: data.city || data.locality || 'Desconhecido',
        postal_code: data.postcode
      };
    } catch (error) {
      console.error('Erro ao obter localização a partir das coordenadas:', error);
      throw new Error('Não foi possível determinar sua localização');
    }
  };

  // Atualizar localização do usuário a partir do GPS
  const updateUserLocationFromGPS = async () => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    if (isRequestingLocation) {
      console.log('⚠️ [GPS] Já existe uma solicitação de localização em andamento');
      return { success: false, error: 'Já solicitando localização' };
    }

    setIsRequestingLocation(true);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;

      // Obter informações de localidade
      const locationInfo = await getLocationFromCoordinates(latitude, longitude);
      const state_code = locationInfo.state_code;
      
      if (!state_code || state_code === 'XX') {
        return { 
          success: false, 
          error: 'Não foi possível determinar seu estado. Por favor, tente novamente ou use a configuração manual.' 
        };
      }

      // Mapear estado para região
      const region = STATE_TO_REGION[state_code] || 'Desconhecido';

      // Preparar dados para salvar
      const locationData = {
        user_id: user.id,
        state: state_code,
        region,
        city_approximate: locationInfo.city,
        postal_code_prefix: locationInfo.postal_code ? locationInfo.postal_code.substring(0, 5) : null,
        latitude_approximate: latitude,
        longitude_approximate: longitude,
        updated_at: new Date().toISOString()
      };

      // Verificar se já existe localização
      const { data: existingLocation } = await supabase
        .from('user_locations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingLocation) {
        // Atualizar localização existente
        result = await supabase
          .from('user_locations')
          .update(locationData)
          .eq('id', existingLocation.id);
      } else {
        // Inserir nova localização
        result = await supabase
          .from('user_locations')
          .insert(locationData);
      }

      if (result.error) throw result.error;

      // Atualizar estado local
      await fetchUserLocation();

      return { 
        success: true, 
        location: { 
          state: state_code, 
          region,
          city: locationInfo.city 
        } 
      };
    } catch (err: any) {
      console.error('Erro ao atualizar localização via GPS:', err);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao obter sua localização';
      
      if (err.code === 1) {
        errorMessage = 'Permissão de localização negada. Por favor, permita o acesso à sua localização.';
      } else if (err.code === 2) {
        errorMessage = 'Não foi possível determinar sua localização. Verifique se o GPS está ativado.';
      } else if (err.code === 3) {
        errorMessage = 'Tempo esgotado ao tentar obter localização. Tente novamente.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Atualizar localização do usuário manualmente
  const updateUserLocation = async (state: string, city_approximate: string, postal_code_prefix: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      console.log('📍 [UPDATE-LOCATION] Atualizando localização manualmente:', { state, city_approximate, postal_code_prefix });
      
      // Validar que state é uma sigla de 2 caracteres
      if (!state || state.length !== 2) {
        return { success: false, error: 'Estado deve ser uma sigla de 2 caracteres (ex: SP, RJ, MG)' };
      }
      
      // Mapear estado para região
      const region = STATE_TO_REGION[state];
      if (!region) {
        return { success: false, error: 'Estado inválido' };
      }

      // Preparar dados para salvar
      const locationData = {
        user_id: user.id,
        state,
        region,
        city_approximate,
        postal_code_prefix,
        latitude_approximate: null,
        longitude_approximate: null,
        updated_at: new Date().toISOString()
      };

      console.log('💾 [UPDATE-LOCATION] Salvando dados:', locationData);

      // Verificar se já existe localização
      const { data: existingLocation } = await supabase
        .from('user_locations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingLocation) {
        // Atualizar localização existente
        const { error } = await supabase
          .from('user_locations')
          .update(locationData)
          .eq('id', existingLocation.id);

        if (error) {
          console.error('❌ [UPDATE-LOCATION] Erro ao atualizar:', error);
          throw error;
        }
      } else {
        // Inserir nova localização
        const { error } = await supabase
          .from('user_locations')
          .insert(locationData);

        if (error) {
          console.error('❌ [UPDATE-LOCATION] Erro ao inserir:', error);
          throw error;
        }
      }

      console.log('✅ [UPDATE-LOCATION] Localização salva com sucesso!');

      // Atualizar estado local
      await fetchUserLocation();
      
      return { success: true, location: { state, region, city: city_approximate } };
    } catch (err: any) {
      console.error('❌ [UPDATE-LOCATION] Erro ao atualizar localização do usuário:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Buscar rankings - CORRIGIDO para evitar erro 400
  const fetchRankings = async (type: 'national' | 'regional' | 'local' = 'national', forceRefresh: boolean = false) => {
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🔍 [FETCH RANKINGS] Tipo: ${type}`);
      console.log(`🔍 [FETCH RANKINGS] ForceRefresh: ${forceRefresh}`);
      console.log(`🔍 [FETCH RANKINGS] User ID: ${user?.id}`);
      console.log(`🔍 [FETCH RANKINGS] UserLocation:`, userLocation);
      console.log('═══════════════════════════════════════════════════════');
      
      // Verificar se já tem dados no estado (veio do localStorage)
      const currentRankings = type === 'national' ? nationalRanking : type === 'regional' ? regionalRanking : localRanking;
      if (!forceRefresh && currentRankings.length > 0) {
        console.log(`✅ Usando rankings do estado (${currentRankings.length} jogadores)`);
        return currentRankings;
      }
      
      // Evitar múltiplas chamadas simultâneas para o mesmo tipo
      const now = Date.now();
      const lastFetch = lastFetchTime[type] || 0;
      const CACHE_DURATION = 3000; // 3 segundos de cache
      
      // Se forceRefresh = true, pula o cache
      if (!forceRefresh && now - lastFetch < CACHE_DURATION) {
        console.log(`⏭️ Usando cache temporal para ranking ${type}`);
        return currentRankings;
      }
      
      if (isFetchingRankings[type]) {
        console.log(`⏳ Já está buscando ranking ${type}, aguardando...`);
        return [];
      }
      
      setIsFetchingRankings(prev => ({ ...prev, [type]: true }));
      setLastFetchTime(prev => ({ ...prev, [type]: now }));
      setError(null);

      // Verificar se existem rankings, se não, calcular primeiro
      const { data: existingRankings, error: checkError } = await supabase
        .from('rankings')
        .select('id')
        .limit(1);

      if (checkError) throw checkError;

      // Se não há rankings, calcular primeiro
      if (!existingRankings || existingRankings.length === 0) {
        console.log('Calculando rankings pela primeira vez...');
        await calculateRankings();
      }
      
      // Não recalcular rankings toda vez para evitar loop infinito
      // Apenas recalcular se não houver rankings existentes

      // ALTERAÇÃO: Buscar rankings sem a junção direta com profiles
      console.log(`🔍 [QUERY] Buscando rankings do tipo: ${type}`);
      let query = supabase
        .from('rankings')
        .select('*')
        .eq('period', 'all_time')
        .order('total_points', { ascending: false }) // Ordenar por pontos, não por posição
        .order('position', { ascending: true }); // Usar posição como critério secundário

      if (type === 'regional' && userLocation) {
        console.log(`🔍 [QUERY] Filtro REGIONAL: region = ${userLocation.region}`);
        query = query.eq('ranking_type', 'regional').eq('region', userLocation.region);
      } else if (type === 'local' && userLocation) {
        console.log(`🔍 [QUERY] Filtro LOCAL: region = ${userLocation.state}`);
        query = query.eq('ranking_type', 'local').eq('region', userLocation.state);
      } else if (type === 'national') {
        console.log(`🔍 [QUERY] Filtro NACIONAL: sem filtro de região`);
        query = query.eq('ranking_type', 'national');
      }

      console.log(`🔍 [QUERY] Executando query com limit(50)...`);
      const { data, error } = await query.limit(50);
      
      console.log(`🔍 [QUERY] Resultado:`, {
        sucesso: !error,
        totalRegistros: data?.length || 0,
        erro: error?.message
      });
      
      if (data && data.length > 0) {
        console.log(`🔍 [QUERY] Primeiros 3 registros:`, data.slice(0, 3));
      }

      if (error) {
        console.error(`Erro na query de ranking ${type}:`, error);
        throw error;
      }

      // Se não houver dados, retornar array vazio ao invés de erro
      if (!data || data.length === 0) {
        console.log(`Nenhum ranking ${type} encontrado`);
        return [];
      }

      // ALTERAÇÃO: Buscar perfis separadamente com mais dados
      const userIds = data.map(entry => entry.user_id);
      
      // Buscar perfis com mais detalhes e forçar refresh
      console.log(`Buscando perfis para ${userIds.length} usuários...`);
      console.log(`IDs dos usuários para buscar perfis:`, JSON.stringify(userIds));
      
      // Verificar se há IDs válidos
      if (userIds.length === 0) {
        console.error('❌ Nenhum ID de usuário para buscar perfis!');
        return [];
      }
      
      // Buscar todos os perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Erro ao buscar perfis:', profilesError.message);
      }
      
      // Buscar localizações (para pegar cidade no ranking local)
      const { data: locationsData, error: locationsError } = await supabase
        .from('user_locations')
        .select('user_id, state, city_approximate')
        .in('user_id', userIds);
      
      if (locationsError) {
        console.warn('Erro ao buscar localizações:', locationsError.message);
      }
      
      // Verificar se há usuários sem perfil e criar perfis temporários em memória
      const missingProfileIds = userIds.filter(id => 
        !profilesData || !profilesData.some(p => p.id === id)
      );
      
      // Criar perfis temporários para usuários que não têm perfil
      const temporaryProfiles = missingProfileIds.map(id => {
        
        // Buscar informações do usuário no ranking para nome mais descritivo
        const userRanking = data.find(entry => entry.user_id === id);
        let namePrefix = "Jogador";
        
        if (userRanking) {
          if (userRanking.ranking_type === 'national') {
            namePrefix = "Atleta Nacional";
          } else if (userRanking.ranking_type === 'regional') {
            namePrefix = `Atleta ${userRanking.region || 'Regional'}`;
          } else {
            namePrefix = `Jogador ${userRanking.region || 'Local'}`;
          }
        }
        
        return {
          id,
          name: `${namePrefix} #${userRanking?.position || ''}`,
          avatar_url: null
        };
      });
      
      // Combinar perfis existentes com perfis temporários
      const allProfiles = [
        ...(profilesData || []),
        ...temporaryProfiles
      ];
      
      // Debug removido para performance
      
      // Tentar criar perfis no banco de dados para futuros acessos
      if (missingProfileIds.length > 0) {
        console.log('Tentando criar perfis no banco de dados...');
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert(temporaryProfiles, { 
              onConflict: 'id',
              ignoreDuplicates: true
            });
            
          if (insertError) {
            console.error('Erro ao criar perfis temporários:', insertError);
          } else {
            console.log(`✅ Perfis temporários criados com sucesso!`);
          }
        } catch (err) {
          console.error('Erro ao tentar criar perfis temporários:', err);
        }
      }
      
      // Buscar progresso para garantir pontuação correta
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, total_points')
        .in('user_id', userIds);
        
      if (progressError) {
        console.warn('Erro ao buscar progresso dos usuários:', progressError);
      }
      
      // Combinar dados de rankings com perfis e progresso
      // Primeiro, remover duplicatas (mesmo usuário + mesmo tipo aparecendo mais de uma vez)
      const uniqueKey = new Set();
      const uniqueRankings = data.filter(entry => {
        const key = `${entry.user_id}-${entry.ranking_type}`;
        if (uniqueKey.has(key)) {
          console.log(`⚠️ Ranking duplicado encontrado: ${entry.user_id} - Tipo: ${entry.ranking_type} - Posição: ${entry.position}`);
          return false; // Filtrar duplicatas
        }
        uniqueKey.add(key);
        return true;
      });
      
      console.log(`Rankings únicos após remoção de duplicatas: ${uniqueRankings.length}`);
      
      // Agora mapear os rankings únicos para adicionar informações de usuário
      const rankingsWithUserInfo = uniqueRankings.map(entry => {
        const profile = allProfiles.find(p => p.id === entry.user_id);
        const progress = progressData?.find(p => p.user_id === entry.user_id);
        const location = locationsData?.find(l => l.user_id === entry.user_id);
        
        // Usar nome do perfil ou nome mais amigável como fallback
        let displayName = profile?.name;
        
        if (!displayName) {
          // Se não tiver nome, criar um nome mais amigável baseado no tipo de ranking
          if (entry.ranking_type === 'national') {
            displayName = `Atleta Nacional #${entry.position}`;
          } else if (entry.ranking_type === 'regional') {
            displayName = `Atleta ${entry.region || 'Regional'} #${entry.position}`;
          } else {
            displayName = `Jogador ${entry.region || 'Local'} #${entry.position}`;
          }
        }
        
        // Usar pontos do progresso se disponíveis (mais atualizados)
        const points = progress?.total_points || entry.total_points;
        
        // Definir localização baseado no tipo de ranking
        let displayLocation = 'Brasil';
        
        if (entry.ranking_type === 'local') {
          // LOCAL: Prioridade: cidade + estado
          if (location?.city_approximate && location?.state) {
            displayLocation = `${location.city_approximate} - ${location.state}`;
          } else if (location?.state) {
            displayLocation = location.state;
          } else if (entry.region) {
            displayLocation = entry.region; // Fallback: estado que veio do ranking
          }
        } else if (entry.ranking_type === 'regional') {
          // REGIONAL: Sempre mostrar ESTADO (não região!)
          if (location?.state) {
            displayLocation = location.state;
          } else if (entry.ranking_type === 'regional') {
            // Se não tem localização, tentar inferir do nome ou deixar como "Sudeste" temporariamente
            displayLocation = entry.region; // Mostra região como fallback temporário
          }
        } else if (entry.ranking_type === 'national') {
          // NACIONAL: Mostrar estado
          if (location?.state) {
            displayLocation = location.state;
          } else if (entry.region) {
            displayLocation = entry.region; // Fallback: estado que veio do ranking
          }
        }
        
        return {
          ...entry,
          user_name: displayName,
          user_avatar: profile?.avatar_url,
          user_location: displayLocation,
          total_points: points, // Atualizar pontos com o valor mais recente
        };
      });

      // Salvar no localStorage
      try {
        localStorage.setItem(`ym_rankings_${type}`, JSON.stringify({
          rankings: rankingsWithUserInfo,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Erro ao salvar rankings no localStorage:', e);
      }
      
      switch (type) {
        case 'national':
          setNationalRanking(rankingsWithUserInfo);
          break;
        case 'regional':
          setRegionalRanking(rankingsWithUserInfo);
          break;
        case 'local':
          setLocalRanking(rankingsWithUserInfo);
          break;
      }

      return rankingsWithUserInfo;
    } catch (err: any) {
      console.error(`Erro ao buscar ranking ${type}:`, err);
      setError(err.message);
      return [];
    } finally {
      setIsFetchingRankings(prev => ({ ...prev, [type]: false }));
    }
  };

  // Calcular rankings - CORRIGIDO para evitar erro 400
  const calculateRankings = async () => {
    if (!user) return;

    try {
      setError(null);

      console.log('⚠️⚠️⚠️ [CALCULATE RANKINGS] ESTA FUNÇÃO ESTÁ SENDO CHAMADA! ⚠️⚠️⚠️');
      console.log('⚠️ [CALCULATE RANKINGS] Isso pode estar DELETANDO os rankings de outros usuários!');
      console.log('⚠️ [CALCULATE RANKINGS] User ID:', user.id);
      
      // IMPORTANTE: NÃO DELETAR TODOS OS RANKINGS!
      // Vamos deletar apenas os rankings do usuário atual
      console.log('🗑️ DELETANDO apenas rankings do usuário atual...');
      const { error: deleteError } = await supabase
        .from('rankings')
        .delete()
        .eq('user_id', user.id); // Deletar APENAS os rankings deste usuário
      
      if (deleteError) {
        console.error('❌ Erro ao deletar rankings do usuário:', deleteError);
      } else {
        console.log('✅ Rankings do usuário deletados com sucesso');
      }
      
      // Aguardar 500ms para garantir que delete foi processado
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🔍 [CALCULATE] Buscando progresso do usuário atual...');
      // Buscar apenas o progresso do usuário atual
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError) {
        console.error('❌ Erro ao buscar user_progress:', progressError);
        throw progressError;
      }
      
      console.log(`✅ [CALCULATE] Progresso do usuário:`, progressData);

      // Buscar localização do usuário atual
      const { data: locationData, error: locationsError } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (locationsError) {
        console.error('❌ Erro ao buscar user_locations:', locationsError);
        throw locationsError;
      }
      
      console.log(`✅ [CALCULATE] Localização do usuário:`, locationData);

      // Calcular rankings APENAS PARA ESTE USUÁRIO
      const now = new Date().toISOString();
      const rankingsToInsert = [];
      
      console.log('🔄 [CALCULATE] Calculando posições do usuário...');
      
      const userPoints = progressData.total_points || 0;
      
      // 1️⃣ RANKING NACIONAL - Calcular posição comparando com todos
      console.log('🔄 [CALCULATE] Calculando posição nacional...');
      const { count: nationalAbove } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', userPoints);
      
      const nationalPosition = (nationalAbove || 0) + 1;
      console.log(`✅ [CALCULATE] Posição nacional: #${nationalPosition}`);
      
      rankingsToInsert.push({
        user_id: user.id,
        ranking_type: 'national',
        region: null,
        position: nationalPosition,
        total_points: userPoints,
        period: 'all_time',
        calculated_at: now
      });
      
      // 2️⃣ RANKING REGIONAL - Se tiver localização
      if (locationData?.region) {
        console.log(`🔄 [CALCULATE] Calculando posição regional (${locationData.region})...`);
        
        const { count: regionalAbove } = await supabase
          .from('user_progress')
          .select('up.*, ul.region', { count: 'exact', head: true })
          .from('user_progress as up')
          .innerJoin('user_locations as ul', 'up.user_id', 'ul.user_id')
          .eq('ul.region', locationData.region)
          .gt('up.total_points', userPoints);
        
        const regionalPosition = (regionalAbove || 0) + 1;
        console.log(`✅ [CALCULATE] Posição regional: #${regionalPosition}`);
        
        rankingsToInsert.push({
          user_id: user.id,
          ranking_type: 'regional',
          region: locationData.region,
          position: regionalPosition,
          total_points: userPoints,
          period: 'all_time',
          calculated_at: now
        });
      }
      
      // 3️⃣ RANKING LOCAL - Se tiver estado
      if (locationData?.state) {
        console.log(`🔄 [CALCULATE] Calculando posição local (${locationData.state})...`);
        
        const { count: localAbove } = await supabase
          .from('user_progress')
          .select('up.*, ul.state', { count: 'exact', head: true })
          .from('user_progress as up')
          .innerJoin('user_locations as ul', 'up.user_id', 'ul.user_id')
          .eq('ul.state', locationData.state)
          .gt('up.total_points', userPoints);
        
        const localPosition = (localAbove || 0) + 1;
        console.log(`✅ [CALCULATE] Posição local: #${localPosition}`);
        
        const cityState = locationData.city_approximate && locationData.state 
          ? `${locationData.city_approximate}, ${locationData.state}`
          : locationData.state;
        
        rankingsToInsert.push({
          user_id: user.id,
          ranking_type: 'local',
          region: cityState,
          position: localPosition,
          total_points: userPoints,
          period: 'all_time',
          calculated_at: now
        });
      }
      
      console.log(`✅ [CALCULATE] Calculados ${rankingsToInsert.length} rankings para o usuário`);
      console.log(`📊 [CALCULATE] Rankings a inserir:`, rankingsToInsert);
      
      // Inserir rankings do usuário
      if (rankingsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('rankings')
          .insert(rankingsToInsert);
        
        if (insertError) {
          console.error(`❌ Erro ao inserir rankings:`, insertError);
          throw insertError;
        } else {
          console.log(`✅ [CALCULATE] Rankings do usuário inseridos com sucesso!`);
        }
      }
      
      console.log('✅ [CALCULATE] Atualização concluída com sucesso!');
      console.log('⚠️ [CALCULATE] IMPORTANTE: Esta função agora só atualiza o usuário atual, não todos os usuários');
      
      // Verificar conquistas regionais (SEM notificações para evitar spam)
      await checkRegionalAchievements(false);
      
      // NÃO recarregar rankings aqui! Deixar componentes carregarem quando precisarem
    } catch (err: any) {
      console.error('Erro ao calcular rankings:', err);
      setError(err.message);
    }
  };

  // Buscar conquistas regionais
  const fetchRegionalAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('regional_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (error) throw error;
      setRegionalAchievements(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar conquistas regionais:', err);
      setError(err.message);
    }
  };

  // Buscar conquistas regionais do usuário
  const fetchUserRegionalAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_regional_achievements')
        .select(`
          *,
          achievement:regional_achievements(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setUserRegionalAchievements(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar conquistas regionais do usuário:', err);
      setError(err.message);
    }
  };

  // Verificar conquistas regionais
  const checkRegionalAchievements = async (showNotifications: boolean = true) => {
    if (!user || !userLocation) return;

    // Cache de 30 segundos para evitar verificações múltiplas
    const now = Date.now();
    if (now - lastAchievementCheck < 30000) {
      console.log('⏭️ Pulando verificação de conquistas regionais (cache ativo)');
      return;
    }
    setLastAchievementCheck(now);

    try {
      // Buscar conquistas disponíveis para a região do usuário
      const { data: availableAchievements, error: achievementsError } = await supabase
        .from('regional_achievements')
        .select('*')
        .or(`region.eq.Brasil,region.eq.${userLocation.region},region.eq.${userLocation.state}`);

      if (achievementsError) throw achievementsError;

      // Buscar conquistas já desbloqueadas pelo usuário
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_regional_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      // Filtrar conquistas já desbloqueadas
      const unlockedIds = userAchievements?.map(a => a.achievement_id) || [];
      const availableToUnlock = availableAchievements?.filter(a => !unlockedIds.includes(a.id)) || [];

      // Buscar posição do usuário nos rankings
      const userPositions = await getUserPosition();

      // Verificar cada conquista
      for (const achievement of availableToUnlock) {
        let unlocked = false;

        if (achievement.requirement_type === 'points') {
          // Verificar pontos totais
          if (userPositions.total_points >= achievement.requirement_value) {
            unlocked = true;
          }
        } else if (achievement.requirement_type === 'position') {
          // Verificar posição no ranking
          if (achievement.region === 'Brasil' && userPositions.national && 
              userPositions.national <= achievement.requirement_value) {
            unlocked = true;
          } else if (achievement.region === userLocation.region && userPositions.regional && 
                    userPositions.regional <= achievement.requirement_value) {
            unlocked = true;
          } else if (achievement.region === userLocation.state && userPositions.local && 
                    userPositions.local <= achievement.requirement_value) {
            unlocked = true;
          }
        }

        // Desbloquear conquista
        if (unlocked) {
          // Verificar novamente se a conquista já foi desbloqueada (para evitar erro 409)
          const { data: existingAchievement, error: checkError } = await supabase
            .from('user_regional_achievements')
            .select('id')
            .eq('user_id', user.id)
            .eq('achievement_id', achievement.id)
            .maybeSingle();
            
          if (checkError) {
            console.error('Erro ao verificar conquista existente:', checkError);
            continue;
          }
          
          // Se a conquista já existe, pular
          if (existingAchievement) {
            console.log(`Conquista ${achievement.name} já desbloqueada anteriormente`);
            continue;
          }
          
          // Inserir com upsert para evitar conflitos (erro 409)
          const { error: unlockError } = await supabase
            .from('user_regional_achievements')
            .upsert({
              user_id: user.id,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,achievement_id',
              ignoreDuplicates: true
            });

          if (unlockError) {
            console.error('Erro ao desbloquear conquista:', unlockError);
            continue;
          }

          // Notificar usuário apenas se showNotifications = true
          if (showNotifications) {
            toast.success(`🏆 Nova conquista regional: ${achievement.name}`);
          }

          // Adicionar pontos ao usuário
          if (achievement.points_reward > 0) {
            const { error: updateError } = await supabase
              .from('user_progress')
              .update({
                total_points: userPositions.total_points + achievement.points_reward,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (!updateError && showNotifications) {
              toast.success(`+${achievement.points_reward} pontos!`);
            }
          }
        }
      }

      // Recarregar conquistas do usuário
      await fetchUserRegionalAchievements();
    } catch (err: any) {
      console.error('Erro ao verificar conquistas regionais:', err);
      setError(err.message);
    }
  };

  // Obter posição do usuário nos rankings
  const getUserPosition = async () => {
    if (!user) return { total_points: 0 };

    try {
      console.log('Obtendo posição do usuário nos rankings...');
      
      // Buscar progresso do usuário
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('total_points, current_level')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') throw progressError;

      const total_points = progress?.total_points || 0;
      const current_level = progress?.current_level || 1;
      
      console.log(`Progresso do usuário: ${total_points} pontos, nível ${current_level}`);

      // Buscar posições nos rankings - ORDENAR por calculated_at DESC e pegar apenas o mais recente de cada tipo
      let { data: allRankings, error: rankingsError } = await supabase
        .from('rankings')
        .select('ranking_type, position, region, calculated_at')
        .eq('user_id', user.id)
        .eq('period', 'all_time')
        .order('calculated_at', { ascending: false });

      if (rankingsError) throw rankingsError;
      
      // Filtrar para pegar apenas o ranking mais recente de cada tipo
      const uniqueRankings = new Map();
      allRankings?.forEach((ranking: any) => {
        const key = ranking.ranking_type;
        if (!uniqueRankings.has(key)) {
          uniqueRankings.set(key, ranking);
        }
      });
      
      let rankings = Array.from(uniqueRankings.values());
      console.log('Rankings do usuário (únicos):', rankings);

      // Se não há rankings, recalcular
      if (!rankings || rankings.length === 0) {
        console.log('Nenhum ranking encontrado para o usuário, recalculando...');
        await calculateRankings();
        
        // Buscar novamente com a mesma lógica
        const { data: updatedAllRankings, error: updatedError } = await supabase
          .from('rankings')
          .select('ranking_type, position, region, calculated_at')
          .eq('user_id', user.id)
          .eq('period', 'all_time')
          .order('calculated_at', { ascending: false });
          
        if (!updatedError && updatedAllRankings) {
          const uniqueUpdated = new Map();
          updatedAllRankings.forEach((ranking: any) => {
            const key = ranking.ranking_type;
            if (!uniqueUpdated.has(key)) {
              uniqueUpdated.set(key, ranking);
            }
          });
          rankings = Array.from(uniqueUpdated.values());
          console.log('Rankings recalculados (únicos):', rankings);
        }
      }

      // Extrair posições
      let national, regional, local;
      if (rankings && rankings.length > 0) {
        for (const rank of rankings) {
          if (rank.ranking_type === 'national') {
            national = rank.position;
            console.log(`Posição nacional: #${national}`);
          }
          else if (rank.ranking_type === 'regional') {
            regional = rank.position;
            console.log(`Posição regional (${rank.region}): #${regional}`);
          }
          else if (rank.ranking_type === 'local') {
            local = rank.position;
            console.log(`Posição local (${rank.region}): #${local}`);
          }
        }
      } else {
        console.log('Nenhum ranking encontrado para o usuário após recálculo');
      }

      return { national, regional, local, total_points, current_level };
    } catch (err: any) {
      console.error('Erro ao obter posição do usuário:', err);
      setError(err.message);
      return { total_points: 0 };
    }
  };

  // Carregar dados ao inicializar
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          await fetchUserLocation();
          await fetchRegionalAchievements();
          await fetchUserRegionalAchievements();
        } catch (err: any) {
          console.error('Erro ao carregar dados de ranking:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [user]);

  // Solicitar localização GPS se não estiver definida
  useEffect(() => {
    if (user && !loading && !userLocation && !isRequestingLocation) {
      updateUserLocationFromGPS().catch(err => {
        console.warn('Não foi possível obter localização automática:', err);
      });
    }
  }, [user, loading, userLocation, isRequestingLocation]);

  return {
    userLocation,
    nationalRanking,
    regionalRanking,
    localRanking,
    regionalAchievements,
    userRegionalAchievements,
    loading,
    error,
    updateUserLocation,
    updateUserLocationFromGPS,
    fetchRankings,
    calculateRankings,
    getUserPosition
  };
};