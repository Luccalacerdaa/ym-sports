import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Dumbbell, ArrowRight, Medal, Flame, User, Clock, MapPin, Users, Gamepad2, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useEvents } from "@/hooks/useEvents";
import { useTrainings } from "@/hooks/useTrainings";
import { useProgress } from "@/hooks/useProgress";
import { useRanking } from "@/hooks/useRanking";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { getUpcomingEvents } = useEvents();
  const { getTodaysTraining } = useTrainings();
  const { progress, getLevelProgress } = useProgress();
  const { getUserPosition, userLocation, calculateRankings, fetchRankings, nationalRanking } = useRanking();
  const navigate = useNavigate();
  
  const [userPosition, setUserPosition] = useState<any>(null);

  // Obter próximos eventos e treino de hoje (memoizados para evitar re-renders)
  const upcomingEvents = useMemo(() => getUpcomingEvents(3), [getUpcomingEvents]);
  const todaysTraining = useMemo(() => getTodaysTraining(), [getTodaysTraining]);
  
  // Calcular progresso do nível (memoizado)
  const [levelProgress, setLevelProgress] = useState({ progress: 0, pointsToNext: 100 });
  
  useEffect(() => {
    if (progress) {
      getLevelProgress(progress.total_points, progress.current_level).then(setLevelProgress);
    }
  }, [progress?.total_points, progress?.current_level, getLevelProgress]);

  // PRÉ-CARREGAR rankings no Dashboard (só roda 1x)
  const [hasPreloadedRankings, setHasPreloadedRankings] = useState(false);
  
  useEffect(() => {
    const preloadRankings = async () => {
      if (user && !hasPreloadedRankings) {
        try {
          setHasPreloadedRankings(true);
          
          // Verificar se já tem rankings carregados (do localStorage ou anterior)
          if (nationalRanking.length > 0) {
            console.log('✅ [DASHBOARD] Rankings já carregados do localStorage');
            // Apenas buscar posição
            const position = await getUserPosition();
            setUserPosition(position);
            return;
          }
          
          // Se não tem cache, calcular
          console.log('🔄 [DASHBOARD] Calculando rankings pela primeira vez...');
          await calculateRankings();
          
          // Aguardar sincronização
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Buscar rankings (1x apenas!)
          await fetchRankings('national');
          if (userLocation) {
            await fetchRankings('regional');
            await fetchRankings('local');
          }
          
          // Buscar posição do usuário
          const position = await getUserPosition();
          setUserPosition(position);
        } catch (error) {
          console.error('❌ [DASHBOARD] Erro ao pré-carregar rankings:', error);
          setHasPreloadedRankings(false); // Permitir retry
        }
      }
    };
    
    preloadRankings();
  }, [user, hasPreloadedRankings, nationalRanking.length]); // Roda quando rankings mudam

  // Dados reais do usuário
  const displayName = profile?.name || 'Usuário';
  const userAge = profile?.age || 'Não informado';
  const userHeight = profile?.height ? `${profile.height}cm` : 'Não informado';
  const userWeight = profile?.weight ? `${profile.weight}kg` : 'Não informado';
  const userPosition2 = profile?.position || 'Não informado';

  // Se ainda está carregando o perfil
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Flame className="h-8 w-8 text-primary animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Olá, {displayName}!
              </h1>
              <p className="text-muted-foreground">A evolução do esporte começa aqui.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Perfil */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {displayName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{displayName}</div>
                  <div className="text-sm text-muted-foreground">{userPosition2}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{userAge}</div>
                  <div className="text-xs text-muted-foreground">anos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{userHeight}</div>
                  <div className="text-xs text-muted-foreground">altura</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{userWeight}</div>
                  <div className="text-xs text-muted-foreground">peso</div>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/dashboard/profile')}
              >
                Ver perfil completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Card Progresso */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Medal className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">Nível {progress.current_level}</span>
                      </div>
                      <Badge variant="outline" className="text-primary">
                        {progress.total_points} pts
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso para o próximo nível</span>
                        <span>{levelProgress.pointsToNext} pts restantes</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${levelProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-lg font-bold">{progress.current_workout_streak}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Sequência</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="text-lg font-bold">{progress.total_workouts_completed}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Treinos</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/dashboard/achievements')}
                  >
                    Ver Conquistas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Complete seu primeiro treino para começar a ganhar pontos!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Calendário */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum evento agendado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie eventos no calendário para vê-los aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0">
                        {event.event_type === 'game' ? (
                          <Gamepad2 className="h-5 w-5 text-red-500" />
                        ) : event.event_type === 'training' ? (
                          <Dumbbell className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Calendar className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(event.start_date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/dashboard/calendar')}
              >
                Ver calendário completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Card Ranking */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Ranking
              </CardTitle>
              <CardDescription>
                {userLocation?.state ? `${userLocation.state} - ${userLocation.region}` : 'Sistema de pontuação'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <Trophy className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                {/* Posição Regional */}
                {userPosition?.regional && (
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      #{userPosition.regional.position}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Posição Regional ({userLocation?.region})
                    </div>
                  </div>
                )}
                
                {/* Posição Nacional */}
                {userPosition?.national && (
                  <div>
                    <div className="text-xl font-bold text-muted-foreground">
                      #{userPosition.national.position}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Posição Nacional
                    </div>
                  </div>
                )}
                
                {/* Se não tiver posição */}
                {!userPosition && (
                  <div>
                    <div className="text-2xl font-bold text-primary">--</div>
                    <div className="text-sm text-muted-foreground">
                      {userLocation?.state ? 'Calculando posição...' : 'Configure sua localização'}
                    </div>
                  </div>
                )}
                
                {/* Pontos */}
                <div>
                  <div className="text-xl font-bold text-muted-foreground">
                    {progress?.total_points || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Pontos Acumulados</div>
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => navigate('/dashboard/ranking')}
              >
                Ver ranking completo
              </Button>
            </CardContent>
          </Card>

          {/* Card Treino do Dia */}
          <Card className="hover-scale transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Treino de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysTraining ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{todaysTraining.title}</h3>
                    <Badge variant="secondary">
                      {todaysTraining.difficulty_level === 'beginner' ? 'Iniciante' :
                       todaysTraining.difficulty_level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {todaysTraining.duration_minutes} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {todaysTraining.exercises.length} exercícios
                    </div>
                  </div>

                  {todaysTraining.description && (
                    <p className="text-sm text-muted-foreground">{todaysTraining.description}</p>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Exercícios:</h4>
                    <div className="space-y-1">
                      {todaysTraining.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{exercise.name}</span>
                          <span className="text-muted-foreground">
                            {exercise.sets}x {exercise.reps}
                          </span>
                        </div>
                      ))}
                      {todaysTraining.exercises.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{todaysTraining.exercises.length - 3} exercícios
                        </p>
                      )}
                    </div>
                  </div>

                  <Button className="w-full">
                    Iniciar Treino
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum treino programado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gere um plano de treinos personalizado
                  </p>
                </div>
              )}
              
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => navigate('/dashboard/training')}
              >
                {todaysTraining ? 'Ver todos os treinos' : 'Criar treinos'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
