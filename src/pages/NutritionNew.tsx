import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { useWaterIntake } from "@/hooks/useWaterIntake";
import { useNutritionAchievements } from "@/hooks/useNutritionAchievements";
import { NutritionPlan } from "@/types/nutrition";
import { Loader2, Plus, Droplet, Award, Utensils, ChevronRight, Apple, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NutritionPlanGenerator } from "@/components/NutritionPlanGenerator";

export default function Nutrition() {
  console.log('🍎 [NUTRITION-NEW] Componente inicializado');
  
  const navigate = useNavigate();
  
  // Hooks
  const nutritionHooks = useNutritionPlans();
  const waterHooks = useWaterIntake();
  const achievementsHooks = useNutritionAchievements();
  
  // Extrair valores com defaults seguros
  const nutritionPlans = Array.isArray(nutritionHooks?.nutritionPlans) ? nutritionHooks.nutritionPlans : [];
  const loading = nutritionHooks?.loading || false;
  const fetchNutritionPlans = nutritionHooks?.fetchNutritionPlans || (() => {});
  const deleteNutritionPlan = nutritionHooks?.deleteNutritionPlan || (async () => false);
  
  const todayIntake = waterHooks?.todayIntake || 0;
  const dailyGoal = waterHooks?.dailyGoal || 2000;
  const waterProgress = waterHooks?.progress || 0;
  const addWaterIntake = waterHooks?.addWaterIntake || (async () => {});
  
  const achievements = Array.isArray(achievementsHooks?.achievements) ? achievementsHooks.achievements : [];
  const checkAchievements = achievementsHooks?.checkAchievements || (() => {});
  
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  console.log('📊 [NUTRITION-NEW] Estado inicial:', {
    nutritionPlansCount: nutritionPlans.length,
    achievementsCount: achievements.length,
    loading,
    todayIntake,
    dailyGoal,
    waterProgress
  });

  // Carregar dados iniciais
  useEffect(() => {
    console.log('⚙️ [NUTRITION-NEW] Carregando dados iniciais');
    try {
      fetchNutritionPlans();
      checkAchievements();
    } catch (error) {
      console.error('❌ [NUTRITION-NEW] Erro ao carregar:', error);
    }
  }, []);

  // Excluir plano
  const handleDeletePlan = async (planId: string) => {
    if (confirm("Tem certeza que deseja excluir este plano nutricional?")) {
      const success = await deleteNutritionPlan(planId);
      if (success) {
        toast.success("Plano nutricional excluído com sucesso");
        fetchNutritionPlans();
      } else {
        toast.error("Erro ao excluir plano nutricional");
      }
    }
  };

  // Adicionar água
  const handleAddWater = async (amount: number) => {
    console.log(`💧 [NUTRITION-NEW] Adicionando ${amount}ml`);
    await addWaterIntake(amount);
    toast.success(`${amount}ml de água registrados`);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nutrição</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsGeneratorOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

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
                {nutritionPlans.map((plan) => {
                  // Defensive checks
                  const planGoals = Array.isArray(plan?.goals) ? plan.goals : [];
                  const planId = plan?.id || '';
                  const planTitle = plan?.title || 'Plano sem título';
                  const complexityLevel = plan?.complexity_level || 'simples';
                  
                  return (
                    <div 
                      key={planId} 
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (planId) {
                          navigate(`/dashboard/nutrition?plan=${planId}`);
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{planTitle}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {planGoals.length > 0 ? planGoals.join(", ") : 'Sem objetivos'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {complexityLevel === 'simples' ? 'Simples' : 
                           complexityLevel === 'intermediario' ? 'Intermediário' : 'Avançado'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (planId) {
                              handleDeletePlan(planId);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
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
              {achievements.slice(0, 6).map((achievement) => {
                const achievementId = achievement?.id || Math.random().toString();
                const achievementTitle = achievement?.title || 'Conquista';
                const achievementDescription = achievement?.description || '';
                const achieved = achievement?.achieved || false;
                
                return (
                  <div 
                    key={achievementId}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center ${
                      achieved 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-muted/30 border-muted text-muted-foreground"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                      achieved ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {achieved && <Award className="h-5 w-5" />}
                    </div>
                    <h4 className="text-sm font-medium">{achievementTitle}</h4>
                    <p className="text-xs mt-1 line-clamp-2">{achievementDescription}</p>
                  </div>
                );
              })}
              {achievements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center col-span-full py-4">
                  Nenhuma conquista ainda.
                </p>
              )}
            </div>
            {achievements.length > 6 && (
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={() => navigate('/dashboard/achievements')}
              >
                Ver todas as conquistas
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gerador de Plano Nutricional */}
      {isGeneratorOpen && (
        <NutritionPlanGenerator 
          onClose={() => setIsGeneratorOpen(false)} 
          onPlanCreated={(plan) => {
            setIsGeneratorOpen(false);
            fetchNutritionPlans();
            toast.success("Plano nutricional criado com sucesso!");
          }}
        />
      )}
    </div>
  );
}
