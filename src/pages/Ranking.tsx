import { useState, useEffect } from 'react';
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
import { MapRanking } from '@/components/MapRanking';
import { GeoVisualizer } from '@/components/GeoVisualizer';
import '../styles/geo-visualizer.css';
import { toast } from 'sonner';
import { 
  Trophy, 
  MapPin, 
  Medal, 
  Crown, 
  Star, 
  Award,
  Target,
  TrendingUp,
  Users,
  Map,
  Plus,
  RefreshCw,
  Flag,
  Globe
} from 'lucide-react';

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
  { value: 'TO', label: 'Tocantins' },
];

export default function Ranking() {
  const { 
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
  } = useRanking();
  
  const { progress } = useProgress();
  const [selectedTab, setSelectedTab] = useState('national');
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userPosition, setUserPosition] = useState<any>(null);
  const [locationForm, setLocationForm] = useState({
    state: '',
    city_approximate: '',
    postal_code_prefix: '',
  });
  
  // Buscar posição do usuário
  useEffect(() => {
    if (!loading) {
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
  }, [loading, selectedTab]);

  // Buscar rankings ao carregar
  useEffect(() => {
    if (!loading) {
      const loadRankings = async () => {
        // Forçar recálculo dos rankings para garantir dados atualizados
        try {
          console.log("Recalculando rankings...");
          await calculateRankings();
          console.log("Rankings recalculados com sucesso!");
          
          // Buscar rankings atualizados
          await fetchRankings('national');
          if (userLocation) {
            await fetchRankings('regional');
            await fetchRankings('local');
          }
        } catch (error) {
          console.error("Erro ao carregar rankings:", error);
        }
      };
      
      loadRankings();
    }
  }, [loading, userLocation]);

  const handleGetGPSLocation = async () => {
    console.log('🌍 [GPS] handleGetGPSLocation chamado!');
    setIsGettingLocation(true);
    try {
      console.log('📍 [GPS] Chamando updateUserLocationFromGPS...');
      const result = await updateUserLocationFromGPS();
      console.log('✅ [GPS] Resultado:', result);
      
      if (result?.success) {
        toast.success(`📍 Localização atualizada: ${result.location.state} - ${result.location.region}`);
        setIsLocationDialogOpen(false);
        
        // Recarregar rankings com delay para garantir que a localização foi salva
        console.log('🔄 Recalculando rankings após atualização de localização...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s
        await calculateRankings();
        
        // Forçar recarga dos rankings
        await fetchRankings('national');
        await fetchRankings('regional');
        await fetchRankings('local');
        
        // Buscar nova posição do usuário
        const newPosition = await getUserPosition();
        setUserPosition(newPosition);
        
        toast.success('✅ Rankings atualizados com sua nova localização!');
      } else {
        toast.error(result?.error || 'Erro ao obter localização');
      }
    } catch (error: any) {
      console.error('❌ [GPS] Erro ao obter localização:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationForm.state) {
      toast.error("Selecione seu estado");
      return;
    }

    try {
      // Chamar com os 3 parâmetros corretos
      const result = await updateUserLocation(
        locationForm.state, 
        locationForm.city_approximate || '', 
        locationForm.postal_code_prefix || ''
      );
      
      if (result?.success) {
        setIsLocationDialogOpen(false);
        toast.success("Localização atualizada com sucesso!");
        
        // Recalcular rankings com nova localização
        console.log('🔄 Recalculando rankings após atualização manual...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s
        await calculateRankings();
        
        // Forçar recarga dos rankings
        await fetchRankings('national');
        await fetchRankings('regional');
        await fetchRankings('local');
        
        // Buscar nova posição do usuário
        const newPosition = await getUserPosition();
        setUserPosition(newPosition);
        
        toast.success('✅ Rankings atualizados com sua nova localização!');
      } else {
        toast.error(result?.error || 'Erro ao atualizar localização');
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar localização:', error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleRefreshRankings = async () => {
    try {
      await calculateRankings();
      toast.success("Rankings atualizados!");
    } catch (error) {
      toast.error("Erro ao atualizar rankings");
    }
  };

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const RankingTable = ({ rankings, type }: { rankings: any[], type: string }) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      );
    }

    if (rankings.length === 0) {
      return (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {type === 'national' ? 'Nenhum ranking nacional disponível' :
             type === 'regional' ? 'Configure sua localização para ver o ranking regional' :
             'Configure sua localização para ver o ranking local'}
          </p>
          {(type === 'regional' || type === 'local') && !userLocation && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <Button 
                onClick={handleGetGPSLocation} 
                disabled={isGettingLocation}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                {isGettingLocation ? 'Obtendo localização...' : 'Usar Minha Localização GPS'}
              </Button>
              <span className="text-sm text-muted-foreground">ou</span>
              <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Map className="h-4 w-4" />
                    Configurar Manualmente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Localização</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateLocation} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado*</Label>
                      <Select
                        value={locationForm.state}
                        onValueChange={(value) => setLocationForm({ ...locationForm, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade (opcional)</Label>
                      <Input
                        id="city"
                        value={locationForm.city_approximate}
                        onChange={(e) => setLocationForm({ ...locationForm, city_approximate: e.target.value })}
                        placeholder="Ex: Belo Horizonte"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postal">CEP Prefixo (opcional)</Label>
                      <Input
                        id="postal"
                        value={locationForm.postal_code_prefix}
                        onChange={(e) => setLocationForm({ ...locationForm, postal_code_prefix: e.target.value })}
                        placeholder="Ex: 30000"
                        maxLength={5}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Salvar Localização
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {rankings.map((entry, index) => (
          <Card key={entry.id} className={`transition-all hover:shadow-md ${
            entry.position <= 3 ? 'ring-2 ring-primary/20' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankingIcon(entry.position)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                      {entry.user_avatar ? (
                        <img 
                          src={`${entry.user_avatar}?t=${new Date().getTime()}`} 
                          alt={entry.user_name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            console.log("Erro ao carregar imagem de perfil:", entry.user_name);
                            // Se a imagem falhar ao carregar, mostrar a inicial
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-primary font-bold">${entry.user_name?.charAt(0) || 'U'}</span>`;
                          }}
                          onLoad={() => console.log("Imagem carregada com sucesso:", entry.user_name)}
                        />
                      ) : (
                        <span className="text-primary font-bold">
                          {entry.user_name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{entry.user_name || 'Usuário'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {entry.user_location || 'Brasil'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {entry.total_points.toLocaleString()} pts
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entry.ranking_type === 'national' ? 'Nacional' :
                     entry.ranking_type === 'regional' ? 'Regional' : 'Local'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading && !userLocation) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Ranking
          </h1>
          <p className="text-muted-foreground mt-1">
            Compete com atletas de todo o Brasil
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshRankings}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Rankings
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGetGPSLocation} 
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Atualizando...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                {userLocation ? 'Atualizar Localização' : 'Detectar Localização GPS'}
              </>
            )}
          </Button>
          
          {!userLocation && (
            <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Map className="h-4 w-4" />
                  Configurar Manual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Localização Manualmente</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateLocation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado*</Label>
                    <Select
                      value={locationForm.state}
                      onValueChange={(value) => setLocationForm({ ...locationForm, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade (opcional)</Label>
                    <Input
                      id="city"
                      value={locationForm.city_approximate}
                      onChange={(e) => setLocationForm({ ...locationForm, city_approximate: e.target.value })}
                      placeholder="Ex: Belo Horizonte"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal">CEP Prefixo (opcional)</Label>
                    <Input
                      id="postal"
                      value={locationForm.postal_code_prefix}
                      onChange={(e) => setLocationForm({ ...locationForm, postal_code_prefix: e.target.value })}
                      placeholder="Ex: 30000"
                      maxLength={5}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Salvar Localização
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Estatísticas do Usuário */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {userPosition ? 
                      (selectedTab === 'national' ? `#${userPosition.national || '-'}` :
                       selectedTab === 'regional' ? `#${userPosition.regional || '-'}` :
                       selectedTab === 'local' ? `#${userPosition.local || '-'}` : '-') 
                      : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTab === 'national' ? 'Nacional' :
                     selectedTab === 'regional' ? 'Regional' : 'Local'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.total_points.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Pontos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.current_level}</p>
                  <p className="text-sm text-muted-foreground">Nível</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {userLocation ? userLocation.state : 'Não configurado'}
                  </p>
                  <p className="text-sm text-muted-foreground">Estado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Ranking */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="national" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Nacional
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Regional
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Local
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="national">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Ranking Nacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RankingTable rankings={nationalRanking} type="national" />
              </CardContent>
            </Card>
            
            <GeoVisualizer rankingType="national" />
          </div>
        </TabsContent>

        <TabsContent value="regional">
          {userLocation ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-primary" />
                    Ranking Regional
                    <Badge variant="outline" className="ml-2">
                      {userLocation.region}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RankingTable rankings={regionalRanking} type="regional" />
                </CardContent>
              </Card>
              
              <GeoVisualizer rankingType="regional" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Detectando sua localização...</h3>
                  <p className="text-muted-foreground mb-4">
                    Estamos obtendo sua localização via GPS para mostrar jogadores próximos e rankings regionais.
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Permitindo acesso à localização...</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Por que precisamos da sua localização?</h4>
                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                      <li>• Mostrar jogadores próximos a você no mapa</li>
                      <li>• Rankings regionais e locais precisos</li>
                      <li>• Prevenir fraudes e garantir competições justas</li>
                      <li>• Conquistas baseadas na sua região</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleGetGPSLocation}
                    disabled={isGettingLocation}
                    className="w-full"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Detectando localização...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Permitir Acesso à Localização
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="local">
          {userLocation ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Ranking Local
                    <Badge variant="outline" className="ml-2">
                      {userLocation.state}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RankingTable rankings={localRanking} type="local" />
                </CardContent>
              </Card>
              
              <GeoVisualizer rankingType="local" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Detectando sua localização...</h3>
                  <p className="text-muted-foreground mb-4">
                    Estamos obtendo sua localização via GPS para mostrar jogadores próximos e rankings locais.
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Permitindo acesso à localização...</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Por que precisamos da sua localização?</h4>
                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                      <li>• Mostrar jogadores próximos a você no mapa</li>
                      <li>• Rankings regionais e locais precisos</li>
                      <li>• Prevenir fraudes e garantir competições justas</li>
                      <li>• Conquistas baseadas na sua região</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleGetGPSLocation}
                    disabled={isGettingLocation}
                    className="w-full"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Detectando localização...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Permitir Acesso à Localização
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map">
          <GeoVisualizer />
        </TabsContent>
      </Tabs>

      {/* Conquistas Regionais */}
      {userRegionalAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Suas Conquistas Regionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRegionalAchievements.map((userAchievement) => {
                const achievement = userAchievement.achievement;
                if (!achievement) return null;
                
                return (
                  <Card key={userAchievement.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <h4 className="font-semibold text-green-800">{achievement.name}</h4>
                            <p className="text-sm text-green-600">{achievement.description}</p>
                          </div>
                        </div>
                        <Badge className={`${getRarityColor(achievement.rarity)} flex items-center gap-1`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-green-600">
                        Desbloqueada em: {new Date(userAchievement.unlocked_at).toLocaleDateString('pt-BR')}
                      </div>
                      
                      {achievement.points_reward > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-green-700">
                          <Star className="h-3 w-3" />
                          +{achievement.points_reward} pontos
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
