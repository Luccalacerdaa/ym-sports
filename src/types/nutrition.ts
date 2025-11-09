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
    id: 'meal_planner_7days',
    title: 'Planejador Semanal',
    description: 'Criar um plano nutricional para 7 dias',
    icon: 'Calendar',
    points: 25,
    requirement: 'Criar plano para 7 dias'
  },
  {
    id: 'nutrition_explorer',
    title: 'Explorador Nutricional',
    description: 'Criar 3 planos nutricionais diferentes',
    icon: 'Compass',
    points: 30,
    requirement: 'Criar 3 planos diferentes'
  },
  {
    id: 'hydration_starter',
    title: 'Hidratação Iniciante',
    description: 'Registrar consumo de água pela primeira vez',
    icon: 'Droplet',
    points: 15,
    requirement: 'Registrar água uma vez'
  },
  {
    id: 'hydration_consistent',
    title: 'Hidratação Consistente',
    description: 'Registrar consumo de água por 3 dias',
    icon: 'Droplets',
    points: 20,
    requirement: 'Registrar água por 3 dias'
  },
  {
    id: 'nutrition_variety',
    title: 'Variedade Alimentar',
    description: 'Criar planos com diferentes níveis de complexidade',
    icon: 'Shuffle',
    points: 35,
    requirement: 'Criar planos básico, intermediário e avançado'
  },
  {
    id: 'goal_oriented',
    title: 'Focado em Objetivos',
    description: 'Criar planos para diferentes objetivos',
    icon: 'Target',
    points: 40,
    requirement: 'Criar planos com 3 objetivos diferentes'
  },
  {
    id: 'nutrition_dedicated',
    title: 'Dedicado à Nutrição',
    description: 'Criar 5 planos nutricionais',
    icon: 'BookOpen',
    points: 50,
    requirement: 'Criar 5 planos nutricionais'
  },
  {
    id: 'hydration_master',
    title: 'Mestre da Hidratação',
    description: 'Registrar consumo de água por 7 dias',
    icon: 'Zap',
    points: 60,
    requirement: 'Registrar água por 7 dias'
  },
  {
    id: 'nutrition_guru',
    title: 'Guru Nutricional',
    description: 'Completar todas as outras conquistas nutricionais',
    icon: 'Award',
    points: 100,
    requirement: 'Completar todas as outras conquistas'
  }
];
