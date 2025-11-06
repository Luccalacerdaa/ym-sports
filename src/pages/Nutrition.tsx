import { useState, useEffect } from "react";
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
import { Loader2, Plus, Droplet, Award, Utensils, Calendar, ChevronRight, Apple, Trash2, Bell } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { NutritionPlanGenerator } from "@/components/NutritionPlanGenerator";
import { SimpleNotificationManager } from "@/components/SimpleNotificationManager";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { nutritionPlans, currentPlan, loading, fetchNutritionPlans, fetchNutritionPlanDetails, deleteNutritionPlan } = useNutritionPlans();
  const { todayIntake, dailyGoal, progress: waterProgress, addWaterIntake, generateHydrationTips } = useWaterIntake();
  const { achievements, checkAchievements } = useNutritionAchievements();
  const { isNotificationsDialogOpen, openNotificationsDialog, closeNotificationsDialog } = useNotificationsManager();
  const { sendNotification, permissionGranted } = useSimpleNotifications();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyPlan | null>(null);
  const [hydrationTips, setHydrationTips] = useState<string[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchNutritionPlans();
    setHydrationTips(generateHydrationTips());
    
    // Verificar conquistas
    checkAchievements();
  }, []);

  // Selecionar plano
  const handleSelectPlan = async (planId: string) => {
    console.log('Selecionando plano:', planId);
    const plan = await fetchNutritionPlanDetails(planId);
    console.log('Plano carregado:', plan);
    if (plan) {
      setSelectedPlan(plan);
      if (plan.days && plan.days.length > 0) {
        setSelectedDay(plan.days[0]);
        console.log('Dia selecionado:', plan.days[0]);
      }
      setSelectedTab("plan");
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
    await addWaterIntake(amount);
    toast.success(`${amount}ml de água registrados`);
  };

  // Renderizar visão geral
  const renderOverview = () => {
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
              <p>{hydrationTips[Math.floor(Math.random() * hydrationTips.length)]}</p>
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
            ) : nutritionPlans.length === 0 ? (
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
                {nutritionPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectPlan(plan.id!)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{plan.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {plan.goals.join(", ")}
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
                          handleDeletePlan(plan.id!);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
              {achievements.slice(0, 6).map((achievement) => (
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
            </div>
            {achievements.length > 6 && (
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
    if (!selectedPlan) {
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
                  {selectedPlan.goals.join(", ")}
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

        {/* Debug Info */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Debug - Dados do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Plano ID: {selectedPlan.id}</div>
              <div>Título: {selectedPlan.title}</div>
              <div>Dias disponíveis: {selectedPlan.days?.length || 0}</div>
              <div>Dia selecionado: {selectedDay?.id || 'Nenhum'}</div>
              <div>Refeições no dia: {selectedDay?.meals?.length || 0}</div>
              {selectedPlan.days && selectedPlan.days.length > 0 && (
                <div>
                  Estrutura dos dias: {selectedPlan.days.map(d => `${d.day || d.day_of_week || 'Sem nome'} (${d.meals?.length || 0} refeições)`).join(', ')}
                </div>
              )}
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
                  {day.day || day.day_of_week || `Dia ${index + 1}`}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum dia encontrado neste plano</p>
              <p className="text-xs text-red-500 mt-2">
                Dados do plano: {JSON.stringify(selectedPlan, null, 2)}
              </p>
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
                                {food.alternatives && food.alternatives.length > 0 && (
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
              {achievements.map((achievement) => (
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
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
          onPlanCreated={(plan) => {
            setIsGeneratorOpen(false);
            fetchNutritionPlans();
            toast.success("Plano nutricional criado com sucesso!");
            
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
