import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProgress } from '@/hooks/useProgress';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  TrendingUp, 
  Clock, 
  Award,
  Medal,
  Crown,
  Zap,
  Activity,
  Calendar,
  BarChart3,
  Users,
  Timer
} from 'lucide-react';

const Achievements = () => {
  const { 
    progress, 
    achievements, 
    userAchievements, 
    recentActivities, 
    loading, 
    error,
    getLevelProgress 
  } = useProgress();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (loading) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          <p>Erro ao carregar conquistas: {error}</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Nenhum progresso encontrado</p>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(progress.total_points, progress.current_level);
  
  // Filtrar conquistas por categoria
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  // Conquistas desbloqueadas vs não desbloqueadas
  const unlockedAchievementIds = userAchievements.map(ua => ua.achievement_id);
  const unlockedAchievements = filteredAchievements.filter(a => 
    unlockedAchievementIds.includes(a.id)
  );
  const lockedAchievements = filteredAchievements.filter(a => 
    !unlockedAchievementIds.includes(a.id)
  );

  // Função para obter ícone da raridade
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Medal className="h-4 w-4 text-primary" />;
      case 'rare': return <Award className="h-4 w-4 text-primary" />;
      case 'epic': return <Crown className="h-4 w-4 text-primary" />;
      case 'legendary': return <Star className="h-4 w-4 text-primary" />;
      default: return <Medal className="h-4 w-4 text-primary" />;
    }
  };

  // Função para obter cor da raridade
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-primary/10 text-foreground border-primary/20';
      case 'rare': return 'bg-primary/20 text-foreground border-primary/30';
      case 'epic': return 'bg-primary/30 text-foreground border-primary/40';
      case 'legendary': return 'bg-primary/40 text-foreground border-primary/50';
      default: return 'bg-primary/10 text-foreground border-primary/20';
    }
  };

  // Função para calcular progresso da conquista
  const getAchievementProgress = (achievement: any) => {
    if (!progress) return { progress: 0, current: 0, required: achievement.requirement_value };

    let current = 0;
    switch (achievement.requirement_type) {
      case 'points':
        current = progress.total_points;
        break;
      case 'workouts':
        current = progress.total_workouts_completed;
        break;
      case 'streak':
        current = progress.current_workout_streak;
        break;
      case 'level':
        current = progress.current_level;
        break;
      case 'exercises':
        current = progress.total_exercises_completed;
        break;
      case 'workout_minutes':
        current = progress.total_workout_minutes;
        break;
    }

    const progressValue = Math.min((current / achievement.requirement_value) * 100, 100);
    return { progress: progressValue, current, required: achievement.requirement_value };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Conquistas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu progresso e desbloqueie novas conquistas
          </p>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.current_level}</p>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.total_points}</p>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.current_workout_streak}</p>
                <p className="text-sm text-muted-foreground">Sequência Atual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userAchievements.length}</p>
                <p className="text-sm text-muted-foreground">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Progresso do Nível */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Progresso do Nível {progress.current_level}</h3>
              </div>
              <Badge variant="outline" className="text-sm">
                {levelProgress.pointsToNext} pontos para o próximo nível
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-primary">
                  {Math.floor(levelProgress.progress)}% completo
                </span>
                <span className="text-xs text-muted-foreground">
                  {progress.total_points} / {progress.total_points + levelProgress.pointsToNext} pts
                </span>
              </div>
              <Progress value={levelProgress.progress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Nível {progress.current_level}</span>
                <span>Nível {progress.current_level + 1}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conquistas */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="workout">Treinos</TabsTrigger>
          <TabsTrigger value="streak">Sequências</TabsTrigger>
          <TabsTrigger value="level">Níveis</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {/* Conquistas Desbloqueadas */}
          {unlockedAchievements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                Conquistas Desbloqueadas ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => {
                  const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                  return (
                    <Card key={achievement.id} className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div>
                              <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                              <p className="text-sm text-foreground/70">{achievement.description}</p>
                            </div>
                          </div>
                          <Badge className={`${getRarityColor(achievement.rarity)} flex items-center gap-1`}>
                            {getRarityIcon(achievement.rarity)}
                            {achievement.rarity}
                          </Badge>
                        </div>
                        
                        {userAchievement && (
                          <div className="text-xs text-primary">
                            Desbloqueada em: {new Date(userAchievement.unlocked_at).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        
                        {achievement.points_reward > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                            <Star className="h-3 w-3" />
                            +{achievement.points_reward} pontos
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conquistas Bloqueadas */}
          {lockedAchievements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-500" />
                Conquistas Pendentes ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => {
                  const achievementProgress = getAchievementProgress(achievement);
                  return (
                    <Card key={achievement.id} className="border-gray-200 bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl grayscale opacity-50">{achievement.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-600">{achievement.name}</h4>
                              <p className="text-sm text-gray-500">{achievement.description}</p>
                            </div>
                          </div>
                          <Badge className={`${getRarityColor(achievement.rarity)} flex items-center gap-1 opacity-75`}>
                            {getRarityIcon(achievement.rarity)}
                            {achievement.rarity}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progresso</span>
                            <span>{achievementProgress.current}/{achievementProgress.required}</span>
                          </div>
                          <Progress value={achievementProgress.progress} className="h-2" />
                        </div>
                        
                        {achievement.points_reward > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                            <Star className="h-3 w-3" />
                            +{achievement.points_reward} pontos
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {filteredAchievements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conquista encontrada nesta categoria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Atividades Recentes */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {activity.activity_type === 'workout_completed' && <Timer className="h-4 w-4 text-primary" />}
                      {activity.activity_type === 'achievement_unlocked' && <Award className="h-4 w-4 text-yellow-500" />}
                      {activity.activity_type === 'exercise_completed' && <Target className="h-4 w-4 text-green-500" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {activity.activity_type === 'workout_completed' && 'Treino Completo'}
                        {activity.activity_type === 'achievement_unlocked' && 'Conquista Desbloqueada'}
                        {activity.activity_type === 'exercise_completed' && 'Exercício Completo'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(activity.created_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    +{activity.points_earned} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Achievements;
