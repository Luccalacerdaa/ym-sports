import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRankingSystem } from '@/hooks/useRankingSystem';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';
import { 
  Trophy, 
  MapPin, 
  Medal, 
  Crown, 
  Award,
  RefreshCw,
  Navigation
} from 'lucide-react';

export default function Rankings() {
  const { 
    nationalRanking, 
    regionalRanking, 
    localRanking,
    userPosition,
    isLoading, 
    loadAllRankings,
    updateLocationFromGPS,
  } = useRankingSystem();
  
  const { progress } = useProgress();
  const [selectedTab, setSelectedTab] = useState('regional'); // Regional por padrão como na imagem
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
      default: return <span className="text-2xl font-bold text-gray-600">{position}</span>;
    }
  };

  const getCurrentRanking = () => {
    switch (selectedTab) {
      case 'national': return nationalRanking;
      case 'regional': return regionalRanking;
      case 'local': return localRanking;
      default: return [];
    }
  };

  const currentRankings = getCurrentRanking();

  const getUserCurrentPosition = () => {
    const total = currentRankings.length;
    switch (selectedTab) {
      case 'national': return { position: userPosition.national, total: userPosition.nationalTotal };
      case 'regional': return { position: userPosition.regional, total: userPosition.regionalTotal };
      case 'local': return { position: userPosition.local, total: userPosition.localTotal };
      default: return { position: null, total: 0 };
    }
  };

  const userPos = getUserCurrentPosition();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pb-20">
      {/* Header Amarelo Fixo */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Rankings</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleGetGPSLocation}
                disabled={isGettingLocation}
                className="bg-white/20 hover:bg-white/30 text-black"
              >
                <Navigation className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleRefreshRankings}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 text-black"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Card Sua Posição */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Sua Posição</p>
                  <div className="flex items-center gap-2">
                    {userPos.position && getRankingIcon(userPos.position)}
                    <p className="text-3xl font-bold text-white">#{userPos.position || '-'}</p>
                    <p className="text-white/60 text-sm">de {userPos.total || currentRankings.length}</p>
                  </div>
                </div>
                <MapPin className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Fixas */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={selectedTab === 'national' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('national')}
              className={selectedTab === 'national' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Nacional
            </Button>
            <Button
              variant={selectedTab === 'regional' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('regional')}
              className={selectedTab === 'regional' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Regional
            </Button>
            <Button
              variant={selectedTab === 'local' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('local')}
              className={selectedTab === 'local' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Local
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo dos Rankings */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {selectedTab === 'national' ? 'Ranking Nacional' :
           selectedTab === 'regional' ? `Ranking Regional - ${userPosition.region || 'Sudeste'}` :
           `Ranking Local - ${userPosition.state || 'MG'}`}
        </h2>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-800 h-20 rounded-lg"></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentRankings.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Nenhum jogador neste ranking</p>
              <Button 
                onClick={handleGetGPSLocation}
                disabled={isGettingLocation}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isGettingLocation ? 'Detectando...' : 'Configurar Localização'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lista de Rankings */}
        {!isLoading && currentRankings.length > 0 && (
          <div className="space-y-3">
            {currentRankings.map((player) => (
              <Card 
                key={player.id} 
                className={`transition-all duration-200 ${
                  player.isCurrentUser 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 shadow-lg' 
                    : 'bg-gray-900 border-gray-800 hover:bg-gray-800'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Posição/Ícone */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      {getRankingIcon(player.position)}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12 border-2 border-gray-700">
                      {player.avatar_url ? (
                        <img 
                          src={player.avatar_url}
                          alt={player.name}
                          className="aspect-square h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-white">${player.name?.charAt(0) || 'U'}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-white">
                          {player.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>

                    {/* Nome e Localização */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{player.name || 'Jogador'}</h3>
                        {player.isCurrentUser && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {player.location || 'Brasil'}
                      </p>
                    </div>

                    {/* Pontos */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-500">
                        {player.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">pontos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
