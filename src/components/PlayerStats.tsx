import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Star, TrendingUp, Award, Target } from 'lucide-react';
import { useState } from 'react';

interface PlayerStatsProps {
  name: string;
  avatar?: string;
  totalPoints: number;
  level: number;
  national?: number;
  regional?: number;
  local?: number;
  region?: string;
  state?: string;
  className?: string;
}

export const PlayerStats = ({
  name,
  avatar,
  totalPoints,
  level,
  national,
  regional,
  local,
  region = 'Sudeste',
  state = 'MG',
  className
}: PlayerStatsProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Calcular progresso REAL para o próximo nível
  // Fórmula: pontos necessários para próximo nível = nivel_atual * 100
  const pointsForCurrentLevel = (level - 1) * 100;
  const pointsForNextLevel = level * 100;
  const pointsInCurrentLevel = totalPoints - pointsForCurrentLevel;
  const pointsNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel;
  const nextLevelProgress = Math.min(100, Math.max(0, Math.floor((pointsInCurrentLevel / pointsNeededForNextLevel) * 100)));
  
  // Obter medalha baseada na posição
  const getMedalIcon = (position?: number) => {
    if (!position) return null;
    
    switch (position) {
      case 1:
        return <Medal className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return position <= 10 ? <Star className="h-5 w-5 text-primary/70" /> : null;
    }
  };
  
  // Obter texto para posição
  const getPositionText = (position?: number) => {
    if (!position) return 'N/A';
    
    if (position === 1) return '1º Lugar';
    if (position === 2) return '2º Lugar';
    if (position === 3) return '3º Lugar';
    
    return `#${position}`;
  };
  
  // Obter cor para posição
  const getPositionColor = (position?: number) => {
    if (!position) return 'text-muted-foreground';
    
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-700';
      default:
        return position <= 10 ? 'text-primary' : 'text-muted-foreground';
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-4 ring-background">
              {!imageError && avatar ? (
                <AvatarImage 
                  src={`${avatar}?t=${new Date().getTime()}`}
                  alt={name}
                  onError={() => setImageError(true)}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {(name?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
              <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                {level}
              </Badge>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold">{name || 'Usuário'}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{totalPoints?.toLocaleString() || 0} pontos</span>
            </div>
            
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">
                Nível {level} • Próximo nível: {nextLevelProgress}%
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${nextLevelProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className={`text-xl font-bold ${getPositionColor(national)}`}>
                {getPositionText(national)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {getMedalIcon(national)}
                <span>Nacional</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className={`text-xl font-bold ${getPositionColor(regional)}`}>
                {getPositionText(regional)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {getMedalIcon(regional)}
                <span>{region}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className={`text-xl font-bold ${getPositionColor(local)}`}>
                {getPositionText(local)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {getMedalIcon(local)}
                <span>{state}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Progresso</div>
              <div className="text-2xl font-bold">{level}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Conquistas</div>
              <div className="text-2xl font-bold">12</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
