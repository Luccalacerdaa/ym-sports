import { useState, useEffect, Component, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { useWaterIntake } from "@/hooks/useWaterIntake";
import { useNutritionAchievements } from "@/hooks/useNutritionAchievements";
import { useProfile } from "@/hooks/useProfile";
import { useNotificationsManager } from "@/hooks/useNotificationsManager";
import { NutritionPlan, DailyPlan, Meal, FoodItem } from "@/types/nutrition";
import { Loader2, Plus, Droplet, Award, Utensils, Calendar, ChevronRight, Apple, Trash2, Bell, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { NutritionPlanGenerator } from "@/components/NutritionPlanGenerator";
import { SimpleNotificationManager } from "@/components/SimpleNotificationManager";
import { useSimpleNotifications } from "@/hooks/useSimpleNotifications";
import { useDailyNotifications } from "@/hooks/useDailyNotifications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ErrorBoundary interno para capturar erros
class NutritionErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 [NUTRITION-ERROR-BOUNDARY] Erro capturado:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 [NUTRITION-ERROR-BOUNDARY] Detalhes:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Erro na Página de Nutrição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-500/20 border border-red-500/40 rounded">
                <p className="font-semibold text-red-300">Erro:</p>
                <p className="text-sm text-gray-300 mt-1">{this.state.error?.message}</p>
              </div>
              
              <div className="text-sm text-gray-400">
                <p className="font-semibold mb-2">Ações possíveis:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Recarregar a página (F5)</li>
                  <li>Limpar cache e cookies</li>
                  <li>Entrar em contato com o suporte</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

function NutritionContent() {
  console.log('🍎 [NUTRITION] Componente inicializado');
  
  const navigate = useNavigate();
  const { profile } = useProfile();
  const nutritionHooks = useNutritionPlans();
  const waterHooks = useWaterIntake();
  const achievementsHooks = useNutritionAchievements();
  const notificationsHooks = useNotificationsManager();
  const simpleNotificationsHooks = useSimpleNotifications();
  
  // Log detalhado dos hooks ANTES de desestruturar
  console.log('🔍 [NUTRITION] Hooks RAW:', {
    nutritionHooks: {
      type: typeof nutritionHooks,
      hasPlans: 'nutritionPlans' in nutritionHooks,
      plansType: typeof nutritionHooks.nutritionPlans,
      plansIsArray: Array.isArray(nutritionHooks.nutritionPlans)
    },
    achievementsHooks: {
      type: typeof achievementsHooks,
      hasAchievements: 'achievements' in achievementsHooks,
      achievementsType: typeof achievementsHooks.achievements,
      achievementsIsArray: Array.isArray(achievementsHooks.achievements)
    }
  });
  
  const { nutritionPlans = [], currentPlan, loading, fetchNutritionPlans, fetchNutritionPlanDetails, deleteNutritionPlan } = nutritionHooks;
  const { todayIntake, dailyGoal, progress: waterProgress, addWaterIntake, generateHydrationTips } = waterHooks;
  const { achievements = [], checkAchievements } = achievementsHooks;
  const { isNotificationsDialogOpen, openNotificationsDialog, closeNotificationsDialog } = notificationsHooks;
  const { sendNotification, permissionGranted } = simpleNotificationsHooks;
  
  console.log('📊 [NUTRITION] Estado dos hooks APÓS destructuring:', {
    nutritionPlansType: typeof nutritionPlans,
    nutritionPlansIsArray: Array.isArray(nutritionPlans),
    nutritionPlansCount: nutritionPlans?.length || 0,
    achievementsType: typeof achievements,
    achievementsIsArray: Array.isArray(achievements),
    achievementsCount: achievements?.length || 0,
    loading,
    todayIntake,
    dailyGoal,
    waterProgress
  });
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyPlan | null>(null);
  const [hydrationTips, setHydrationTips] = useState<string[]>(['Beba água regularmente']);

  // Carregar dados iniciais
  useEffect(() => {
    console.log('⚙️ [NUTRITION] useEffect executado');
    try {
      console.log('📥 [NUTRITION] Buscando planos nutricionais...');
      fetchNutritionPlans();
      
      console.log('💧 [NUTRITION] Gerando dicas de hidratação...');
      const tips = generateHydrationTips();
      console.log('💧 [NUTRITION] Dicas geradas:', tips);
      setHydrationTips(Array.isArray(tips) ? tips : ['Beba água regularmente']);
      
      console.log('🏆 [NUTRITION] Verificando conquistas...');
      checkAchievements();
      
      console.log('✅ [NUTRITION] useEffect concluído com sucesso');
    } catch (error) {
      console.error('❌ [NUTRITION] Erro ao carregar dados iniciais:', error);
      setHydrationTips(['Beba água regularmente']);
    }
  }, []);

  // Selecionar plano
  const handleSelectPlan = async (planId: string) => {
    console.log('📋 [NUTRITION] Selecionando plano:', planId);
    const plan = await fetchNutritionPlanDetails(planId);
    console.log('📋 [NUTRITION] Plano carregado:', {
      id: plan?.id,
      title: plan?.title,
      daysCount: plan?.days?.length || 0
    });
    
    if (plan) {
      setSelectedPlan(plan);
      if (plan.days && plan.days.length > 0) {
        setSelectedDay(plan.days[0]);
        console.log('📅 [NUTRITION] Dia selecionado:', {
          day: plan.days[0].day_of_week,
          mealsCount: plan.days[0].meals?.length || 0
        });
      }
      setSelectedTab("plan");
      console.log('✅ [NUTRITION] Plano selecionado com sucesso');
    } else {
      console.warn('⚠️ [NUTRITION] Plano não encontrado');
    }
  };

  // Excluir plano
  const handleDeletePlan = async (planId: string) => {
    if (confirm("Tem certeza que deseja excluir este plano nutricional?")) {
      const success = await deleteNutritionPlan(planId);
      if (success) {
        toast.success("Plano nutricional excluído com sucesso");
        if (selectedPlan?.id === planId) {
          setSelectedPlan(null);
          setSelectedDay(null);
          setSelectedTab("overview");
        }
      } else {
        toast.error("Erro ao excluir plano nutricional");
      }
    }
  };

  // Adicionar água
  const handleAddWater = async (amount: number) => {
    console.log(`💧 [NUTRITION] Adicionando ${amount}ml de água...`);
    await addWaterIntake(amount);
    console.log(`✅ [NUTRITION] ${amount}ml de água registrados. Total hoje: ${todayIntake + amount}ml`);
    toast.success(`${amount}ml de água registrados`);
    
    // Verificar conquistas após adicionar água
    console.log('🏆 [NUTRITION] Verificando conquistas de hidratação...');
    const newAchievements = await checkAchievements();
    if (newAchievements && newAchievements.length > 0) {
      console.log('🎉 [NUTRITION] Novas conquistas desbloqueadas:', newAchievements);
    }
  };

  // Renderizar visão geral
  const renderOverview = () => {
    console.log('🎨 [NUTRITION] Renderizando visão geral...');
    
    // Garantir que achievements é um array
    const safeAchievements = Array.isArray(achievements) ? achievements : [];
    const safeNutritionPlans = Array.isArray(nutritionPlans) ? nutritionPlans : [];
    const safeHydrationTips = Array.isArray(hydrationTips) ? hydrationTips : ['Beba água regularmente'];
    
    console.log('📊 [NUTRITION] Arrays seguros:', {
      achievements: safeAchievements.length,
      nutritionPlans: safeNutritionPlans.length,
      hydrationTips: safeHydrationTips.length
    });
    
    return (
      <div className="space-y-6">
        {/* Seção de Hidratação */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Droplet className="h-5 w-5 mr-2 text-blue-500" />
                Hidratação
              </CardTitle>
              <Badge variant="outline" className="font-normal">
                Meta: {dailyGoal}ml
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso de hoje</span>
                <span className="font-medium">{todayIntake}ml / {dailyGoal}ml</span>
              </div>
              <Progress value={waterProgress} className="h-2" />
              
              <div className="flex justify-between gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddWater(200)}
                >
                  +200ml
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddWater(500)}
                >
                  +500ml
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddWater(1000)}
                >
                  +1L
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground mb-1">Dica:</h4>
              <p>{safeHydrationTips.length > 0 ? safeHydrationTips[Math.floor(Math.random() * safeHydrationTips.length)] : 'Mantenha-se hidratado!'}</p>
            </div>
          </CardFooter>
        </Card>

        {/* Seção de Planos Nutricionais */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Utensils className="h-5 w-5 mr-2 text-primary" />
                Meus Planos Nutricionais
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setIsGeneratorOpen(true)}
                className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold shadow-lg shadow-green-500/50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Plano
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : safeNutritionPlans.length === 0 ? (
              <div className="text-center py-8">
                <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não tem planos nutricionais.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsGeneratorOpen(true)}
                >
                  Criar Plano Nutricional
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {safeNutritionPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        console.log('🖱️ [NUTRITION] Clicou no plano:', plan.id, plan.title);
                        if (plan.id) {
                          handleSelectPlan(plan.id);
                        } else {
                          console.error('⚠️ [NUTRITION] Plano sem ID:', plan);
                          toast.error('Erro: Plano sem identificador');
                        }
                      }}
                    >
                      <h4 className="font-medium truncate">{plan.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {Array.isArray(plan.goals) && plan.goals.length > 0 ? plan.goals.join(", ") : 'Sem objetivos'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {plan.complexity_level === 'simples' ? 'Simples' : 
                         plan.complexity_level === 'intermediario' ? 'Intermediário' : 'Avançado'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          console.log('🗑️ [NUTRITION] Clicou em deletar plano:', plan.id);
                          if (plan.id) {
                            handleDeletePlan(plan.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => plan.id && handleSelectPlan(plan.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Conquistas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Conquistas Nutricionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {safeAchievements.slice(0, 6).map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center ${
                    achievement.achieved 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-muted/30 border-muted text-muted-foreground"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                    achievement.achieved ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {achievement.achieved && <Award className="h-5 w-5" />}
                  </div>
                  <h4 className="text-sm font-medium">{achievement.title}</h4>
                  <p className="text-xs mt-1 line-clamp-2">{achievement.description}</p>
                </div>
              ))}
              {safeAchievements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center col-span-full py-4">Nenhuma conquista ainda.</p>
              )}
            </div>
            {safeAchievements.length > 6 && (
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={() => setSelectedTab("achievements")}
              >
                Ver todas as conquistas
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizar detalhes do plano
  const renderPlanDetails = () => {
    console.log('📋 [NUTRITION] Renderizando detalhes do plano...', {
      selectedPlan: selectedPlan?.id,
      selectedDay: selectedDay?.id
    });
    
    if (!selectedPlan) {
      console.log('⚠️ [NUTRITION] Nenhum plano selecionado');
      return (
        <div className="flex justify-center items-center py-12">
          <Button 
            variant="outline"
            onClick={() => setSelectedTab("overview")}
          >
            Voltar para Visão Geral
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Cabeçalho do Plano */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedPlan.title}</CardTitle>
                <CardDescription className="mt-1">
                  {Array.isArray(selectedPlan.goals) && selectedPlan.goals.length > 0 ? selectedPlan.goals.join(", ") : 'Sem objetivos definidos'}
                </CardDescription>
              </div>
              <Badge>
                {selectedPlan.complexity_level === 'simples' ? 'Simples' : 
                 selectedPlan.complexity_level === 'intermediario' ? 'Intermediário' : 'Avançado'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Descrição</h4>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Conselhos Nutricionais</h4>
                <p className="text-sm text-muted-foreground">{selectedPlan.nutritional_advice}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Dicas de Hidratação</h4>
                <p className="text-sm text-muted-foreground">{selectedPlan.hydration_tips}</p>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Seleção de Dias */}
        {selectedPlan.days && selectedPlan.days.length > 0 ? (
          <div className="space-y-4">
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
              {selectedPlan.days.map((day, index) => (
                <Button
                  key={day.id || index}
                  variant={selectedDay?.id === day.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className="whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {day.day_of_week || `Dia ${index + 1}`}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum dia encontrado neste plano</p>
            </CardContent>
          </Card>
        )}

        {/* Detalhes do Dia */}
        {selectedPlan.days && selectedPlan.days.length > 0 && selectedDay && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{selectedDay.day || selectedDay.day_of_week || 'Dia sem nome'}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {selectedDay.total_calories || 0} kcal
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                    {selectedDay.water_intake || 0}ml água
                  </Badge>
                </div>
              </div>
              <CardDescription>
                <div className="flex gap-3 text-xs mt-1">
                  <span>Proteínas: {selectedDay.total_protein || 0}g</span>
                  <span>Carboidratos: {selectedDay.total_carbs || 0}g</span>
                  <span>Gorduras: {selectedDay.total_fat || 0}g</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDay.meals && selectedDay.meals.length > 0 ? (
                <div className="space-y-6">
                  {selectedDay.meals.map((meal, mealIndex) => (
                    <div key={meal.id || mealIndex} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium flex items-center">
                          <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
                          {meal.title || 'Refeição'} ({meal.time || 'Sem horário'})
                        </h3>
                        <Badge variant="outline">
                          {meal.total_calories || 0} kcal
                        </Badge>
                      </div>
                      
                      {meal.foods && meal.foods.length > 0 ? (
                        <div className="pl-5 space-y-3">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={food.id || foodIndex} className="flex justify-between items-start border-b border-border pb-2 last:border-0 last:pb-0">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{food.name || 'Alimento'}</div>
                                <div className="text-xs text-muted-foreground">{food.portion || 'Porção não especificada'}</div>
                                {food.preparation && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    <span className="font-medium">Preparo:</span> {food.preparation}
                                  </div>
                                )}
                                {Array.isArray(food.alternatives) && food.alternatives.length > 0 && (
                                  <div className="text-xs text-green-600 mt-1">
                                    <span className="font-medium">Alternativas:</span> {food.alternatives.join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-right ml-4">
                                <div className="font-medium">{food.calories || 0} kcal</div>
                                <div className="text-muted-foreground">
                                  P: {food.protein || 0}g | C: {food.carbs || 0}g | G: {food.fat || 0}g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-5 text-sm text-muted-foreground">
                          Nenhum alimento encontrado nesta refeição
                        </div>
                      )}
                      
                      {meal.notes && (
                        <div className="pl-5 text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                          <span className="font-medium">Observações:</span> {meal.notes}
                        </div>
                      )}
                      
                      {meal.preparation_time && (
                        <div className="pl-5 text-xs text-blue-600">
                          <span className="font-medium">Tempo de preparo:</span> {meal.preparation_time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma refeição encontrada neste dia</p>
                  <p className="text-xs text-red-500 mt-2">
                    Debug: {JSON.stringify(selectedDay, null, 2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Renderizar conquistas
  const renderAchievements = () => {
    console.log('🏆 [NUTRITION] Renderizando conquistas...');
    
    // Garantir que achievements é um array
    const safeAchievements = Array.isArray(achievements) ? achievements : [];
    
    console.log('🏆 [NUTRITION] Conquistas seguras:', {
      total: safeAchievements.length,
      achieved: safeAchievements.filter(a => a.achieved).length
    });
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Conquistas Nutricionais
            </CardTitle>
            <CardDescription>
              Complete objetivos nutricionais para ganhar pontos e conquistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safeAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`flex items-start p-4 rounded-lg border ${
                    achievement.achieved 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-muted/30 border-muted text-muted-foreground"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                    achievement.achieved ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm mt-1">{achievement.description}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant={achievement.achieved ? "default" : "outline"} className="text-xs">
                        {achievement.achieved ? "Conquistado" : achievement.requirement}
                      </Badge>
                      <span className="text-xs ml-2 text-muted-foreground">
                        {achievement.points} pontos
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {safeAchievements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center col-span-full py-8">Nenhuma conquista ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nutrição</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={openNotificationsDialog}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsGeneratorOpen(true)}
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold shadow-lg shadow-green-500/50 border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="plan">Plano Atual</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>
        <TabsContent value="plan">
          {renderPlanDetails()}
        </TabsContent>
        <TabsContent value="achievements">
          {renderAchievements()}
        </TabsContent>
      </Tabs>

      {/* Gerador de Plano Nutricional */}
      {isGeneratorOpen && (
        <NutritionPlanGenerator 
          onClose={() => setIsGeneratorOpen(false)} 
          onPlanCreated={async (plan) => {
            setIsGeneratorOpen(false);
            await fetchNutritionPlans();
            toast.success("Plano nutricional criado com sucesso!");
            
            // Verificar conquistas após criar plano
            console.log('🏆 [NUTRITION] Verificando conquistas nutricionais após criar plano...');
            const newAchievements = await checkAchievements();
            if (newAchievements && newAchievements.length > 0) {
              console.log('🎉 [NUTRITION] Novas conquistas desbloqueadas:', newAchievements);
              toast.success(`🎉 Você desbloqueou ${newAchievements.length} conquista(s)!`);
            }
            
            // Enviar notificação se permitido
            if (permissionGranted) {
              sendNotification(
                '🍎 Plano Nutricional Criado!', 
                `Seu plano "${plan?.title || 'Plano Personalizado'}" está pronto! Confira suas refeições e comece a seguir hoje mesmo.`
              );
            }
            
            if (plan) {
              setSelectedPlan(plan);
              if (plan.days && plan.days.length > 0) {
                setSelectedDay(plan.days[0]);
              }
              setSelectedTab("plan");
            }
          }}
        />
      )}
      
      {/* Gerenciador de Notificações */}
      <SimpleNotificationManager 
        open={isNotificationsDialogOpen} 
        onClose={closeNotificationsDialog} 
      />
    </div>
  );
}

export default function Nutrition() {
  return (
    <NutritionErrorBoundary>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Aviso Importante */}
        <Card className="mb-6 bg-yellow-500/10 border-yellow-500/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-yellow-500">Aviso Importante sobre Nutrição</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Esta ferramenta tem como objetivo auxiliar e orientar sobre alimentação saudável para atletas. 
                  Os planos gerados são sugestões educacionais e <span className="font-semibold text-yellow-400">não substituem 
                  o acompanhamento de um nutricionista profissional</span>. Se você possui alergias alimentares, 
                  restrições médicas ou condições de saúde específicas, consulte um profissional antes de seguir 
                  qualquer plano alimentar. Não nos responsabilizamos por reações alérgicas ou problemas de saúde 
                  decorrentes do uso inadequado desta ferramenta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <NutritionContent />
      </div>
    </NutritionErrorBoundary>
  );
}
