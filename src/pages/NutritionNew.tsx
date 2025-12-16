import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Droplet, 
  Plus, 
  Utensils, 
  Award, 
  Loader2,
  Apple,
  Calendar,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { useWaterIntake } from "@/hooks/useWaterIntake";
import { useNutritionAchievements } from "@/hooks/useNutritionAchievements";

export default function NutritionNew() {
  console.log('🍎 [NUTRITION-NEW] Componente inicializado');
  
  // Hooks com valores padrão seguros
  const nutritionHooks = useNutritionPlans();
  const waterHooks = useWaterIntake();
  const achievementsHooks = useNutritionAchievements();
  
  // Extrair com defaults
  const nutritionPlans = Array.isArray(nutritionHooks?.nutritionPlans) ? nutritionHooks.nutritionPlans : [];
  const loading = nutritionHooks?.loading || false;
  const fetchNutritionPlans = nutritionHooks?.fetchNutritionPlans || (() => {});
  
  const todayIntake = waterHooks?.todayIntake || 0;
  const dailyGoal = waterHooks?.dailyGoal || 2500;
  const waterProgress = waterHooks?.progress || 0;
  const addWaterIntake = waterHooks?.addWaterIntake || (async () => {});
  const generateHydrationTips = waterHooks?.generateHydrationTips || (() => ['Beba água regularmente']);
  
  const achievements = Array.isArray(achievementsHooks?.achievements) ? achievementsHooks.achievements : [];
  const checkAchievements = achievementsHooks?.checkAchievements || (async () => {});
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [hydrationTips] = useState<string[]>(generateHydrationTips());
  
  console.log('📊 [NUTRITION-NEW] Estado:', {
    nutritionPlans: nutritionPlans.length,
    achievements: achievements.length,
    todayIntake,
    dailyGoal,
    loading
  });
  
  // Carregar dados
  useEffect(() => {
    console.log('⚙️ [NUTRITION-NEW] Carregando dados...');
    try {
      fetchNutritionPlans();
      checkAchievements();
      console.log('✅ [NUTRITION-NEW] Dados carregados');
    } catch (error) {
      console.error('❌ [NUTRITION-NEW] Erro ao carregar:', error);
    }
  }, []);
  
  // Adicionar água
  const handleAddWater = async (amount: number) => {
    console.log(`💧 [NUTRITION-NEW] Adicionando ${amount}ml`);
    try {
      await addWaterIntake(amount);
      toast.success(`${amount}ml registrados!`);
    } catch (error) {
      console.error('❌ [NUTRITION-NEW] Erro ao adicionar água:', error);
      toast.error('Erro ao registrar água');
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Nutrição</h1>
          <p className="text-sm text-gray-400">Versão Nova e Melhorada</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-yellow-500/20 border-yellow-500/30 text-yellow-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="plans">Meus Planos</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        {/* TAB: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Card de Hidratação */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  Hidratação Diária
                </CardTitle>
                <Badge variant="outline">{dailyGoal}ml</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progresso de hoje</span>
                  <span className="font-medium text-white">{todayIntake}ml / {dailyGoal}ml</span>
                </div>
                
                <Progress value={waterProgress} className="h-2" />
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddWater(200)}
                    className="w-full"
                  >
                    +200ml
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddWater(500)}
                    className="w-full"
                  >
                    +500ml
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAddWater(1000)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    +1L
                  </Button>
                </div>
                
                {hydrationTips && hydrationTips.length > 0 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
                    <p className="text-blue-400 font-medium mb-1">💡 Dica:</p>
                    <p className="text-gray-300">{hydrationTips[0]}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo de Planos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Utensils className="h-5 w-5 text-yellow-500" />
                Resumo Nutricional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-sm text-gray-400 mb-1">Planos Criados</p>
                  <p className="text-2xl font-bold text-yellow-500">{nutritionPlans.length}</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-sm text-gray-400 mb-1">Conquistas</p>
                  <p className="text-2xl font-bold text-green-500">
                    {achievements.filter(a => a.achieved).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Meus Planos */}
        <TabsContent value="plans" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : nutritionPlans.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Apple className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Você ainda não tem planos nutricionais.</p>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Plano
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {nutritionPlans.map((plan, index) => (
                <Card key={plan.id || index} className="hover:border-yellow-500/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.title || 'Plano Sem Nome'}</CardTitle>
                      <Badge variant="secondary">{plan.complexity_level || 'Simples'}</Badge>
                    </div>
                    <CardDescription>
                      {Array.isArray(plan.goals) && plan.goals.length > 0 
                        ? plan.goals.join(', ') 
                        : 'Sem objetivos definidos'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB: Conquistas */}
        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma conquista ainda. Continue se alimentando bem!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <Card 
                  key={achievement.id || index}
                  className={achievement.achieved 
                    ? "bg-yellow-500/10 border-yellow-500/30" 
                    : "bg-gray-900/50 border-gray-700"
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        achievement.achieved ? "bg-yellow-500/20" : "bg-gray-700"
                      }`}>
                        <Award className={`h-5 w-5 ${
                          achievement.achieved ? "text-yellow-500" : "text-gray-500"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{achievement.title || 'Conquista'}</CardTitle>
                        <CardDescription className="text-xs">
                          {achievement.achieved ? '✅ Conquistado!' : achievement.requirement || 'Em progresso'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400">{achievement.description || 'Sem descrição'}</p>
                    <p className="text-xs text-yellow-500 mt-2">{achievement.points || 0} pontos</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

