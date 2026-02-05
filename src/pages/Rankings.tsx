import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    refreshUserRankings,
    updateLocationFromGPS,
  } = useRankingSystem();
  
  const { progress } = useProgress();
  const [selectedTab, setSelectedTab] = useState('national');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
            player.isCurrentUser ? 'ring-2 ring-primary' : 
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
                          src={player.avatar_url} 
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

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Erro ao carregar rankings: {error}</p>
            <Button onClick={handleRefreshRankings} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
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
            Atualizar
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
                <Navigation className="h-4 w-4 mr-2" />
                Atualizar Localização
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estatísticas do Usuário */}
      {progress && userPosition && (
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
                    Sua Posição
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Ranking Nacional
                <Badge variant="outline" className="ml-2">
                  {nationalRanking.length} jogadores
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankingTable rankings={nationalRanking} type="national" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                Ranking Regional
                {userPosition.region && (
                  <Badge variant="outline" className="ml-2">
                    {userPosition.region}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankingTable rankings={regionalRanking} type="regional" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="local">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Ranking Local
                {userPosition.state && (
                  <Badge variant="outline" className="ml-2">
                    {userPosition.state}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankingTable rankings={localRanking} type="local" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
