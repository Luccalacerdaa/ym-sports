import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRanking } from '@/hooks/useRanking';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Users, Trophy, Target, RefreshCw } from 'lucide-react';

interface GeoVisualizerProps {
  className?: string;
  rankingType?: 'national' | 'regional' | 'local';
}

export const GeoVisualizer = ({ className, rankingType = 'all' }: GeoVisualizerProps) => {
  const { nationalRanking, regionalRanking, localRanking, userLocation, calculateRankings } = useRanking();
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string>(rankingType || 'all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rankingType) {
      setSelectedRegion(rankingType);
    }
  }, [rankingType]);

  // Selecionar rankings com base no tipo
  const getPlayersToShow = () => {
    switch (selectedRegion) {
      case 'national':
        return nationalRanking.slice(0, 20); // Mostrar mais jogadores
      case 'regional':
        return regionalRanking.slice(0, 15); // Mostrar mais jogadores regionais
      case 'local':
        return localRanking.slice(0, 15); // Mostrar mais jogadores locais
      default:
        // Combinação de todos os rankings
        return [
          ...nationalRanking.slice(0, 5),
          ...regionalRanking.slice(0, 5),
          ...localRanking.slice(0, 5)
        ];
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await calculateRankings();
    } finally {
      setLoading(false);
    }
  };

  const players = getPlayersToShow();
  
  // Determinar título com base no tipo de ranking
  const getTitle = () => {
    switch (selectedRegion) {
      case 'national':
        return 'Atletas no Brasil';
      case 'regional':
        return `Atletas na Região ${userLocation?.region || 'Sudeste'}`;
      case 'local':
        return `Atletas em ${userLocation?.state || 'MG'}`;
      default:
        return 'Atletas Próximos';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {getTitle()}
          </div>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Atualizar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum atleta encontrado nesta região</p>
          </div>
        ) : (
          <div className="relative">
            {/* Visualização geográfica */}
            <div className="relative h-[300px] bg-muted/20 rounded-lg overflow-hidden mb-4">
              {/* Fundo representando o mapa */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30">
                {/* Linhas de grade */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }}></div>
                
                {/* Contorno do Brasil (simplificado) */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border-2 border-primary/30 rounded-[100px_100px_100px_30px] rotate-12"></div>
                
                {/* Indicador de região (se for regional ou local) */}
                {(selectedRegion === 'regional' || selectedRegion === 'local') && (
                  <div className={`absolute ${
                    selectedRegion === 'regional' ? 'w-[120px] h-[120px]' : 'w-[80px] h-[80px]'
                  } bg-primary/10 border border-primary/30 rounded-full`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}></div>
                )}
                
                {/* Jogadores */}
                {players.length > 0 ? (
                  players.map((player, index) => {
                    // Calcular posição baseada no índice
                    // Para criar um efeito visual de distribuição geográfica
                    const isCurrentUser = player.user_id === user?.id;
                    
                    // Distribuir jogadores em um padrão mais visível
                    // Usuário atual no centro, outros em círculo ao redor
                    let x, y;
                    
                    if (isCurrentUser) {
                      // Usuário atual sempre no centro
                      x = 50;
                      y = 50;
                    } else {
                      // Distribuir outros jogadores em círculo
                      const angle = (index * (360 / Math.max(players.length, 8))) * (Math.PI / 180);
                      const radius = 35; // Distância do centro (%)
                      x = 50 + radius * Math.cos(angle);
                      y = 50 + radius * Math.sin(angle);
                    }
                    
                    // Garantir que os jogadores fiquem dentro dos limites
                    x = Math.max(10, Math.min(90, x));
                    y = Math.max(10, Math.min(90, y));
                    
                    // Debug para verificar dados do jogador
                    console.log(`Renderizando jogador #${index}:`, {
                      id: player.user_id,
                      name: player.user_name,
                      avatar: player.user_avatar,
                      position: player.position,
                      points: player.total_points,
                      isCurrentUser
                    });
                    
                    return (
                      <div 
                        key={`${player.user_id || index}-${index}`}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                          isCurrentUser ? 'z-20' : 'z-10'
                        }`}
                        style={{
                          left: `${x}%`,
                          top: `${y}%`
                        }}
                      >
                        <div className="relative group">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            player.position === 1 ? 'bg-yellow-500/20 border-2 border-yellow-500 shadow-glow-yellow' :
                            player.position === 2 ? 'bg-gray-300/20 border-2 border-gray-300 shadow-glow-gray' :
                            player.position === 3 ? 'bg-amber-700/20 border-2 border-amber-700 shadow-glow-amber' :
                            'bg-primary/10 border border-primary/50'
                          } ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                            {player.user_avatar ? (
                              <img 
                                src={`${player.user_avatar}?t=${new Date().getTime()}`} 
                                alt={player.user_name || "Jogador"}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `<span class="text-primary font-bold text-lg">${(player.user_name || "U")[0]}</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-primary font-bold text-lg">
                                {(player.user_name || "U")[0]}
                              </span>
                            )}
                          </div>
                          
                          {/* Nome do jogador abaixo do avatar */}
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-background/80 px-2 py-0.5 rounded text-xs font-medium">
                            {player.user_name || "Jogador"}
                          </div>
                          
                          {/* Badge de posição */}
                          <Badge 
                            className={`absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full ${
                              player.position === 1 ? 'bg-yellow-500 text-yellow-950' :
                              player.position === 2 ? 'bg-gray-300 text-gray-800' :
                              player.position === 3 ? 'bg-amber-700 text-amber-50' :
                              'bg-primary text-primary-foreground'
                            }`}
                          >
                            {player.position}
                          </Badge>
                          
                          {/* Tooltip com informações */}
                          <div className="absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 w-max max-w-[200px] bg-background border border-border p-2 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <p className="font-semibold text-sm">{player.user_name || "Jogador"}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Trophy className="h-3 w-3" />
                                <span>{player.total_points?.toLocaleString() || 0} pts</span>
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {player.ranking_type === 'national' ? 'Nacional' :
                                 player.ranking_type === 'regional' ? 'Regional' : 'Local'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Jogadores fictícios para demonstração quando não há dados
                  Array.from({ length: 5 }).map((_, index) => {
                    const angle = (index * (360 / 5)) * (Math.PI / 180);
                    const radius = 35;
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    
                    return (
                      <div 
                        key={`dummy-${index}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out z-10"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`
                        }}
                      >
                        <div className="relative group">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-muted-foreground/20">
                            <span className="text-muted-foreground font-bold">
                              {index + 1}
                            </span>
                          </div>
                          
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-background/80 px-2 py-0.5 rounded text-xs font-medium">
                            Jogador {index + 1}
                          </div>
                          
                          <Badge 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground"
                          >
                            {index + 1}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Legenda */}
            <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>1º Lugar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>2º Lugar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-700"></div>
                <span>3º Lugar</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                <span>Você</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
