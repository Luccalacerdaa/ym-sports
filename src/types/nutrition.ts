// Tipos de refeição
export type MealType = 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar' | 'pre_treino' | 'pos_treino';

// Nível de complexidade
export type ComplexityLevel = 'simples' | 'intermediario' | 'avancado';

// Preferências alimentares
export interface FoodPreference {
  avoid: string[];        // Alimentos a evitar
  favorites: string[];    // Alimentos preferidos
  allergies: string[];    // Alergias alimentares
}

// Solicitação de plano nutricional
export interface NutritionRequest {
  goals: string[];                // Objetivos (ganho de massa, perda de peso, etc.)
  mealTypes: MealType[];          // Tipos de refeição desejados
  complexityLevel: ComplexityLevel; // Nível de complexidade das receitas
  preferences: FoodPreference;    // Preferências alimentares
  daysCount: number;              // Número de dias do plano
  waterReminder: boolean;         // Incluir lembretes de hidratação
}

// Alimento individual
export interface FoodItem {
  id?: string;                    // ID do alimento
  meal_id?: string;               // ID da refeição
  name: string;                   // Nome do alimento
  portion: string;                // Porção (ex: "100g", "1 unidade")
  calories: number;               // Calorias
  protein: number;                // Proteínas (g)
  carbs: number;                  // Carboidratos (g)
  fat: number;                    // Gorduras (g)
  preparation?: string;           // Modo de preparo (opcional)
  alternatives?: string[];        // Alternativas para substituição
  image_url?: string;             // URL da imagem do alimento
  selected?: boolean;             // Selecionado pelo usuário
}

// Refeição completa
export interface Meal {
  id?: string;                    // ID da refeição
  day_id?: string;                // ID do dia
  type: MealType;                 // Tipo de refeição
  title: string;                  // Título da refeição
  time: string;                   // Horário recomendado
  foods: FoodItem[];              // Alimentos da refeição
  total_calories: number;         // Total de calorias
  total_protein: number;          // Total de proteínas
  total_carbs: number;            // Total de carboidratos
  total_fat: number;              // Total de gorduras
  notes: string;                  // Observações
  preparation_time: string;       // Tempo de preparo
}

// Plano diário
export interface DailyPlan {
  id?: string;                    // ID do dia
  plan_id?: string;               // ID do plano
  day_of_week: string;            // Dia da semana
  meals: Meal[];                  // Refeições do dia
  water_intake: number;           // Consumo recomendado de água (ml)
  total_calories: number;         // Total de calorias do dia
  total_protein: number;          // Total de proteínas do dia
  total_carbs: number;            // Total de carboidratos do dia
  total_fat: number;              // Total de gorduras do dia
}

// Plano nutricional completo
export interface NutritionPlan {
  id?: string;                    // ID do plano
  user_id?: string;               // ID do usuário
  title: string;                  // Título do plano
  description: string;            // Descrição do plano
  goals: string[];                // Objetivos do plano
  days: DailyPlan[];              // Planos diários
  complexity_level: ComplexityLevel; // Nível de complexidade
  created_at?: string;            // Data de criação
  nutritional_advice: string;     // Conselhos nutricionais gerais
  hydration_tips: string;         // Dicas de hidratação
}

// Registro de hidratação
export interface WaterIntakeLog {
  id?: string;                    // ID do registro
  user_id?: string;               // ID do usuário
  date: string;                   // Data do registro
  amount: number;                 // Quantidade de água (ml)
  created_at?: string;            // Data de criação do registro
}

// Conquista nutricional
export interface NutritionAchievement {
  id: string;                     // ID da conquista
  title: string;                  // Título da conquista
  description: string;            // Descrição da conquista
  icon: string;                   // Ícone da conquista
  points: number;                 // Pontos concedidos
  requirement: string;            // Requisito para conquistar
  achieved?: boolean;             // Se foi conquistada pelo usuário
  achieved_at?: string;           // Data da conquista
}

// Lista de conquistas nutricionais disponíveis
export const NUTRITION_ACHIEVEMENTS: NutritionAchievement[] = [
  {
    id: 'nutrition_beginner',
    title: 'Iniciante Nutricional',
    description: 'Criar seu primeiro plano alimentar',
    icon: 'Utensils',
    points: 10,
    requirement: 'Criar um plano nutricional'
  },
  {
    id: 'hydration_aware',
    title: 'Hidratação Consciente',
    description: 'Registrar consumo de água por 7 dias consecutivos',
    icon: 'Droplet',
    points: 20,
    requirement: 'Registrar água por 7 dias consecutivos'
  },
  {
    id: 'meal_planner',
    title: 'Planejador',
    description: 'Criar um plano nutricional para 7 dias',
    icon: 'Calendar',
    points: 25,
    requirement: 'Criar plano para 7 dias'
  },
  {
    id: 'culinary_master',
    title: 'Mestre Culinário',
    description: 'Experimentar 10 receitas diferentes',
    icon: 'ChefHat',
    points: 30,
    requirement: 'Marcar 10 receitas como experimentadas'
  },
  {
    id: 'nutrition_consistent',
    title: 'Consistência Alimentar',
    description: 'Seguir o plano nutricional por 7 dias consecutivos',
    icon: 'CheckSquare',
    points: 40,
    requirement: 'Seguir plano por 7 dias'
  },
  {
    id: 'perfect_hydration',
    title: 'Hidratação Perfeita',
    description: 'Atingir a meta de água por 14 dias consecutivos',
    icon: 'Award',
    points: 50,
    requirement: 'Atingir meta de água por 14 dias'
  },
  {
    id: 'balanced_nutrition',
    title: 'Nutrição Balanceada',
    description: 'Manter equilíbrio de macronutrientes por 10 dias',
    icon: 'BarChart2',
    points: 60,
    requirement: 'Manter macros balanceados por 10 dias'
  },
  {
    id: 'amateur_nutritionist',
    title: 'Nutricionista Amador',
    description: 'Criar e seguir 5 planos nutricionais diferentes',
    icon: 'BookOpen',
    points: 75,
    requirement: 'Criar e seguir 5 planos diferentes'
  },
  {
    id: 'hydration_master',
    title: 'Mestre da Hidratação',
    description: 'Consumir a quantidade ideal de água por 30 dias',
    icon: 'Zap',
    points: 100,
    requirement: 'Meta de água por 30 dias'
  },
  {
    id: 'nutrition_guru',
    title: 'Guru Nutricional',
    description: 'Completar todas as outras conquistas nutricionais',
    icon: 'Award',
    points: 200,
    requirement: 'Completar todas as outras conquistas'
  }
];
