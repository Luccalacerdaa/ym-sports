import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRanking } from '@/hooks/useRanking';
import { useProfile } from '@/hooks/useProfile';
import { useProgress } from '@/hooks/useProgress';
import { RankingGrid } from '@/components/RankingGrid';
import { PlayerStats } from '@/components/PlayerStats';
import { toast } from 'sonner';
import { 
  Trophy, 
  MapPin, 
  Medal, 
  Users,
  Map,
  Plus,
  RefreshCw,
  Flag,
  Globe,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Lista de estados brasileiros
const STATE_OPTIONS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Lista de regiões brasileiras
const REGION_OPTIONS = [
  { value: 'Norte', label: 'Norte' },
  { value: 'Nordeste', label: 'Nordeste' },
  { value: 'Centro-Oeste', label: 'Centro-Oeste' },
  { value: 'Sudeste', label: 'Sudeste' },
  { value: 'Sul', label: 'Sul' }
];

export default function NewRanking() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { 
    nationalRanking, 
    regionalRanking, 
    localRanking, 
    userLocation, 
    loading, 
    error, 
    updateUserLocation, 
    updateUserLocationFromGPS,
    calculateRankings, 
    getUserPosition,
    fetchRankings,
    regionalAchievements,
    userRegionalAchievements
  } = useRanking();
  
  const [selectedTab, setSelectedTab] = useState('national');
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [hasInitializedRankings, setHasInitializedRankings] = useState(false);
  const [locationForm, setLocationForm] = useState({
    state: '',
    region: '',
    city: ''
  });
  const [userPosition, setUserPosition] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [levelProgress, setLevelProgress] = useState<number>(0);
  const isInitializingRef = useRef(false);
  
  const { getLevelProgress } = useProgress();

  // Buscar posição do usuário (APENAS quando carrega, não quando muda de aba)
  useEffect(() => {
    if (!loading && hasInitializedRankings) {
      const fetchUserPosition = async () => {
        try {
          const position = await getUserPosition();
          console.log('Posição do usuário obtida:', position);
          setUserPosition(position);
        } catch (error) {
          console.error('Erro ao buscar posição do usuário:', error);
        }
      };
      fetchUserPosition();
    }
  }, [loading, hasInitializedRankings]); // ✅ Removido selectedTab

  // Calcular progresso de nível sempre que a posição mudar
  useEffect(() => {
    const calculateProgress = async () => {
      if (userPosition?.total_points && userPosition?.current_level) {
        try {
          const { progress } = await getLevelProgress(userPosition.total_points, userPosition.current_level);
          setLevelProgress(progress);
        } catch (error) {
          console.error('Erro ao calcular progresso de nível:', error);
          setLevelProgress(0);
        }
      }
    };
    calculateProgress();
  }, [userPosition]);

  // Forçar recálculo de rankings ao carregar (apenas uma vez)
  useEffect(() => {
    const recalculateRankings = async () => {
      if (!loading && user && !hasInitializedRankings && !isInitializingRef.current) {
        try {
          console.log('Recalculando rankings...');
          isInitializingRef.current = true;
          setHasInitializedRankings(true);
          
          await calculateRankings();
          await fetchRankings('national');
          
          // Buscar rankings regionais/locais se houver localização
          if (userLocation) {
            await fetchRankings('regional');
            await fetchRankings('local');
          }
          
          const position = await getUserPosition();
          setUserPosition(position);
          console.log('Rankings recalculados com sucesso!');
        } catch (error) {
          console.error('Erro ao recalcular rankings:', error);
          setHasInitializedRankings(false); // Permitir nova tentativa em caso de erro
        } finally {
          isInitializingRef.current = false;
        }
      }
    };
    
    recalculateRankings();
  }, [user, loading, hasInitializedRankings]);

  // ❌ REMOVIDO: Causava duplicação de fetchRankings
  // Regional e local já são carregados no useEffect de recalculateRankings

  const handleUpdateLocation = async () => {
    if (!locationForm.state || !locationForm.region) {
      toast.error("Por favor, selecione estado e região");
      return;
    }

    try {
      await updateUserLocation({
        state: locationForm.state,
        region: locationForm.region,
        city_approximate: locationForm.city || `Cidade em ${locationForm.state}`
      });
      
      toast.success("Localização atualizada com sucesso!");
      setIsLocationDialogOpen(false);
      
      // Recalcular rankings
      await calculateRankings();
      await fetchRankings('regional');
      await fetchRankings('local');
      
      const position = await getUserPosition();
      setUserPosition(position);
    } catch (error) {
      toast.error("Erro ao atualizar localização");
    }
  };

  const handleRefreshRankings = async () => {
    setIsRefreshing(true);
    try {
      await calculateRankings();
      await fetchRankings('national');
      if (userLocation) {
        await fetchRankings('regional');
        await fetchRankings('local');
      }
      const position = await getUserPosition();
      setUserPosition(position);
      toast.success("Rankings atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar rankings");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGetGPSLocation = async () => {
    console.log('🌍 [GPS] handleGetGPSLocation chamado!');
    setIsGettingLocation(true);
    try {
      console.log('📍 [GPS] Chamando updateUserLocationFromGPS...');
      const result = await updateUserLocationFromGPS();
      
      if (result.success) {
        console.log('✅ [GPS] Localização obtida com sucesso!');
        toast.success("📍 Localização atualizada via GPS!");
        
        // Aguardar 1 segundo para o banco sincronizar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Recalcular rankings (forçando atualização, sem cache)
        console.log('🔄 [GPS] Recalculando rankings...');
        await calculateRankings();
        
        // Aguardar 1 segundo para sincronização
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Forçar recarga de TODOS os rankings
        await fetchRankings('national', true); // forceRefresh = true
        await fetchRankings('regional', true); // forceRefresh = true
        await fetchRankings('local', true); // forceRefresh = true
        
        const position = await getUserPosition();
        setUserPosition(position);
        
        // Forçar re-render da página
        setHasInitializedRankings(false);
        setTimeout(() => setHasInitializedRankings(true), 100);
        
        toast.success("🎯 Rankings recalculados com base na sua localização!");
      } else {
        console.error('❌ [GPS] Erro ao obter localização:', result.error);
        toast.error(result.error || "Não foi possível obter sua localização");
      }
    } catch (error: any) {
      console.error('❌ [GPS] Erro exception:', error);
      toast.error(error.message || "Erro ao atualizar localização");
    } finally {
      setIsGettingLocation(false);
      console.log('🏁 [GPS] Processo finalizado');
    }
  };

  if (loading && !userPosition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>
          <p className="text-muted-foreground">
            Compare seu desempenho com outros atletas em diferentes níveis.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão para detectar localização GPS */}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleGetGPSLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Detectando GPS...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                {userLocation ? 'Atualizar Localização' : 'Detectar Localização GPS'}
              </>
            )}
          </Button>

          {/* Botão para configurar manualmente (opcional) */}
          <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Configurar manualmente">
                <Map className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Localização Manualmente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select 
                    value={locationForm.state} 
                    onValueChange={(value) => setLocationForm({...locationForm, state: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATE_OPTIONS.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Região</Label>
                  <Select 
                    value={locationForm.region} 
                    onValueChange={(value) => setLocationForm({...locationForm, region: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua região" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_OPTIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade (opcional)</Label>
                  <Input 
                    id="city"
                    value={locationForm.city}
                    onChange={(e) => setLocationForm({...locationForm, city: e.target.value})}
                    placeholder="Digite sua cidade"
                  />
                </div>
                
                <Button onClick={handleUpdateLocation} className="w-full">
                  Salvar Localização
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefreshRankings}
            disabled={isRefreshing}
            title="Atualizar rankings"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Estatísticas do Jogador */}
      <PlayerStats 
        name={profile?.name || 'Usuário'}
        avatar={profile?.avatar_url}
        totalPoints={userPosition?.total_points || 0}
        level={userPosition?.current_level || 1}
        national={userPosition?.national}
        regional={userPosition?.regional}
        local={userPosition?.local}
        region={userLocation?.region}
        state={userLocation?.state}
        levelProgress={levelProgress}
      />
      
      {/* Tabs de Ranking */}
      <Tabs defaultValue="national" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="national" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Ranking</span> Nacional
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Ranking</span> Regional
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Ranking</span> Local
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="national" className="space-y-8">
          <RankingGrid 
            rankings={nationalRanking} 
            type="national" 
            loading={loading}
            title="Ranking Nacional"
          />
        </TabsContent>
        
        <TabsContent value="regional" className="space-y-8">
          {userLocation ? (
            <RankingGrid 
              rankings={regionalRanking} 
              type="regional" 
              loading={loading}
              title={`Ranking Regional - ${userLocation.region}`}
            />
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Localização não configurada</h3>
                  <p className="text-muted-foreground mb-6">
                    Configure sua localização para ver o ranking regional
                  </p>
                  <Button onClick={() => setIsLocationDialogOpen(true)}>
                    Configurar Localização
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Conquistas Regionais */}
          {userRegionalAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-primary" />
                  Conquistas Regionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {userRegionalAchievements.map((achievement) => (
                    <Card key={achievement.id} className="overflow-hidden">
                      <div className="bg-primary/10 p-4 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm">{achievement.achievement?.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.achievement?.description}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          +{achievement.achievement?.points_reward || 0} pts
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="local" className="space-y-8">
          {userLocation ? (
            <RankingGrid 
              rankings={localRanking} 
              type="local" 
              loading={loading}
              title={`Ranking Local - ${userLocation.state}`}
            />
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Localização não configurada</h3>
                  <p className="text-muted-foreground mb-6">
                    Configure sua localização para ver o ranking local
                  </p>
                  <Button onClick={() => setIsLocationDialogOpen(true)}>
                    Configurar Localização
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
