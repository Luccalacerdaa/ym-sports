import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTrainings, Exercise } from "@/hooks/useTrainings";
import { useAITraining } from "@/hooks/useAITraining";
import { useProfile } from "@/hooks/useProfile";
import { useProgress } from "@/hooks/useProgress";
import ExerciseVisualizer from "@/components/ExerciseVisualizer";
import { toast } from "sonner";
import { 
  Dumbbell, 
  Plus, 
  Brain,
  Calendar,
  Clock,
  Target,
  Zap,
  CheckCircle,
  PlayCircle,
  Edit2,
  Trash2,
  Sparkles,
  Play,
  Image,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  Info,
  Eye
} from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Iniciante', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediário', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Avançado', color: 'bg-red-100 text-red-800' },
];

const MUSCLE_GROUPS = [
  'pernas', 'braços', 'core', 'cardio', 'ombros', 'costas', 'peito', 'glúteos'
];

const EQUIPMENT_OPTIONS = [
  'Peso corporal', 'Halteres', 'Barras', 'Kettlebell', 'Elásticos', 'Esteira', 'Bicicleta', 'Escada de agilidade'
];

export default function Training() {
  const { profile } = useProfile();
  const { trainings, loading, error, createTraining, deleteTraining, fetchTrainings, getTodaysTraining, getWeeklyTrainings } = useTrainings();
  const { generateTrainingPlan, loading: aiLoading } = useAITraining();
  const { recordWorkoutCompletion } = useProgress();
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isTrainingDetailOpen, setIsTrainingDetailOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isExerciseVisualizerOpen, setIsExerciseVisualizerOpen] = useState(false);
  const [aiRequest, setAiRequest] = useState({
    goals: [] as string[],
    availableDays: [] as string[],
    sessionDuration: 60,
    customDuration: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    equipment: [] as string[],
    focus: [] as string[],
  });

  const todaysTraining = getTodaysTraining();
  const weeklyTrainings = getWeeklyTrainings();

  const handleGenerateTraining = async () => {
    if (aiRequest.goals.length === 0 || aiRequest.availableDays.length === 0) {
      toast.error("Selecione pelo menos um objetivo e um dia disponível");
      return;
    }

    // Limitar a 5 dias para evitar resposta muito longa
    if (aiRequest.availableDays.length > 5) {
      toast.error("Selecione no máximo 5 dias para evitar problemas de geração");
      return;
    }

    try {
      console.log('Iniciando geração de treinos...', aiRequest);
      const generatedTrainings = await generateTrainingPlan(aiRequest);
      console.log('Treinos gerados pela IA:', generatedTrainings);
      
      // Criar todos os treinos gerados
      for (const training of generatedTrainings) {
        console.log('Criando treino:', training);
        const result = await createTraining(training);
        console.log('Resultado da criação:', result);
      }

      // Recarregar treinos após criação
      await fetchTrainings();

      toast.success(`Plano de treinos gerado com sucesso! ${generatedTrainings.length} treinos criados.`);
      setIsGenerateDialogOpen(false);
      
      // Reset form
      setAiRequest({
        goals: [],
        availableDays: [],
        sessionDuration: 60,
        difficulty: 'intermediate',
        equipment: [],
        focus: [],
      });
    } catch (error) {
      console.error('Erro na geração de treinos:', error);
      toast.error("Erro ao gerar plano de treinos");
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (!confirm("Tem certeza que deseja deletar este treino?")) {
      return;
    }

    try {
      await deleteTraining(trainingId);
      toast.success("Treino deletado com sucesso!");
    } catch (error) {
      toast.error("Erro ao deletar treino");
    }
  };

  const handleViewTrainingDetails = (training: Training) => {
    setSelectedTraining(training);
    setIsTrainingDetailOpen(true);
  };

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsExerciseVisualizerOpen(true);
  };

  const handleCompleteWorkout = async (training: Training) => {
    try {
      const result = await recordWorkoutCompletion({
        duration_minutes: training.duration_minutes || 60,
        exercises_count: training.exercises.length,
        difficulty_level: training.difficulty_level,
        training_id: training.id,
      });

      if (result?.levelIncreased) {
        toast.success(`🎉 Parabéns! Você subiu para o nível ${result.newLevel}!`);
      } else {
        toast.success("Treino completado! Pontos adicionados ao seu progresso.");
      }
    } catch (error: any) {
      console.error('Erro ao registrar treino:', error);
      toast.error(error.message || "Erro ao registrar progresso do treino");
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const getDayLabel = (day: string) => {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || day;
  };

  const getDifficultyInfo = (level: string) => {
    return DIFFICULTY_LEVELS.find(d => d.value === level);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Treinos</h1>
            <p className="text-muted-foreground">Tecnologia que transforma treino em performance.</p>
          </div>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold text-base px-6 py-6 h-auto shadow-lg shadow-green-500/50">
                <Sparkles className="h-5 w-5" />
                Gerar com IA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Gerar Plano de Treinos Personalizado
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Objetivos */}
                <div className="space-y-3">
                  <Label>Objetivos (selecione um ou mais)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Melhorar condicionamento', 'Ganhar massa muscular', 'Perder peso', 'Melhorar agilidade', 'Prevenir lesões', 'Aumentar força'].map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={aiRequest.goals.includes(goal)}
                          onCheckedChange={() => toggleArrayItem(aiRequest.goals, goal, (value) => setAiRequest({...aiRequest, goals: value}))}
                        />
                        <Label htmlFor={goal} className="text-sm">{goal}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dias Disponíveis */}
                <div className="space-y-3">
                  <Label>Dias da semana disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.value}
                          checked={aiRequest.availableDays.includes(day.value)}
                          onCheckedChange={() => toggleArrayItem(aiRequest.availableDays, day.value, (value) => setAiRequest({...aiRequest, availableDays: value}))}
                        />
                        <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duração e Dificuldade */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração por sessão (minutos)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="duration"
                        type="number"
                        value={aiRequest.customDuration || aiRequest.sessionDuration}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const value = parseInt(inputValue);
                          
                          // Sempre atualizar o campo de entrada
                          setAiRequest({...aiRequest, customDuration: inputValue});
                          
                          // Validar e atualizar o valor real apenas se for válido
                          if (!isNaN(value) && value >= 15 && value <= 300) {
                            setAiRequest(prev => ({...prev, sessionDuration: value}));
                          }
                        }}
                        min="15"
                        max="300"
                        placeholder="Mínimo 15 minutos"
                        className="flex-1"
                      />
                      <div className="flex gap-1">
                        {[15, 30, 45].map(duration => (
                          <Button
                            key={duration}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAiRequest({
                              ...aiRequest, 
                              sessionDuration: duration,
                              customDuration: duration.toString()
                            })}
                            className={aiRequest.sessionDuration === duration ? 'bg-primary/10' : ''}
                          >
                            {duration}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {aiRequest.customDuration && (isNaN(parseInt(aiRequest.customDuration)) || parseInt(aiRequest.customDuration) < 15) && (
                      <p className="text-xs text-destructive">A duração mínima é de 15 minutos</p>
                    )}
                    {aiRequest.customDuration && parseInt(aiRequest.customDuration) > 300 && (
                      <p className="text-xs text-destructive">A duração máxima é de 300 minutos</p>
                    )}
                    {!(aiRequest.customDuration && (isNaN(parseInt(aiRequest.customDuration)) || parseInt(aiRequest.customDuration) < 15 || parseInt(aiRequest.customDuration) > 300)) && (
                      <p className="text-xs text-muted-foreground">Entre 15 e 300 minutos</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Nível de dificuldade</Label>
                    <Select 
                      value={aiRequest.difficulty} 
                      onValueChange={(value: any) => setAiRequest({...aiRequest, difficulty: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Foco do Treino */}
                <div className="space-y-3">
                  <Label>Foco do treino</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Força', 'Cardio', 'Flexibilidade', 'Específico para futebol', 'Agilidade', 'Equilíbrio'].map((focus) => (
                      <div key={focus} className="flex items-center space-x-2">
                        <Checkbox
                          id={focus}
                          checked={aiRequest.focus.includes(focus)}
                          onCheckedChange={() => toggleArrayItem(aiRequest.focus, focus, (value) => setAiRequest({...aiRequest, focus: value}))}
                        />
                        <Label htmlFor={focus} className="text-sm">{focus}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipamentos */}
                <div className="space-y-3">
                  <Label>Equipamentos disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT_OPTIONS.map((equipment) => (
                      <div key={equipment} className="flex items-center space-x-2">
                        <Checkbox
                          id={equipment}
                          checked={aiRequest.equipment.includes(equipment)}
                          onCheckedChange={() => toggleArrayItem(aiRequest.equipment, equipment, (value) => setAiRequest({...aiRequest, equipment: value}))}
                        />
                        <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={handleGenerateTraining} 
                    disabled={aiLoading}
                    className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold shadow-lg shadow-green-500/50"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar Plano
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsGenerateDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Treino de Hoje */}
        {todaysTraining && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Treino de Hoje - {getDayLabel(todaysTraining.day_of_week)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className={getDifficultyInfo(todaysTraining.difficulty_level)?.color}>
                    {getDifficultyInfo(todaysTraining.difficulty_level)?.label}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {todaysTraining.duration_minutes} minutos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    {todaysTraining.muscle_groups.join(', ')}
                  </div>
                </div>
                
                {todaysTraining.description && (
                  <p className="text-muted-foreground">{todaysTraining.description}</p>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold">Exercícios:</h4>
                  {todaysTraining.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} séries de {exercise.reps}
                          {exercise.weight && ` - ${exercise.weight}`}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>

                <Button className="w-full" onClick={() => handleCompleteWorkout(todaysTraining)}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Completar Treino
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plano Semanal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {weeklyTrainings.map(({ day, training }) => (
            <Card key={day} className={`hover-scale transition-all ${training ? 'hover:shadow-lg' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {getDayLabel(day)}
                  {training && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTraining(training.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {training ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">{training.title}</h4>
                      <Badge className={`text-xs ${getDifficultyInfo(training.difficulty_level)?.color}`}>
                        {getDifficultyInfo(training.difficulty_level)?.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {training.duration_minutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {training.exercises.length} exercícios
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewTrainingDetails(training)}
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Dia de descanso</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estatísticas */}
        {trainings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{trainings.length}</p>
                    <p className="text-sm text-muted-foreground">Treinos na semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {trainings.reduce((total, training) => total + (training.duration_minutes || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Minutos por semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {trainings.reduce((total, training) => total + training.exercises.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Exercícios totais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Detalhes do Treino */}
        <Dialog open={isTrainingDetailOpen} onOpenChange={setIsTrainingDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span className="break-words">{selectedTraining?.title}</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedTraining && (
              <div className="space-y-4">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{selectedTraining.duration_minutes} minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm break-words">{selectedTraining.muscle_groups.join(', ')}</span>
                  </div>
                  <Badge className={getDifficultyInfo(selectedTraining.difficulty_level)?.color}>
                    {getDifficultyInfo(selectedTraining.difficulty_level)?.label}
                  </Badge>
                </div>

                {/* Descrição */}
                {selectedTraining.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição do Treino</h3>
                    <p className="text-sm text-muted-foreground break-words">{selectedTraining.description}</p>
                  </div>
                )}

                {/* Rationale do Treino */}
                {selectedTraining.training_rationale && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="break-words">Por que este treino é ideal para você?</span>
                    </h3>
                    <p className="text-xs text-foreground/80 break-words">
                      {selectedTraining.training_rationale}
                    </p>
                  </div>
                )}

                {/* Benefícios de Performance */}
                {selectedTraining.performance_benefits && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="break-words">Como isso melhora sua performance</span>
                    </h3>
                    <p className="text-xs text-foreground/80 break-words">
                      {selectedTraining.performance_benefits}
                    </p>
                  </div>
                )}

                {/* Adaptações */}
                {selectedTraining.adaptation_notes && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="break-words">Adaptações específicas para seu perfil</span>
                    </h3>
                    <p className="text-xs text-foreground/80 break-words">
                      {selectedTraining.adaptation_notes}
                    </p>
                  </div>
                )}

                {/* Exercícios */}
                <div>
                  <h3 className="font-semibold mb-4">Exercícios</h3>
                  <div className="space-y-3">
                    {selectedTraining.exercises.map((exercise, index) => (
                      <Card key={index}>
                        <CardContent className="p-3 sm:p-4">
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm sm:text-base break-words">{exercise.name}</h4>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                                  <span>{exercise.sets} séries</span>
                                  <span>{exercise.reps} reps</span>
                                  {exercise.weight && <span className="break-words">{exercise.weight}</span>}
                                  {exercise.rest_time && <span className="break-words">Descanso: {exercise.rest_time}</span>}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewExercise(exercise)}
                                  className="border-primary text-primary hover:bg-primary hover:text-black text-xs"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Ver Exercício</span>
                                </Button>
                                {exercise.video_url && (
                                  <Button size="sm" variant="outline" asChild className="text-xs">
                                    <a href={exercise.video_url} target="_blank" rel="noopener noreferrer">
                                      <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Vídeo</span>
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Descrição do exercício */}
                            {exercise.description && (
                              <div>
                                <h5 className="text-xs sm:text-sm font-medium mb-1">Como executar:</h5>
                                <p className="text-xs sm:text-sm text-muted-foreground break-words">{exercise.description}</p>
                              </div>
                            )}

                            {/* Benefícios do exercício */}
                            {exercise.benefits && (
                              <div className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <h5 className="text-xs sm:text-sm font-medium mb-1">Benefícios:</h5>
                                <p className="text-xs sm:text-sm text-foreground/80 break-words">{exercise.benefits}</p>
                              </div>
                            )}

                            {/* Notas */}
                            {exercise.notes && (
                              <div className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <h5 className="text-xs sm:text-sm font-medium mb-1">Dicas importantes:</h5>
                                <p className="text-xs sm:text-sm text-foreground/80 break-words">{exercise.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={() => selectedTraining && handleCompleteWorkout(selectedTraining)}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Completar Treino
                  </Button>
                  <Button variant="outline" onClick={() => setIsTrainingDetailOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Visualizador de Exercícios */}
      {isExerciseVisualizerOpen && selectedExercise && (
        <ExerciseVisualizer
          exercise={selectedExercise}
          onClose={() => {
            setIsExerciseVisualizerOpen(false);
            setSelectedExercise(null);
          }}
        />
      )}
    </div>
  );
}
