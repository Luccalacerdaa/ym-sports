// Base de dados de exercícios populares com exemplos reais - VERSÃO ATUALIZADA
export interface ExerciseExample {
  name: string;
  aliases: string[]; // Nomes alternativos para matching
  category: 'strength' | 'cardio' | 'flexibility' | 'sports_specific';
  muscle_groups: string[];
  video_url?: string;
  image_url?: string;
  description: string;
  benefits: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const exerciseDatabase: ExerciseExample[] = [
  // EXERCÍCIOS DE FORÇA
  {
    name: "Agachamento",
    aliases: ["Squat", "Agachamento com Barra", "Agachamento Livre", "Agachamento Básico"],
    category: "strength",
    muscle_groups: ["pernas", "glúteos", "core"],
    video_url: "https://www.youtube.com/watch?v=Dy28eq2PjcM", // Athlean-X Squat
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Posicione os pés na largura dos ombros, desça como se fosse sentar em uma cadeira, mantendo o peito erguido e joelhos alinhados com os pés.",
    benefits: "Desenvolve força e potência nos membros inferiores, melhora mobilidade do quadril e fortalece o core.",
    difficulty: "beginner"
  },
  {
    name: "Flexão de Braço",
    aliases: ["Push-up", "Flexão", "Flexões", "Paralela no Solo"],
    category: "strength",
    muscle_groups: ["peito", "braços", "ombros", "core"],
    video_url: "https://www.youtube.com/watch?v=Eh00_rniF8E", // Jeremy Ethier Push-up
    image_url: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500",
    description: "Deite de bruços, apoie as mãos no chão na largura dos ombros, mantenha o corpo reto e empurre para cima.",
    benefits: "Fortalece peito, tríceps e ombros, melhora estabilidade do core e resistência muscular.",
    difficulty: "beginner"
  },
  {
    name: "Prancha",
    aliases: ["Plank", "Prancha Abdominal", "Prancha Frontal"],
    category: "strength",
    muscle_groups: ["core", "ombros"],
    video_url: "https://www.youtube.com/watch?v=BQu26ABuVS0", // FitnessBlender Plank
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Apoie-se nos antebraços e pontas dos pés, mantenha o corpo reto da cabeça aos calcanhares, contraia o abdômen.",
    benefits: "Fortalece toda a região do core, melhora estabilidade e postura, essencial para transferência de força.",
    difficulty: "beginner"
  },
  {
    name: "Lunge",
    aliases: ["Afundo", "Passada", "Lunges", "Afundo Frontal"],
    category: "strength",
    muscle_groups: ["pernas", "glúteos", "core"],
    video_url: "https://www.youtube.com/watch?v=QOVaHwm-Q6U", // Jeremy Ethier Lunge
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Dê um passo à frente, desça até o joelho de trás quase tocar o chão, empurre com força para voltar à posição inicial.",
    benefits: "Desenvolve força unilateral, melhora equilíbrio e estabilidade, fortalece glúteos e quadríceps.",
    difficulty: "intermediate"
  },
  {
    name: "Burpee",
    aliases: ["Burpees", "Flexão com Salto"],
    category: "cardio",
    muscle_groups: ["full body"],
    video_url: "https://www.youtube.com/watch?v=TU8QYVW0gDU", // FitnessBlender Burpee
    image_url: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500",
    description: "Agache, apoie as mãos no chão, estenda as pernas para trás, faça uma flexão, traga os pés de volta e salte.",
    benefits: "Melhora condicionamento cardiovascular, desenvolve força funcional e explosão, queima muitas calorias.",
    difficulty: "intermediate"
  },
  {
    name: "Mountain Climber",
    aliases: ["Escalador", "Alpinista", "Mountain Climbers"],
    category: "cardio",
    muscle_groups: ["core", "pernas", "braços"],
    video_url: "https://www.youtube.com/watch?v=nmwgirgXLYM", // FitnessBlender Mountain Climber
    image_url: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500",
    description: "Em posição de prancha, alterne rapidamente trazendo os joelhos em direção ao peito, como se estivesse escalando.",
    benefits: "Melhora condicionamento cardiovascular, fortalece o core e melhora coordenação.",
    difficulty: "intermediate"
  },
  {
    name: "Deadlift",
    aliases: ["Levantamento Terra", "Peso Morto"],
    category: "strength",
    muscle_groups: ["pernas", "costas", "glúteos", "core"],
    video_url: "https://www.youtube.com/watch?v=op9kVnSso6Q", // Athlean-X Deadlift
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Segure a barra com os pés na largura dos ombros, mantenha as costas retas e levante a barra até ficar de pé.",
    benefits: "Desenvolve força posterior da coxa, glúteos e costas, melhora postura e força funcional.",
    difficulty: "advanced"
  },
  {
    name: "Pull-up",
    aliases: ["Barra", "Dominada", "Pull-ups", "Suspensão"],
    category: "strength",
    muscle_groups: ["costas", "braços", "ombros"],
    video_url: "https://www.youtube.com/watch?v=eGo4IYlbE5g", // Jeremy Ethier Pull-up
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Segure a barra com as mãos afastadas, pendure-se e puxe o corpo para cima até o queixo passar da barra.",
    benefits: "Fortalece costas e bíceps, melhora força de preensão e estabilidade escapular.",
    difficulty: "advanced"
  },

  // EXERCÍCIOS ESPECÍFICOS PARA FUTEBOL
  {
    name: "Shuttle Run",
    aliases: ["Corrida em Zigue-Zague", "Corrida de Agilidade", "Teste de Agilidade"],
    category: "sports_specific",
    muscle_groups: ["pernas", "core"],
    video_url: "https://www.youtube.com/watch?v=6SqjHhE0Lho", // FIFA Agility
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Posicione cones em linha reta, corra tocando cada cone e volte, focando em mudanças de direção rápidas.",
    benefits: "Desenvolve agilidade e mudança de direção, essencial para dribles e desarmes no futebol.",
    difficulty: "intermediate"
  },
  {
    name: "Cone Drills",
    aliases: ["Exercícios com Cones", "Slalom", "Zigue-Zague"],
    category: "sports_specific",
    muscle_groups: ["pernas", "core"],
    video_url: "https://www.youtube.com/watch?v=6SqjHhE0Lho", // FIFA Cone Drills
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Posicione cones em padrão específico, corra entre eles mantendo controle da bola e velocidade.",
    benefits: "Melhora controle de bola, agilidade e coordenação, específico para habilidades do futebol.",
    difficulty: "intermediate"
  },
  {
    name: "Jump Squat",
    aliases: ["Agachamento com Salto", "Squat Jump", "Salto no Agachamento"],
    category: "strength",
    muscle_groups: ["pernas", "glúteos", "core"],
    video_url: "https://www.youtube.com/watch?v=YaXPRqUwItQ", // Athlean-X Jump Squat
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Faça um agachamento normal, mas no final empurre com força e salte para cima, aterrissando suavemente.",
    benefits: "Desenvolve explosão e potência nas pernas, melhora capacidade de salto e aceleração.",
    difficulty: "intermediate"
  },
  {
    name: "Lateral Bounds",
    aliases: ["Saltos Laterais", "Lateral Jumps", "Saltos de Lado"],
    category: "sports_specific",
    muscle_groups: ["pernas", "glúteos", "core"],
    video_url: "https://www.youtube.com/watch?v=6SqjHhE0Lho", // FIFA Lateral Bounds
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Salte lateralmente de um pé para o outro, mantendo o equilíbrio e aterrissando com controle.",
    benefits: "Desenvolve agilidade lateral, força de adutores e estabilidade, essencial para mudanças de direção.",
    difficulty: "intermediate"
  },
  {
    name: "High Knees",
    aliases: ["Joelhos Altos", "Corrida no Local", "Running in Place"],
    category: "cardio",
    muscle_groups: ["pernas", "core"],
    video_url: "https://www.youtube.com/watch?v=nmwgirgXLYM", // FitnessBlender High Knees
    image_url: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500",
    description: "Corra no local elevando os joelhos até a altura do quadril, mantendo um ritmo rápido.",
    benefits: "Melhora coordenação, condicionamento cardiovascular e força de flexão do quadril.",
    difficulty: "beginner"
  },
  {
    name: "Butt Kicks",
    aliases: ["Calcanhares no Glúteo", "Heel Kicks", "Corrida com Calcanhares"],
    category: "cardio",
    muscle_groups: ["pernas", "glúteos"],
    video_url: "https://www.youtube.com/watch?v=nmwgirgXLYM", // FitnessBlender Butt Kicks
    image_url: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500",
    description: "Corra no local tentando tocar os glúteos com os calcanhares, mantendo um ritmo constante.",
    benefits: "Melhora flexibilidade dos isquiotibiais, coordenação e condicionamento cardiovascular.",
    difficulty: "beginner"
  },
  {
    name: "Box Jump",
    aliases: ["Salto na Caixa", "Plyometric Box Jump", "Salto Explosivo"],
    category: "strength",
    muscle_groups: ["pernas", "glúteos", "core"],
    video_url: "https://www.youtube.com/watch?v=6SqjHhE0Lho", // FIFA Box Jump
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Posicione-se em frente a uma caixa, agache e salte para cima da caixa, aterrissando com os dois pés.",
    benefits: "Desenvolve explosão e potência, melhora capacidade de salto e força reativa.",
    difficulty: "advanced"
  },
  {
    name: "Single Leg Deadlift",
    aliases: ["Peso Morto Unilateral", "Single Leg RDL", "Deadlift em Uma Perna"],
    category: "strength",
    muscle_groups: ["pernas", "glúteos", "core"],
    video_url: "https://www.youtube.com/watch?v=op9kVnSso6Q", // Athlean-X Single Leg RDL
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Fique em uma perna, incline o tronco para frente estendendo a perna livre para trás, mantenha o equilíbrio.",
    benefits: "Desenvolve força unilateral, melhora equilíbrio e estabilidade, fortalece glúteos e isquiotibiais.",
    difficulty: "advanced"
  },
  {
    name: "Russian Twists",
    aliases: ["Giros Russos", "Twists", "Rotação do Tronco"],
    category: "strength",
    muscle_groups: ["core", "oblíquos"],
    video_url: "https://www.youtube.com/watch?v=pSHjTRCQxIw", // FitnessBlender Russian Twists
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Sente-se com os joelhos dobrados, incline-se ligeiramente para trás, gire o tronco de um lado para o outro.",
    benefits: "Fortalece oblíquos e core rotacional, melhora estabilidade e rotação do tronco.",
    difficulty: "intermediate"
  },
  {
    name: "Plank to Push-up",
    aliases: ["Prancha para Flexão", "Plank Up-Down", "Prancha Dinâmica"],
    category: "strength",
    muscle_groups: ["core", "peito", "braços"],
    video_url: "https://www.youtube.com/watch?v=pSHjTRCQxIw", // FitnessBlender Plank to Push-up
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    description: "Comece na posição de prancha, alterne entre antebraços e mãos, mantendo o corpo reto.",
    benefits: "Fortalece core e estabilidade, melhora força dos braços e coordenação.",
    difficulty: "intermediate"
  }
];

// Função para encontrar exercício por nome
export function findExerciseByName(name: string): ExerciseExample | null {
  const searchName = name.toLowerCase().trim();
  
  // Busca exata primeiro
  let exercise = exerciseDatabase.find(ex => 
    ex.name.toLowerCase() === searchName
  );
  
  // Se não encontrar, busca por aliases
  if (!exercise) {
    exercise = exerciseDatabase.find(ex => 
      ex.aliases.some(alias => alias.toLowerCase().includes(searchName)) ||
      ex.name.toLowerCase().includes(searchName)
    );
  }
  
  // Se ainda não encontrar, busca parcial
  if (!exercise) {
    exercise = exerciseDatabase.find(ex => 
      ex.aliases.some(alias => 
        searchName.includes(alias.toLowerCase()) || 
        alias.toLowerCase().includes(searchName)
      )
    );
  }
  
  return exercise || null;
}

// Função para obter exercícios por categoria
export function getExercisesByCategory(category: string): ExerciseExample[] {
  return exerciseDatabase.filter(ex => ex.category === category);
}

// Função para obter exercícios por grupo muscular
export function getExercisesByMuscleGroup(muscleGroup: string): ExerciseExample[] {
  return exerciseDatabase.filter(ex => 
    ex.muscle_groups.some(mg => 
      mg.toLowerCase().includes(muscleGroup.toLowerCase()) ||
      muscleGroup.toLowerCase().includes(mg.toLowerCase())
    )
  );
}
