/**
 * 🏆 PÁGINA DE RANKINGS - NOVO SISTEMA
 * Interface moderna e limpa
 * Criado em: 20/01/2026
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, MapPin, Navigation, RefreshCw, Crown, Medal, Award } from 'lucide-react';
import { useRankingSystem, RankingPlayer } from '@/hooks/useRankingSystem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

type TabType = 'national' | 'regional' | 'local';

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

  const [activeTab, setActiveTab] = useState<TabType>('national');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // ============================================
  // 📍 ATUALIZAR LOCALIZAÇÃO
  // ============================================
  
  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true);
    try {
      await updateLocationFromGPS();
      toast.success('Localização atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar localização. Verifique as permissões.');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // ============================================
  // 🔄 RECARREGAR RANKINGS
  // ============================================
  
  const handleRefresh = async () => {
    try {
      await loadAllRankings();
      toast.success('Rankings atualizados!');
    } catch (error) {
      toast.error('Erro ao atualizar rankings.');
    }
  };

  // ============================================
  // 🏆 OBTER ÍCONE DE POSIÇÃO
  // ============================================
  
  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return null;
  };

  // ============================================
  // 📊 OBTER DADOS DO TAB ATIVO
  // ============================================
  
  const getCurrentRanking = (): RankingPlayer[] => {
    switch (activeTab) {
      case 'national':
        return nationalRanking;
      case 'regional':
        return regionalRanking;
      case 'local':
        return localRanking;
      default:
        return [];
    }
  };

  const getCurrentUserPosition = () => {
    switch (activeTab) {
      case 'national':
        return userPosition.national;
      case 'regional':
        return userPosition.regional;
      case 'local':
        return userPosition.local;
      default:
        return null;
    }
  };

  const getCurrentTotal = () => {
    switch (activeTab) {
      case 'national':
        return userPosition.nationalTotal;
      case 'regional':
        return userPosition.regionalTotal;
      case 'local':
        return userPosition.localTotal;
      default:
        return 0;
    }
  };

  const getCurrentTitle = () => {
    switch (activeTab) {
      case 'national':
        return 'Ranking Nacional';
      case 'regional':
        return `Ranking Regional - ${userPosition.region || 'Sua Região'}`;
      case 'local':
        return `Ranking Local - ${userPosition.state || 'Seu Estado'}`;
      default:
        return 'Ranking';
    }
  };

  const currentRanking = getCurrentRanking();
  const currentPosition = getCurrentUserPosition();
  const currentTotal = getCurrentTotal();

  // ============================================
  // 🎨 RENDERIZAR
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Rankings</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateLocation}
                disabled={isUpdatingLocation}
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30"
              >
                <Navigation className={`h-4 w-4 ${isUpdatingLocation ? 'animate-pulse' : ''}`} />
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Sua Posição */}
          {currentPosition && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Sua Posição</p>
                    <div className="flex items-center gap-2">
                      {getPositionIcon(currentPosition)}
                      <p className="text-3xl font-bold text-white">
                        #{currentPosition}
                      </p>
                      <p className="text-white/60 text-sm">de {currentTotal}</p>
                    </div>
                  </div>
                  <MapPin className="h-8 w-8 text-white/60" />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[140px] z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setActiveTab('national')}
              variant={activeTab === 'national' ? 'default' : 'outline'}
              className={
                activeTab === 'national'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
              }
            >
              <Trophy className="h-4 w-4 mr-2" />
              Nacional
            </Button>
            <Button
              onClick={() => setActiveTab('regional')}
              variant={activeTab === 'regional' ? 'default' : 'outline'}
              className={
                activeTab === 'regional'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
              }
            >
              <MapPin className="h-4 w-4 mr-2" />
              Regional
            </Button>
            <Button
              onClick={() => setActiveTab('local')}
              variant={activeTab === 'local' ? 'default' : 'outline'}
              className={
                activeTab === 'local'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
              }
            >
              <Navigation className="h-4 w-4 mr-2" />
              Local
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">{getCurrentTitle()}</h2>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-yellow-500 animate-spin" />
          </div>
        )}

        {/* Lista de Jogadores */}
        {!isLoading && currentRanking.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum jogador neste ranking ainda.</p>
            </div>
          </Card>
        )}

        {!isLoading && currentRanking.length > 0 && (
          <div className="space-y-3">
            {currentRanking.map((player) => (
              <Card
                key={player.id}
                className={`transition-all duration-200 ${
                  player.isCurrentUser
                    ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 shadow-lg'
                    : 'bg-gray-900 border-gray-800 hover:bg-gray-800'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Posição */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      {player.position <= 3 ? (
                        <div className="flex items-center justify-center">
                          {getPositionIcon(player.position)}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-600">
                          {player.position}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-gray-700">
                      <AvatarImage src={player.avatar_url || ''} />
                      <AvatarFallback className="bg-gray-800 text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {player.name}
                        </h3>
                        {player.isCurrentUser && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {player.location}
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
