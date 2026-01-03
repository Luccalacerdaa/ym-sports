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
  const [nationalRanking, setNationalRanking] = useState<RankingEntry[]>([]);
  const [regionalRanking, setRegionalRanking] = useState<RankingEntry[]>([]);
  const [localRanking, setLocalRanking] = useState<RankingEntry[]>([]);
  const [regionalAchievements, setRegionalAchievements] = useState<RegionalAchievement[]>([]);
  const [userRegionalAchievements, setUserRegionalAchievements] = useState<UserRegionalAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

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
    if (!user || isRequestingLocation) return { success: false, error: 'Usuário não autenticado ou já solicitando localização' };

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
  const fetchRankings = async (type: 'national' | 'regional' | 'local' = 'national') => {
    try {
      setError(null);

      // ESPECIAL: Para ranking local, buscar por GPS (raio de 100km)
      if (type === 'local' && userLocation?.latitude_approximate && userLocation?.longitude_approximate) {
        console.log('🌍 Buscando ranking local por GPS (raio de 100km)...');
        
        // Buscar todas as localizações com GPS
        const { data: allLocations, error: locError } = await supabase
          .from('user_locations')
          .select('user_id, latitude_approximate, longitude_approximate, city_approximate, state')
          .not('latitude_approximate', 'is', null)
          .not('longitude_approximate', 'is', null);

        if (locError) throw locError;

        // Filtrar por distância
        const nearbyUsers = allLocations
          ?.filter(loc => {
            const distance = calculateDistance(
              userLocation.latitude_approximate!,
              userLocation.longitude_approximate!,
              loc.latitude_approximate!,
              loc.longitude_approximate!
            );
            console.log(`📍 Usuário ${loc.user_id}: ${distance.toFixed(2)}km de distância`);
            return distance <= 100; // 100km
          })
          .map(loc => loc.user_id) || [];

        console.log(`👥 Encontrados ${nearbyUsers.length} usuários próximos (raio de 100km)`);

        if (nearbyUsers.length === 0) {
          console.log('⚠️ Nenhum usuário próximo encontrado, mostrando ranking do estado');
          // Fallback para ranking por estado
        } else {
          // Buscar progresso dos usuários próximos
          const { data: progressData, error: progError } = await supabase
            .from('user_progress')
            .select('user_id, points')
            .in('user_id', nearbyUsers)
            .order('points', { ascending: false });

          if (progError) throw progError;

          // Buscar perfis
          const { data: profilesData, error: profError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', nearbyUsers);

          if (profError) console.warn('Erro ao buscar perfis:', profError);

          // Montar ranking local por GPS
          const localByGPS: RankingEntry[] = (progressData || []).map((p, idx) => {
            const profile = profilesData?.find(prof => prof.id === p.user_id);
            const loc = allLocations?.find(l => l.user_id === p.user_id);
            return {
              id: `${p.user_id}-local-gps`,
              user_id: p.user_id,
              ranking_type: 'local',
              region: loc?.city_approximate || loc?.state || 'Próximo',
              position: idx + 1,
              total_points: p.points || 0,
              period: 'all_time',
              profile: profile ? {
                id: profile.id,
                name: profile.name,
                avatar_url: profile.avatar_url
              } : undefined
            } as RankingEntry;
          });

          setLocalRanking(localByGPS);
          console.log(`✅ Ranking local por GPS configurado: ${localByGPS.length} atletas`);
          return localByGPS;
        }
      }

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
      console.log(`Buscando rankings do tipo: ${type}`);
      let query = supabase
        .from('rankings')
        .select('*')
        .eq('period', 'all_time')
        .order('total_points', { ascending: false }) // Ordenar por pontos, não por posição
        .order('position', { ascending: true }); // Usar posição como critério secundário

      if (type === 'regional' && userLocation) {
        query = query.eq('ranking_type', 'regional').eq('region', userLocation.region);
      } else if (type === 'local' && userLocation) {
        query = query.eq('ranking_type', 'local').eq('region', userLocation.state);
      } else if (type === 'national') {
        query = query.eq('ranking_type', 'national');
      }

      const { data, error } = await query.limit(50);

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
      
      // Buscar perfis individualmente para debug
      console.log(`Tentando buscar perfis individualmente para debug...`);
      for (const userId of userIds.slice(0, 3)) { // Limitar a 3 para não sobrecarregar os logs
        const { data: singleProfile, error: singleError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', userId)
          .single();
          
        console.log(`Perfil para ID ${userId}:`, singleProfile ? JSON.stringify(singleProfile) : 'Não encontrado');
        if (singleError) {
          console.error(`Erro ao buscar perfil para ID ${userId}:`, singleError);
        }
      }
      
      // Buscar todos os perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('❌ Erro ao buscar perfis:', profilesError);
        console.warn('Detalhes do erro:', {
          message: profilesError.message,
          code: profilesError.code,
          details: profilesError.details,
          hint: profilesError.hint
        });
      }

      // Log detalhado para debug
      console.log('Perfis encontrados:', profilesData?.length || 0);
      if (profilesData && profilesData.length > 0) {
        console.log('Exemplo de perfil encontrado:', JSON.stringify(profilesData[0]));
        console.log('Lista completa de perfis:', JSON.stringify(profilesData.map(p => ({
          id: p.id,
          name: p.name,
          has_avatar: !!p.avatar_url
        }))));
      } else {
        console.log('⚠️ Nenhum perfil encontrado! IDs buscados:', JSON.stringify(userIds));
      }
      
      // Verificar se há usuários sem perfil e criar perfis temporários em memória
      const missingProfileIds = userIds.filter(id => 
        !profilesData || !profilesData.some(p => p.id === id)
      );
      
      console.log(`Usuários sem perfil: ${missingProfileIds.length}`);
      
      // Criar perfis temporários para usuários que não têm perfil
      const temporaryProfiles = missingProfileIds.map(id => {
        console.log(`Criando perfil temporário para usuário ${id}`);
        
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
      
      console.log(`Total de perfis após adicionar temporários: ${allProfiles.length}`);
      
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
      // Primeiro, remover duplicatas (mesmo usuário aparecendo mais de uma vez)
      const uniqueUserIds = new Set();
      const uniqueRankings = data.filter(entry => {
        if (uniqueUserIds.has(entry.user_id)) {
          console.log(`⚠️ Usuário duplicado encontrado: ${entry.user_id} - Posição: ${entry.position} - Tipo: ${entry.ranking_type}`);
          return false; // Filtrar duplicatas
        }
        uniqueUserIds.add(entry.user_id);
        return true;
      });
      
      console.log(`Rankings únicos após remoção de duplicatas: ${uniqueRankings.length}`);
      
      // Reordenar rankings por pontos e recalcular posições
      uniqueRankings.sort((a, b) => {
        // Ordenar por pontos (decrescente)
        if (b.total_points !== a.total_points) {
          return b.total_points - a.total_points;
        }
        // Se pontos iguais, desempatar por ID
        return a.user_id.localeCompare(b.user_id);
      });
      
      // Atualizar posições com base na nova ordenação
      uniqueRankings.forEach((ranking, index) => {
        ranking.position = index + 1;
      });
      
      console.log(`Rankings reordenados e posições recalculadas: ${uniqueRankings.length}`);
      
      // Agora mapear os rankings únicos para adicionar informações de usuário
      const rankingsWithUserInfo = uniqueRankings.map(entry => {
        const profile = allProfiles.find(p => p.id === entry.user_id);
        const progress = progressData?.find(p => p.user_id === entry.user_id);
        
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
        
        // Log detalhado para cada entrada
        console.log(`Processando ranking: ID=${entry.user_id}, Posição=${entry.position}, Tipo=${entry.ranking_type}`);
        console.log(`  > Perfil encontrado: ${profile ? 'Sim' : 'Não'}, Nome: ${profile?.name || 'Não definido'}`);
        console.log(`  > Progresso encontrado: ${progress ? 'Sim' : 'Não'}, Pontos: ${progress?.total_points || 'Não definido'}`);
        console.log(`  > Nome final: ${displayName}, Pontos finais: ${points}`);
        
        return {
          ...entry,
          user_name: displayName,
          user_avatar: profile?.avatar_url,
          user_location: `${entry.region || 'Brasil'}`,
          total_points: points, // Atualizar pontos com o valor mais recente
        };
      });

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
    }
  };

  // Calcular rankings - CORRIGIDO para evitar erro 400
  const calculateRankings = async () => {
    if (!user) return;

    try {
      setError(null);

      // Buscar todos os usuários com progresso
      console.log('🔍 Buscando user_progress...');
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .order('total_points', { ascending: false});

      if (progressError) {
        console.error('❌ Erro ao buscar user_progress:', progressError);
        console.error('Detalhes:', {
          message: progressError.message,
          code: progressError.code,
          details: progressError.details,
          hint: progressError.hint
        });
        throw progressError;
      }
      
      console.log(`✅ Encontrados ${progressData?.length || 0} usuários com progresso`);
      
      // Buscar perfis separadamente
      let profilesData: any[] = [];
      if (progressData && progressData.length > 0) {
        const userIds = progressData.map(p => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);
        
        if (!profilesError && profiles) {
          profilesData = profiles;
        }
      }
      
      if (!progressData || progressData.length === 0) {
        console.log('Nenhum dado de progresso encontrado');
        return;
      }

      // Buscar localizações de todos os usuários
      const { data: locationsData, error: locationsError } = await supabase
        .from('user_locations')
        .select('*');

      if (locationsError) {
        console.error('❌ Erro ao buscar user_locations:', locationsError);
        throw locationsError;
      }
      
      console.log(`✅ Encontradas ${locationsData?.length || 0} localizações de usuários`);

      // Calcular rankings
      const now = new Date().toISOString();
      const rankingsToInsert = [];
      
      // Ordenar progresso por pontos (decrescente) para garantir posições corretas
      console.log('Dados de progresso antes da ordenação:', JSON.stringify(progressData.map(p => ({
        user_id: p.user_id, 
        points: p.total_points,
        profile: profilesData.find(profile => profile.id === p.user_id)?.name || 'Desconhecido'
      }))));
      
      // Verificar se há valores nulos ou indefinidos nos pontos
      const invalidPoints = progressData.filter(p => p.total_points === null || p.total_points === undefined);
      if (invalidPoints.length > 0) {
        console.error('⚠️ ALERTA: Encontrados registros com pontos nulos ou indefinidos:', invalidPoints);
        
        // Corrigir pontos nulos/indefinidos para evitar problemas na ordenação
        invalidPoints.forEach(p => {
          console.log(`Corrigindo pontos nulos para o usuário ${p.user_id}: 0 pontos`);
          p.total_points = 0;
        });
      }
      
      // Verificar se há pontos não numéricos
      const nonNumericPoints = progressData.filter(p => typeof p.total_points !== 'number');
      if (nonNumericPoints.length > 0) {
        console.error('⚠️ ALERTA: Encontrados registros com pontos não numéricos:', nonNumericPoints);
        
        // Corrigir pontos não numéricos
        nonNumericPoints.forEach(p => {
          console.log(`Corrigindo pontos não numéricos para o usuário ${p.user_id}: ${p.total_points} -> ${Number(p.total_points) || 0}`);
          p.total_points = Number(p.total_points) || 0;
        });
      }
      
      // Ordenação segura com verificação de tipos
      progressData.sort((a, b) => {
        const pointsA = typeof a.total_points === 'number' ? a.total_points : 0;
        const pointsB = typeof b.total_points === 'number' ? b.total_points : 0;
        
        // Se os pontos são iguais, desempatar por ID para garantir ordem consistente
        if (pointsB === pointsA) {
          return a.user_id.localeCompare(b.user_id);
        }
        
        return pointsB - pointsA;
      });
      
      console.log('Dados de progresso APÓS ordenação:', JSON.stringify(progressData.map(p => ({
        user_id: p.user_id, 
        points: p.total_points,
        profile: profilesData.find(profile => profile.id === p.user_id)?.name || 'Desconhecido'
      }))));
      
      // Ranking nacional
      const nationalRankings = progressData.map((progress, index) => {
        // Buscar perfil do usuário para debug
        const profile = profilesData.find(p => p.id === progress.user_id);
        console.log(`Ranking nacional #${index + 1}: ${profile?.name || progress.user_id} - ${progress.total_points} pontos`);
        
        return {
          user_id: progress.user_id,
          ranking_type: 'national',
          position: index + 1,
          total_points: progress.total_points,
          period: 'all_time',
          calculated_at: now
        };
      });
      rankingsToInsert.push(...nationalRankings);
      
      // Rankings regionais e locais
      if (locationsData && locationsData.length > 0) {
        // Agrupar por região
        const regionGroups: { [key: string]: any[] } = {};
        const stateGroups: { [key: string]: any[] } = {};
        
        // Combinar progresso com localização
        for (const progress of progressData) {
          const location = locationsData.find(loc => loc.user_id === progress.user_id);
          if (location) {
            // Agrupar por região
            if (!regionGroups[location.region]) {
              regionGroups[location.region] = [];
            }
            regionGroups[location.region].push({
              ...progress,
              region: location.region
            });
            
            // Agrupar por estado
            if (!stateGroups[location.state]) {
              stateGroups[location.state] = [];
            }
            stateGroups[location.state].push({
              ...progress,
              region: location.state
            });
          }
        }
        
        // Calcular rankings regionais
        for (const region in regionGroups) {
          // Ordenação segura com verificação de tipos e desempate
          const users = regionGroups[region].sort((a, b) => {
            const pointsA = typeof a.total_points === 'number' ? a.total_points : 0;
            const pointsB = typeof b.total_points === 'number' ? b.total_points : 0;
            
            // Se os pontos são iguais, desempatar por ID para garantir ordem consistente
            if (pointsB === pointsA) {
              return a.user_id.localeCompare(b.user_id);
            }
            
            return pointsB - pointsA;
          });
          
          console.log(`Ranking regional ${region} (ordenado):`, JSON.stringify(users.map(u => ({
            user_id: u.user_id,
            points: u.total_points,
            profile: profilesData.find(profile => profile.id === u.user_id)?.name || 'Desconhecido'
          }))));
          
          const regionalRankings = users.map((user, index) => ({
            user_id: user.user_id,
            ranking_type: 'regional',
            region,
            position: index + 1,
            total_points: typeof user.total_points === 'number' ? user.total_points : 0,
            period: 'all_time',
            calculated_at: now
          }));
          rankingsToInsert.push(...regionalRankings);
        }
        
        // Calcular rankings locais (por estado)
        for (const state in stateGroups) {
          // Ordenação segura com verificação de tipos e desempate
          const users = stateGroups[state].sort((a, b) => {
            const pointsA = typeof a.total_points === 'number' ? a.total_points : 0;
            const pointsB = typeof b.total_points === 'number' ? b.total_points : 0;
            
            // Se os pontos são iguais, desempatar por ID para garantir ordem consistente
            if (pointsB === pointsA) {
              return a.user_id.localeCompare(b.user_id);
            }
            
            return pointsB - pointsA;
          });
          
          console.log(`Ranking local ${state} (ordenado):`, JSON.stringify(users.map(u => ({
            user_id: u.user_id,
            points: u.total_points,
            profile: profilesData.find(profile => profile.id === u.user_id)?.name || 'Desconhecido'
          }))));
          
          const localRankings = users.map((user, index) => ({
            user_id: user.user_id,
            ranking_type: 'local',
            region: state,
            position: index + 1,
            total_points: typeof user.total_points === 'number' ? user.total_points : 0,
            period: 'all_time',
            calculated_at: now
          }));
          rankingsToInsert.push(...localRankings);
        }
      }
      
      console.log(`✅ Calculados ${rankingsToInsert.length} rankings`);
      
      // Usar upsert em vez de delete + insert para evitar erros de chave duplicada
      const BATCH_SIZE = 100;
      for (let i = 0; i < rankingsToInsert.length; i += BATCH_SIZE) {
        const batch = rankingsToInsert.slice(i, i + BATCH_SIZE);
        const { error: upsertError } = await supabase
          .from('rankings')
          .upsert(batch, {
            onConflict: 'user_id,ranking_type,region,period',
            ignoreDuplicates: false // Atualizar registros existentes
          });
        
        if (upsertError) {
          console.error(`❌ Erro ao atualizar lote ${Math.floor(i/BATCH_SIZE) + 1}:`, upsertError);
          // Continuar mesmo com erro para tentar processar outros lotes
          console.log('Continuando com o próximo lote...');
          continue;
        } else {
          console.log(`✅ Lote ${Math.floor(i/BATCH_SIZE) + 1} processado com sucesso`);
        }
      }
      
      console.log('✅ Rankings calculados e atualizados com sucesso!');
      
      // Verificar conquistas regionais
      await checkRegionalAchievements();
      
      // Recarregar rankings
      if (userLocation) {
        await fetchRankings('national');
        await fetchRankings('regional');
        await fetchRankings('local');
      }
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
  const checkRegionalAchievements = async () => {
    if (!user || !userLocation) return;

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

          // Notificar usuário
          toast.success(`🏆 Nova conquista regional desbloqueada: ${achievement.name}`);

          // Adicionar pontos ao usuário
          if (achievement.points_reward > 0) {
            const { error: updateError } = await supabase
              .from('user_progress')
              .update({
                total_points: userPositions.total_points + achievement.points_reward,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (!updateError) {
              toast.success(`+${achievement.points_reward} pontos adicionados!`);
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

      // Buscar posições nos rankings
      let { data: rankings, error: rankingsError } = await supabase
        .from('rankings')
        .select('ranking_type, position, region')
        .eq('user_id', user.id)
        .eq('period', 'all_time');

      if (rankingsError) throw rankingsError;
      
      console.log('Rankings do usuário:', rankings);

      // Se não há rankings, recalcular
      if (!rankings || rankings.length === 0) {
        console.log('Nenhum ranking encontrado para o usuário, recalculando...');
        await calculateRankings();
        
        // Buscar novamente
        const { data: updatedRankings, error: updatedError } = await supabase
          .from('rankings')
          .select('ranking_type, position, region')
          .eq('user_id', user.id)
          .eq('period', 'all_time');
          
        if (!updatedError && updatedRankings) {
          console.log('Rankings recalculados:', updatedRankings);
          rankings = updatedRankings;
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