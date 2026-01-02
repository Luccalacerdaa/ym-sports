import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNutritionPlans } from '@/hooks/useNutritionPlans';
import { NutritionPlan, DailyPlan } from '@/types/nutrition';
import { Loader2, Utensils, Calendar, ChevronLeft, Apple } from 'lucide-react';
import { toast } from 'sonner';

export default function NutritionPlanView() {
  console.log('📋 [NUTRITION-PLAN-VIEW] Componente inicializado');
  
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  
  const { fetchNutritionPlanDetails, loading } = useNutritionPlans();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyPlan | null>(null);

  // Carregar plano
  useEffect(() => {
    if (planId) {
      console.log('📥 [NUTRITION-PLAN-VIEW] Carregando plano:', planId);
      loadPlan();
    } else {
      console.error('❌ [NUTRITION-PLAN-VIEW] ID do plano não fornecido');
      toast.error('Plano não encontrado');
      navigate('/dashboard/nutrition');
    }
  }, [planId]);

  const loadPlan = async () => {
    if (!planId) return;
    
    try {
      const loadedPlan = await fetchNutritionPlanDetails(planId);
      console.log('📋 [NUTRITION-PLAN-VIEW] Plano carregado:', {
        id: loadedPlan?.id,
        title: loadedPlan?.title,
        daysCount: loadedPlan?.days?.length || 0
      });
      
      if (loadedPlan) {
        setPlan(loadedPlan);
        if (loadedPlan.days && loadedPlan.days.length > 0) {
          setSelectedDay(loadedPlan.days[0]);
          console.log('📅 [NUTRITION-PLAN-VIEW] Dia selecionado:', loadedPlan.days[0].day_of_week);
        }
      } else {
        toast.error('Plano não encontrado');
        navigate('/dashboard/nutrition');
      }
    } catch (error) {
      console.error('❌ [NUTRITION-PLAN-VIEW] Erro ao carregar plano:', error);
      toast.error('Erro ao carregar plano nutricional');
      navigate('/dashboard/nutrition');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Plano não encontrado</p>
            <Button onClick={() => navigate('/dashboard/nutrition')}>
              Voltar para Nutrição
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      {/* Cabeçalho com botão voltar */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/dashboard/nutrition')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Plano Nutricional</h1>
      </div>

      <div className="space-y-6">
        {/* Cabeçalho do Plano */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription className="mt-1">
                  {Array.isArray(plan.goals) && plan.goals.length > 0 
                    ? plan.goals.join(", ") 
                    : 'Sem objetivos definidos'}
                </CardDescription>
              </div>
              <Badge>
                {plan.complexity_level === 'simples' ? 'Simples' : 
                 plan.complexity_level === 'intermediario' ? 'Intermediário' : 'Avançado'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Descrição</h4>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              
              {plan.nutritional_advice && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Conselhos Nutricionais</h4>
                  <p className="text-sm text-muted-foreground">{plan.nutritional_advice}</p>
                </div>
              )}
              
              {plan.hydration_tips && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Dicas de Hidratação</h4>
                  <p className="text-sm text-muted-foreground">{plan.hydration_tips}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Dias */}
        {plan.days && plan.days.length > 0 ? (
          <div className="space-y-4">
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
              {plan.days.map((day, index) => (
                <Button
                  key={day.id || index}
                  variant={selectedDay?.id === day.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    console.log('📅 [NUTRITION-PLAN-VIEW] Selecionando dia:', day.day_of_week);
                    setSelectedDay(day);
                  }}
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
        {plan.days && plan.days.length > 0 && selectedDay && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {selectedDay.day || selectedDay.day_of_week || 'Dia sem nome'}
                </CardTitle>
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
                            <div 
                              key={food.id || foodIndex} 
                              className="flex justify-between items-start border-b border-border pb-2 last:border-0 last:pb-0"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{food.name || 'Alimento'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {food.portion || 'Porção não especificada'}
                                </div>
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
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

