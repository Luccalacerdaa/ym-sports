import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRankingSystem } from '@/hooks/useRankingSystem';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';
import { 
  Trophy, 
  MapPin, 
  Medal, 
  Crown, 
  Award,
  Target,
  TrendingUp,
  RefreshCw,
  Flag,
  Globe,
  Navigation
} from 'lucide-react';

export default function Rankings() {
  const { 
    nationalRanking, 
    regionalRanking, 
    localRanking,
    userPosition,
    isLoading, 
    error,
    loadAllRankings,
    updateLocationFromGPS,
  } = useRankingSystem();
  
  const { progress } = useProgress();
  const [selectedTab, setSelectedTab] = useState('national');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Log quando os rankings mudarem
  useEffect(() => {
    console.log('📊 [RANKINGS] Rankings atualizados:', {
      nacional: nationalRanking.length,
      regional: regionalRanking.length,
      local: localRanking.length
    });
  }, [nationalRanking, regionalRanking, localRanking]);

  const handleGetGPSLocation = async () => {
    setIsGettingLocation(true);
    try {
      await updateLocationFromGPS();
      toast.success('📍 Localização atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao obter localização:', error);
      toast.error('Erro ao obter localização. Verifique as permissões.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleRefreshRankings = async () => {
    try {
      await loadAllRankings();
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

  const RankingTable = ({ rankings, type }: { rankings: any[], type: string }) => {
    console.log(`🎯 [RANKING TABLE] Renderizando ${type}:`, rankings.length, 'jogadores');
    
    if (isLoading) {
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
          {(type === 'regional' || type === 'local') && (
            <Button 
              onClick={handleGetGPSLocation} 
              disabled={isGettingLocation}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isGettingLocation ? 'Obtendo localização...' : 'Usar Minha Localização GPS'}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {rankings.map((player) => (
          <Card key={player.id} className={`transition-all hover:shadow-md ${
            player.isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : 
            player.position <= 3 ? 'ring-2 ring-primary/20' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankingIcon(player.position)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                      {player.avatar_url ? (
                        <img 
                          src={`${player.avatar_url}?t=${new Date().getTime()}`}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-primary font-bold">${player.name?.charAt(0) || 'U'}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-primary font-bold">
                          {player.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {player.name || 'Jogador'}
                        {player.isCurrentUser && (
                          <Badge variant="default" className="text-xs">Você</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {player.location || 'Brasil'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {player.points.toLocaleString()} pts
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading && !progress) {
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
            Rankings
          </h1>
          <p className="text-muted-foreground mt-1">
            Compete com atletas de todo o Brasil
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshRankings}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                Atualizar Localização
              </>
            )}
          </Button>
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
                    {selectedTab === 'national' ? `#${userPosition.national || '-'}` :
                     selectedTab === 'regional' ? `#${userPosition.regional || '-'}` :
                     selectedTab === 'local' ? `#${userPosition.local || '-'}` : '-'}
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
                    {userPosition.state || 'Não configurado'}
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
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="national">
          <RankingTable rankings={nationalRanking} type="national" />
        </TabsContent>

        <TabsContent value="regional">
          {userPosition.region ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Ranking Regional - {userPosition.region}</h2>
                <Badge variant="outline">{regionalRanking.length} jogadores</Badge>
              </div>
              <RankingTable rankings={regionalRanking} type="regional" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Configure sua localização</h3>
                <p className="text-muted-foreground mb-4">
                  Para ver o ranking regional, precisamos saber sua localização
                </p>
                <Button 
                  onClick={handleGetGPSLocation}
                  disabled={isGettingLocation}
                  className="w-full sm:w-auto"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Detectando localização...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Permitir Acesso à Localização
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="local">
          {userPosition.state ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Ranking Local - {userPosition.state}</h2>
                <Badge variant="outline">{localRanking.length} jogadores</Badge>
              </div>
              <RankingTable rankings={localRanking} type="local" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Configure sua localização</h3>
                <p className="text-muted-foreground mb-4">
                  Para ver o ranking local, precisamos saber sua localização
                </p>
                <Button 
                  onClick={handleGetGPSLocation}
                  disabled={isGettingLocation}
                  className="w-full sm:w-auto"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Detectando localização...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Permitir Acesso à Localização
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
