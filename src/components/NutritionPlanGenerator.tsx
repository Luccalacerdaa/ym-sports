import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAINutrition } from "@/hooks/useAINutrition";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { useProfile } from "@/hooks/useProfile";
import { 
  NutritionRequest, 
  NutritionPlan, 
  MealType, 
  ComplexityLevel,
  FoodPreference
} from "@/types/nutrition";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NutritionPlanGeneratorProps {
  onClose: () => void;
  onPlanCreated: (plan: NutritionPlan | null) => void;
}

export function NutritionPlanGenerator({ onClose, onPlanCreated }: NutritionPlanGeneratorProps) {
  const { profile } = useProfile();
  const { generateNutritionPlan, loading: generatingPlan, error: generationError } = useAINutrition();
  const { saveNutritionPlan, preferences, fetchFoodPreferences, saveFoodPreferences } = useNutritionPlans();
  
  const [step, setStep] = useState<'form' | 'generating' | 'review'>('form');
  const [generatedPlan, setGeneratedPlan] = useState<NutritionPlan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  
  // Formulário
  const [goals, setGoals] = useState<string[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('intermediario');
  const [daysCount, setDaysCount] = useState<number>(3);
  const [waterReminder, setWaterReminder] = useState<boolean>(true);
  const [foodPreferences, setFoodPreferences] = useState<FoodPreference>({
    favorites: [],
    avoid: [],
    allergies: []
  });
  
  // Opções disponíveis
  const availableGoals = [
    { id: 'weight_loss', label: 'Perda de peso' },
    { id: 'muscle_gain', label: 'Ganho de massa muscular' },
    { id: 'maintenance', label: 'Manutenção de peso' },
    { id: 'performance', label: 'Melhora de desempenho' },
    { id: 'recovery', label: 'Recuperação pós-treino' },
    { id: 'energy', label: 'Mais energia durante o dia' }
  ];
  
  const availableMealTypes = [
    { id: 'cafe_da_manha', label: 'Café da manhã' },
    { id: 'almoco', label: 'Almoço' },
    { id: 'lanche', label: 'Lanche' },
    { id: 'jantar', label: 'Jantar' },
    { id: 'pre_treino', label: 'Pré-treino' },
    { id: 'pos_treino', label: 'Pós-treino' }
  ];
  
  // Carregar preferências do usuário
  useEffect(() => {
    fetchFoodPreferences();
  }, []);
  
  // Atualizar preferências de alimentos quando as preferências do usuário forem carregadas
  useEffect(() => {
    if (preferences) {
      setFoodPreferences({
        favorites: preferences.favorites || [],
        avoid: preferences.avoid || [],
        allergies: preferences.allergies || []
      });
    }
  }, [preferences]);
  
  // Manipuladores de alteração
  const handleGoalChange = (goalId: string, checked: boolean) => {
    if (checked) {
      setGoals([...goals, goalId]);
    } else {
      setGoals(goals.filter(g => g !== goalId));
    }
  };
  
  const handleMealTypeChange = (mealType: MealType, checked: boolean) => {
    if (checked) {
      setMealTypes([...mealTypes, mealType]);
    } else {
      setMealTypes(mealTypes.filter(m => m !== mealType));
    }
  };
  
  const handleFoodPreferenceChange = (type: keyof FoodPreference, value: string) => {
    // Atualizar diretamente o valor como string
    // A separação por vírgulas será feita apenas quando enviar o formulário
    setFoodPreferences(prev => ({
      ...prev,
      [type]: [value] // Manter como array com um elemento para compatibilidade
    }));
  };
  
  // Gerar plano nutricional
  const handleGeneratePlan = async () => {
    // Validar formulário
    if (goals.length === 0) {
      toast.error("Selecione pelo menos um objetivo");
      return;
    }
    
    if (mealTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de refeição");
      return;
    }
    
    // Processar preferências alimentares (separar por vírgulas)
    const processedPreferences = {
      favorites: foodPreferences.favorites[0] 
        ? foodPreferences.favorites[0].split(',').map(item => item.trim()).filter(item => item.length > 0)
        : [],
      avoid: foodPreferences.avoid[0] 
        ? foodPreferences.avoid[0].split(',').map(item => item.trim()).filter(item => item.length > 0)
        : [],
      allergies: foodPreferences.allergies[0] 
        ? foodPreferences.allergies[0].split(',').map(item => item.trim()).filter(item => item.length > 0)
        : []
    };

    // Salvar preferências alimentares
    await saveFoodPreferences(processedPreferences);
    
    // Preparar solicitação
    const request: NutritionRequest = {
      goals,
      mealTypes,
      complexityLevel,
      preferences: processedPreferences,
      daysCount,
      waterReminder
    };
    
    // Mudar para o estado de geração
    setStep('generating');
    
    try {
      // Gerar plano
      const plan = await generateNutritionPlan(request);
      setGeneratedPlan(plan);
      setStep('review');
    } catch (error: any) {
      toast.error(`Erro ao gerar plano: ${error.message}`);
      setStep('form');
    }
  };
  
  // Salvar plano
  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    
    setSavingPlan(true);
    
    try {
      // Salvar plano
      const savedPlan = await saveNutritionPlan(generatedPlan);
      
      if (savedPlan) {
        onPlanCreated(savedPlan);
      } else {
        toast.error("Erro ao salvar plano nutricional");
        onPlanCreated(null);
      }
    } catch (error: any) {
      toast.error(`Erro ao salvar plano: ${error.message}`);
      onPlanCreated(null);
    } finally {
      setSavingPlan(false);
    }
  };
  
  // Renderizar formulário
  const renderForm = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Criar Plano Nutricional</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para gerar um plano nutricional personalizado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Objetivos */}
          <div className="space-y-3">
            <Label>Objetivos (selecione um ou mais)</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableGoals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`goal-${goal.id}`} 
                    checked={goals.includes(goal.id)}
                    onCheckedChange={(checked) => handleGoalChange(goal.id, checked === true)}
                  />
                  <Label htmlFor={`goal-${goal.id}`} className="text-sm font-normal cursor-pointer">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tipos de Refeição */}
          <div className="space-y-3">
            <Label>Tipos de Refeição (selecione um ou mais)</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableMealTypes.map((mealType) => (
                <div key={mealType.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`meal-${mealType.id}`} 
                    checked={mealTypes.includes(mealType.id as MealType)}
                    onCheckedChange={(checked) => 
                      handleMealTypeChange(mealType.id as MealType, checked === true)
                    }
                  />
                  <Label htmlFor={`meal-${mealType.id}`} className="text-sm font-normal cursor-pointer">
                    {mealType.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Nível de Complexidade */}
          <div className="space-y-3">
            <Label htmlFor="complexity">Nível de Complexidade</Label>
            <Select 
              value={complexityLevel} 
              onValueChange={(value) => setComplexityLevel(value as ComplexityLevel)}
            >
              <SelectTrigger id="complexity">
                <SelectValue placeholder="Selecione o nível de complexidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simples">Simples (receitas rápidas e práticas)</SelectItem>
                <SelectItem value="intermediario">Intermediário (equilíbrio entre praticidade e variedade)</SelectItem>
                <SelectItem value="avancado">Avançado (receitas elaboradas e variadas)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Duração do Plano */}
          <div className="space-y-3">
            <Label htmlFor="days">Duração do Plano (dias)</Label>
            <Select 
              value={daysCount.toString()} 
              onValueChange={(value) => setDaysCount(parseInt(value))}
            >
              <SelectTrigger id="days">
                <SelectValue placeholder="Selecione a duração do plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 dia</SelectItem>
                <SelectItem value="3">3 dias</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          {/* Preferências Alimentares */}
          <div className="space-y-3">
            <Label>Preferências Alimentares</Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="favorites" className="text-sm text-muted-foreground">
                  Alimentos favoritos (separados por vírgula)
                </Label>
                <Textarea 
                  id="favorites" 
                  placeholder="Ex: frango grelhado, arroz integral, batata doce assada, brócolis no vapor" 
                  value={foodPreferences.favorites[0] || ''}
                  onChange={(e) => handleFoodPreferenceChange('favorites', e.target.value)}
                  className="mt-1"
                  rows={3}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              
              <div>
                <Label htmlFor="avoid" className="text-sm text-muted-foreground">
                  Alimentos a evitar (separados por vírgula)
                </Label>
                <Textarea 
                  id="avoid" 
                  placeholder="Ex: fast food, refrigerante, doces industrializados, frituras em geral" 
                  value={foodPreferences.avoid[0] || ''}
                  onChange={(e) => handleFoodPreferenceChange('avoid', e.target.value)}
                  className="mt-1"
                  rows={3}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              
              <div>
                <Label htmlFor="allergies" className="text-sm text-muted-foreground">
                  Alergias alimentares (separados por vírgula)
                </Label>
                <Textarea 
                  id="allergies" 
                  placeholder="Ex: glúten, lactose, amendoim, frutos do mar, ovos" 
                  value={foodPreferences.allergies[0] || ''}
                  onChange={(e) => handleFoodPreferenceChange('allergies', e.target.value)}
                  className="mt-1"
                  rows={2}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          
          {/* Hidratação */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="water-reminder" 
              checked={waterReminder}
              onCheckedChange={(checked) => setWaterReminder(checked === true)}
            />
            <Label htmlFor="water-reminder" className="text-sm font-normal cursor-pointer">
              Incluir recomendações de hidratação
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGeneratePlan}>
            Gerar Plano
          </Button>
        </DialogFooter>
      </>
    );
  };
  
  // Renderizar estado de geração
  const renderGenerating = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium mb-2">Gerando seu plano nutricional...</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Estamos criando um plano personalizado baseado no seu perfil e preferências.
          Isso pode levar alguns instantes.
        </p>
      </div>
    );
  };
  
  // Renderizar revisão do plano
  const renderReview = () => {
    if (!generatedPlan) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Erro ao gerar plano</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {generationError || "Ocorreu um erro ao gerar o plano nutricional. Por favor, tente novamente."}
          </p>
          <Button variant="outline" onClick={() => setStep('form')} className="mt-4">
            Voltar
          </Button>
        </div>
      );
    }
    
    return (
      <>
        <DialogHeader>
          <DialogTitle>Revisar Plano Nutricional</DialogTitle>
          <DialogDescription>
            Revise seu plano nutricional personalizado antes de salvar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h3 className="font-medium">Título</h3>
            <p className="text-sm">{generatedPlan.title}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Descrição</h3>
            <p className="text-sm">{generatedPlan.description}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Objetivos</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {generatedPlan.goals.map((goal, index) => (
                <Badge key={index} variant="secondary">{goal}</Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Conselhos Nutricionais</h3>
            <p className="text-sm">{generatedPlan.nutritional_advice}</p>
          </div>
          
          {generatedPlan.hydration_tips && (
            <div>
              <h3 className="font-medium">Dicas de Hidratação</h3>
              <p className="text-sm">{generatedPlan.hydration_tips}</p>
            </div>
          )}
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-2">Dias do Plano</h3>
            <div className="space-y-4">
              {generatedPlan.days.map((day, dayIndex) => (
                <div key={dayIndex} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{day.day_of_week}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {day.total_calories} kcal
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        {day.water_intake}ml
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-xs flex gap-3 mb-3">
                    <span>P: {day.total_protein}g</span>
                    <span>C: {day.total_carbs}g</span>
                    <span>G: {day.total_fat}g</span>
                  </div>
                  
                  <div className="space-y-3">
                    {day.meals.map((meal, mealIndex) => (
                      <div key={mealIndex} className="pl-2 border-l-2 border-primary/30">
                        <h5 className="text-sm font-medium">
                          {meal.title} ({meal.time})
                        </h5>
                        <div className="text-xs text-muted-foreground mb-1">
                          {meal.total_calories} kcal | P: {meal.total_protein}g | 
                          C: {meal.total_carbs}g | G: {meal.total_fat}g
                        </div>
                        <ul className="text-xs space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <li key={foodIndex}>
                              {food.name} ({food.portion}) - {food.calories} kcal
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setStep('form')}>
            Voltar e Editar
          </Button>
          <Button onClick={handleSavePlan} disabled={savingPlan}>
            {savingPlan ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Plano'
            )}
          </Button>
        </DialogFooter>
      </>
    );
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {step === 'form' && renderForm()}
        {step === 'generating' && renderGenerating()}
        {step === 'review' && renderReview()}
      </DialogContent>
    </Dialog>
  );
}
