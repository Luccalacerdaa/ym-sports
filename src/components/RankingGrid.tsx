import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Crown, Star, User as UserIcon, Loader2 } from 'lucide-react';
import { RankingEntry } from '@/hooks/useRanking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RankingGridProps {
  rankings: RankingEntry[];
  type: 'national' | 'regional' | 'local';
  loading?: boolean;
  className?: string;
  title?: string;
}

export const RankingGrid = ({ rankings, type, loading, className, title }: RankingGridProps) => {
  const { user } = useAuth();
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  // Função para obter o ícone de posição
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Star className="h-5 w-5 text-primary/70" />;
    }
  };

  // Função para obter a cor de fundo baseada na posição
  const getPositionBackground = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/20';
      case 2:
        return 'bg-gradient-to-r from-gray-300/10 to-gray-300/5 border-gray-300/20';
      case 3:
        return 'bg-gradient-to-r from-amber-700/10 to-amber-700/5 border-amber-700/20';
      default:
        return '';
    }
  };

  // Função para lidar com erro no carregamento da imagem
  const handleImageError = (userId: string) => {
    setImageLoadErrors(prev => ({ ...prev, [userId]: true }));
  };

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title || 'Ranking'}</h3>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Renderizar estado vazio
  if (rankings.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          {type === 'national' ? 'Nenhum ranking nacional disponível' :
           type === 'regional' ? 'Configure sua localização para ver o ranking regional' :
           'Configure sua localização para ver o ranking local'}
        </p>
      </div>
    );
  }

  // Renderizar grid de ranking
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title || 'Ranking'}</h3>
        <Badge variant="outline">
          {type === 'national' ? 'Nacional' : 
           type === 'regional' ? 'Regional' : 'Local'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rankings.slice(0, 12).map((entry) => {
          const isCurrentUser = entry.user_id === user?.id;
          const hasImageError = imageLoadErrors[entry.user_id];
          
          return (
            <Card 
              key={entry.id || entry.user_id} 
              className={`transition-all hover:shadow-md ${
                isCurrentUser ? 'ring-2 ring-primary' : ''
              } ${getPositionBackground(entry.position)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getPositionIcon(entry.position)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className={`h-12 w-12 ${
                          entry.position === 1 ? 'ring-2 ring-yellow-500' :
                          entry.position === 2 ? 'ring-2 ring-gray-300' :
                          entry.position === 3 ? 'ring-2 ring-amber-700' : ''
                        }`}>
                          {!hasImageError && entry.user_avatar ? (
                            <AvatarImage 
                              src={`${entry.user_avatar}?t=${new Date().getTime()}`}
                              alt={entry.user_name || "Usuário"}
                              onError={(e) => {
                                console.log(`Erro ao carregar avatar para ${entry.user_name}:`, e);
                                handleImageError(entry.user_id);
                              }}
                              onLoad={() => console.log(`Avatar carregado com sucesso para ${entry.user_name}`)}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(entry.user_name?.[0] || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        {isCurrentUser && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {entry.user_name || `Jogador #${entry.position}`}
                          </h3>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">Você</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.user_location || 'Brasil'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {entry.total_points?.toLocaleString() || 0} pts
                        </span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        #{entry.position}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {rankings.length > 12 && (
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            Ver mais
          </Button>
        </div>
      )}
    </div>
  );
};

export default RankingGrid;
