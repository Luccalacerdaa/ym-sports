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
    if (!user) return { success: false, error: 'Usuário não autenticado' };

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
    if (!user) return;

    try {
      // Mapear estado para região
      const region = STATE_TO_REGION[state] || 'Desconhecido';

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

        if (error) throw error;
      } else {
        // Inserir nova localização
        const { error } = await supabase
          .from('user_locations')
          .insert(locationData);

        if (error) throw error;
      }

      // Atualizar estado local
      await fetchUserLocation();
      
      return { success: true, location: { state, region, city: city_approximate } };
    } catch (err: any) {
      console.error('Erro ao atualizar localização do usuário:', err);
      setError(err.message);
      throw err;
    }
  };

  // Buscar rankings - CORRIGIDO para evitar erro 400
  const fetchRankings = async (type: 'national' | 'regional' | 'local' = 'national') => {
    try {
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

      // ALTERAÇÃO: Buscar rankings sem a junção direta com profiles
      let query = supabase
        .from('rankings')
        .select('*')
        .eq('period', 'all_time')
        .order('position', { ascending: true });

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
      
      // Buscar perfis com mais detalhes (removido campo username que não existe)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Erro ao buscar perfis:', profilesError);
      }

      console.log('Perfis encontrados:', profilesData?.length || 0);
      console.log('Perfis encontrados (amostra):', profilesData?.slice(0, 3));
      
      // Buscar progresso para garantir pontuação correta
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, total_points')
        .in('user_id', userIds);
        
      if (progressError) {
        console.warn('Erro ao buscar progresso dos usuários:', progressError);
      }
      
      // Combinar dados de rankings com perfis e progresso
      const rankingsWithUserInfo = data.map(entry => {
        const profile = profilesData?.find(p => p.id === entry.user_id);
        const progress = progressData?.find(p => p.user_id === entry.user_id);
        
        // Usar nome do perfil ou "Usuário" como fallback
        const displayName = profile?.name || `Usuário #${entry.position}`;
        
        // Usar pontos do progresso se disponíveis (mais atualizados)
        const points = progress?.total_points || entry.total_points;
        
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
      progressData.sort((a, b) => b.total_points - a.total_points);
      
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
          const users = regionGroups[region].sort((a, b) => b.total_points - a.total_points);
          const regionalRankings = users.map((user, index) => ({
            user_id: user.user_id,
            ranking_type: 'regional',
            region,
            position: index + 1,
            total_points: user.total_points,
            period: 'all_time',
            calculated_at: now
          }));
          rankingsToInsert.push(...regionalRankings);
        }
        
        // Calcular rankings locais (por estado)
        for (const state in stateGroups) {
          const users = stateGroups[state].sort((a, b) => b.total_points - a.total_points);
          const localRankings = users.map((user, index) => ({
            user_id: user.user_id,
            ranking_type: 'local',
            region: state,
            position: index + 1,
            total_points: user.total_points,
            period: 'all_time',
            calculated_at: now
          }));
          rankingsToInsert.push(...localRankings);
        }
      }
      
      console.log(`✅ Calculados ${rankingsToInsert.length} rankings`);
      
      // Limpar rankings existentes
      const { error: deleteError } = await supabase
        .from('rankings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Trick para deletar tudo
      
      if (deleteError) {
        console.error('❌ Erro ao limpar rankings existentes:', deleteError);
        throw deleteError;
      }
      
      // Inserir novos rankings (em lotes de 100)
      const BATCH_SIZE = 100;
      for (let i = 0; i < rankingsToInsert.length; i += BATCH_SIZE) {
        const batch = rankingsToInsert.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase
          .from('rankings')
          .insert(batch);
        
        if (insertError) {
          console.error(`❌ Erro ao inserir lote ${i/BATCH_SIZE + 1}:`, insertError);
          throw insertError;
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
      const { data: rankings, error: rankingsError } = await supabase
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
    if (user && !loading && !userLocation) {
      updateUserLocationFromGPS().catch(err => {
        console.warn('Não foi possível obter localização automática:', err);
      });
    }
  }, [user, loading, userLocation]);

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