import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserLocation {
  id: string;
  user_id: string;
  state: string;
  region: string;
  city_approximate?: string;
  postal_code_prefix?: string;
  latitude_approximate?: number;
  longitude_approximate?: number;
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
  created_at: string;
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
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Erro na geolocalização: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  };

  // Converter coordenadas para estado/região
  const getLocationFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Mapeamento de coordenadas aproximadas dos estados brasileiros
      const brazilStates = {
        'AC': { bounds: { north: -7.0, south: -11.0, east: -66.0, west: -73.0 }, region: 'Norte' },
        'AL': { bounds: { north: -8.5, south: -10.0, east: -35.0, west: -38.0 }, region: 'Nordeste' },
        'AP': { bounds: { north: 4.0, south: -2.0, east: -49.0, west: -52.0 }, region: 'Norte' },
        'AM': { bounds: { north: 2.0, south: -13.0, east: -56.0, west: -73.0 }, region: 'Norte' },
        'BA': { bounds: { north: -8.0, south: -18.0, east: -37.0, west: -46.0 }, region: 'Nordeste' },
        'CE': { bounds: { north: -2.0, south: -7.0, east: -37.0, west: -41.0 }, region: 'Nordeste' },
        'DF': { bounds: { north: -15.0, south: -16.0, east: -47.0, west: -48.0 }, region: 'Centro-Oeste' },
        'ES': { bounds: { north: -17.0, south: -21.0, east: -39.0, west: -41.0 }, region: 'Sudeste' },
        'GO': { bounds: { north: -12.0, south: -19.0, east: -46.0, west: -52.0 }, region: 'Centro-Oeste' },
        'MA': { bounds: { north: -1.0, south: -10.0, east: -41.0, west: -48.0 }, region: 'Nordeste' },
        'MT': { bounds: { north: -7.0, south: -18.0, east: -50.0, west: -61.0 }, region: 'Centro-Oeste' },
        'MS': { bounds: { north: -17.0, south: -24.0, east: -51.0, west: -58.0 }, region: 'Centro-Oeste' },
        'MG': { bounds: { north: -14.0, south: -23.0, east: -39.0, west: -51.0 }, region: 'Sudeste' },
        'PA': { bounds: { north: 2.0, south: -9.0, east: -46.0, west: -58.0 }, region: 'Norte' },
        'PB': { bounds: { north: -6.0, south: -8.0, east: -34.0, west: -38.0 }, region: 'Nordeste' },
        'PR': { bounds: { north: -22.0, south: -26.0, east: -48.0, west: -54.0 }, region: 'Sul' },
        'PE': { bounds: { north: -7.0, south: -9.0, east: -34.0, west: -41.0 }, region: 'Nordeste' },
        'PI': { bounds: { north: -5.0, south: -10.0, east: -40.0, west: -45.0 }, region: 'Nordeste' },
        'RJ': { bounds: { north: -20.0, south: -23.0, east: -40.0, west: -45.0 }, region: 'Sudeste' },
        'RN': { bounds: { north: -4.0, south: -6.0, east: -35.0, west: -38.0 }, region: 'Nordeste' },
        'RS': { bounds: { north: -27.0, south: -34.0, east: -49.0, west: -58.0 }, region: 'Sul' },
        'RO': { bounds: { north: -7.0, south: -15.0, east: -59.0, west: -66.0 }, region: 'Norte' },
        'RR': { bounds: { north: 6.0, south: -2.0, east: -58.0, west: -65.0 }, region: 'Norte' },
        'SC': { bounds: { north: -25.0, south: -29.0, east: -48.0, west: -54.0 }, region: 'Sul' },
        'SP': { bounds: { north: -19.0, south: -25.0, east: -44.0, west: -51.0 }, region: 'Sudeste' },
        'SE': { bounds: { north: -9.0, south: -11.0, east: -36.0, west: -38.0 }, region: 'Nordeste' },
        'TO': { bounds: { north: -5.0, south: -13.0, east: -45.0, west: -50.0 }, region: 'Norte' }
      };

      // Encontrar o estado baseado nas coordenadas
      for (const [state, data] of Object.entries(brazilStates)) {
        const { bounds, region } = data;
        if (lat >= bounds.south && lat <= bounds.north && 
            lng >= bounds.west && lng <= bounds.east) {
          return { state, region, coordinates: { lat, lng } };
        }
      }

      // Se não encontrou, retornar localização padrão (Brasília)
      return { 
        state: 'DF', 
        region: 'Centro-Oeste', 
        coordinates: { lat, lng } 
      };
    } catch (error) {
      console.error('Erro ao converter coordenadas:', error);
      return { 
        state: 'DF', 
        region: 'Centro-Oeste', 
        coordinates: { lat, lng } 
      };
    }
  };

  // Atualizar localização do usuário via geolocalização
  const updateUserLocationFromGPS = async () => {
    if (!user) return null;

    try {
      // Solicitar permissão e obter localização
      const coordinates = await getCurrentLocation();
      
      // Converter coordenadas para estado/região
      const locationData = await getLocationFromCoordinates(coordinates.lat, coordinates.lng);
      
      // Salvar no banco de dados
      const { data, error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          state: locationData.state,
          region: locationData.region,
          latitude_approximate: locationData.coordinates.lat,
          longitude_approximate: locationData.coordinates.lng,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setUserLocation(data);
      
      // Recarregar dados
      await fetchRankings('national');
      await fetchRankings('regional');
      await fetchRankings('local');
      
      return { success: true, location: locationData, data };
    } catch (err: any) {
      console.error('Erro ao obter localização:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Atualizar localização do usuário (método antigo mantido para compatibilidade)
  const updateUserLocation = async (locationData: {
    state: string;
    city_approximate?: string;
    postal_code_prefix?: string;
    latitude_approximate?: number;
    longitude_approximate?: number;
  }) => {
    if (!user) return;

    try {
      setError(null);

      const region = STATE_TO_REGION[locationData.state] || 'Desconhecida';

      const { data, error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          state: locationData.state,
          region: region,
          city_approximate: locationData.city_approximate,
          postal_code_prefix: locationData.postal_code_prefix,
          latitude_approximate: locationData.latitude_approximate,
          longitude_approximate: locationData.longitude_approximate,
        })
        .select()
        .single();

      if (error) throw error;

      setUserLocation(data);
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar localização:', err);
      setError(err.message);
      throw err;
    }
  };

  // Buscar rankings
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

      let query = supabase
        .from('rankings')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
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

      const rankingsWithUserInfo = data?.map(entry => ({
        ...entry,
        user_name: entry.profiles?.name || 'Usuário',
        user_avatar: entry.profiles?.avatar_url,
        user_location: `${entry.region || 'Brasil'}`,
      })) || [];

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

  // Calcular rankings
  const calculateRankings = async () => {
    if (!user) return;

    try {
      setError(null);

      // Buscar todos os usuários com progresso
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .order('total_points', { ascending: false});

      if (progressError) {
        console.error('Erro ao buscar user_progress:', progressError);
        throw progressError;
      }
      
      if (!progressData || progressData.length === 0) {
        console.log('Nenhum dado de progresso encontrado');
        return;
      }

      // Buscar localizações de todos os usuários
      const { data: locationsData, error: locationsError } = await supabase
        .from('user_locations')
        .select('*');

      if (locationsError) console.error('Erro ao buscar localizações:', locationsError);

      // Mapear localizações por user_id
      const locationsByUser = new Map(
        locationsData?.map(loc => [loc.user_id, loc]) || []
      );

      // Combinar dados de progresso com localização
      const usersData = progressData.map(progress => ({
        ...progress,
        user_locations: locationsByUser.get(progress.user_id) || null
      }));

      // Calcular ranking nacional
      const nationalRankings = usersData.map((userData, index) => ({
        user_id: userData.user_id,
        ranking_type: 'national' as const,
        position: index + 1,
        total_points: userData.total_points,
        period: 'all_time' as const,
        region: null,
      }));

      // Calcular rankings regionais
      const regionalRankings: any[] = [];
      const localRankings: any[] = [];

      // Agrupar por região e estado
      const byRegion: { [key: string]: any[] } = {};
      const byState: { [key: string]: any[] } = {};

      usersData.forEach((userData) => {
        if (userData.user_locations) {
          const region = userData.user_locations.region;
          const state = userData.user_locations.state;

          if (region) {
            if (!byRegion[region]) byRegion[region] = [];
            byRegion[region].push(userData);
          }

          if (state) {
            if (!byState[state]) byState[state] = [];
            byState[state].push(userData);
          }
        }
      });

      // Calcular posições regionais
      Object.entries(byRegion).forEach(([region, users]) => {
        users
          .sort((a, b) => b.total_points - a.total_points)
          .forEach((userData, index) => {
            regionalRankings.push({
              user_id: userData.user_id,
              ranking_type: 'regional',
              position: index + 1,
              total_points: userData.total_points,
              period: 'all_time',
              region: region,
            });
          });
      });

      // Calcular posições locais (por estado)
      Object.entries(byState).forEach(([state, users]) => {
        users
          .sort((a, b) => b.total_points - a.total_points)
          .forEach((userData, index) => {
            localRankings.push({
              user_id: userData.user_id,
              ranking_type: 'local',
              position: index + 1,
              total_points: userData.total_points,
              period: 'all_time',
              region: state,
            });
          });
      });

      // Limpar rankings antigos
      await supabase.from('rankings').delete().eq('period', 'all_time');

      // Inserir novos rankings
      const allRankings = [...nationalRankings, ...regionalRankings, ...localRankings];
      
      if (allRankings.length > 0) {
        const { error: insertError } = await supabase
          .from('rankings')
          .insert(allRankings);

        if (insertError) throw insertError;
      }

      // Recarregar rankings
      await Promise.all([
        fetchRankings('national'),
        fetchRankings('regional'),
        fetchRankings('local'),
      ]);

      // Verificar conquistas regionais
      await checkRegionalAchievements();

      return allRankings;
    } catch (err: any) {
      console.error('Erro ao calcular rankings:', err);
      setError(err.message);
      throw err;
    }
  };

  // Buscar conquistas regionais
  const fetchRegionalAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('regional_achievements')
        .select('*')
        .order('rarity', { ascending: true });

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
      // Buscar conquistas que o usuário ainda não tem
      const { data: availableAchievements, error: achievementsError } = await supabase
        .from('regional_achievements')
        .select('*')
        .or(`region.eq.Brasil,region.eq.${userLocation.region},region.eq.${userLocation.state}`);

      if (achievementsError) throw achievementsError;

      // Filtrar conquistas que o usuário já possui
      const userAchievementIds = userRegionalAchievements.map(ua => ua.achievement_id);
      const newAvailableAchievements = availableAchievements?.filter(achievement => 
        !userAchievementIds.includes(achievement.id)
      ) || [];

      // Buscar progresso atual do usuário
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError) throw progressError;

      // Buscar posição atual do usuário nos rankings
      const { data: userRankings, error: rankingError } = await supabase
        .from('rankings')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'all_time');

      if (rankingError) throw rankingError;

      const newAchievements = [];

      for (const achievement of newAvailableAchievements) {
        let shouldUnlock = false;

        switch (achievement.requirement_type) {
          case 'points':
            shouldUnlock = userProgress.total_points >= achievement.requirement_value;
            break;
          case 'position':
            const relevantRanking = userRankings?.find(r => 
              (achievement.region === 'Brasil' && r.ranking_type === 'national') ||
              (achievement.region === userLocation.region && r.ranking_type === 'regional') ||
              (achievement.region === userLocation.state && r.ranking_type === 'local')
            );
            shouldUnlock = relevantRanking && relevantRanking.position <= achievement.requirement_value;
            break;
        }

        if (shouldUnlock) {
          // Desbloquear conquista
          const { error: unlockError } = await supabase
            .from('user_regional_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
            });

          if (unlockError) throw unlockError;

          newAchievements.push(achievement);

          // Adicionar pontos da conquista se houver
          if (achievement.points_reward > 0) {
            await supabase
              .from('user_progress')
              .update({
                total_points: userProgress.total_points + achievement.points_reward,
              })
              .eq('user_id', user.id);
          }
        }
      }

      // Recarregar conquistas do usuário se houver novas
      if (newAchievements.length > 0) {
        await fetchUserRegionalAchievements();
      }

      return newAchievements;
    } catch (err: any) {
      console.error('Erro ao verificar conquistas regionais:', err);
      setError(err.message);
      return [];
    }
  };

  // Obter posição do usuário atual
  const getUserPosition = (type: 'national' | 'regional' | 'local') => {
    if (!user) return null;

    let rankings: RankingEntry[] = [];
    switch (type) {
      case 'national':
        rankings = nationalRanking;
        break;
      case 'regional':
        rankings = regionalRanking;
        break;
      case 'local':
        rankings = localRanking;
        break;
    }

    return rankings.find(ranking => ranking.user_id === user.id) || null;
  };

  // Inicializar dados
  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        setLoading(true);
        await fetchUserLocation();
        await fetchRegionalAchievements();
        await fetchUserRegionalAchievements();
        
        // Se não tem localização, solicitar automaticamente
        if (!userLocation) {
          console.log('Usuário sem localização, solicitando GPS automaticamente...');
          try {
            const result = await updateUserLocationFromGPS();
            if (result?.success) {
              console.log('Localização obtida automaticamente:', result.location);
            }
          } catch (error) {
            console.log('Não foi possível obter localização automaticamente:', error);
          }
        }
        
        setLoading(false);
      };

      initializeData();
    }
  }, [user]);

  // Efeito para solicitar localização quando userLocation mudar
  useEffect(() => {
    if (user && userLocation) {
      // Recarregar rankings quando localização for definida
      const reloadRankings = async () => {
        await Promise.all([
          fetchRankings('national'),
          fetchRankings('regional'),
          fetchRankings('local'),
        ]);
      };
      reloadRankings();
    }
  }, [userLocation]);

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
    checkRegionalAchievements,
    getUserPosition,
    fetchUserRegionalAchievements,
  };
};
