import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExerciseDatabase } from "@/hooks/useExerciseDatabase";
import { 
  Dumbbell, 
  Search, 
  Filter, 
  Play, 
  Image, 
  Target, 
  Clock, 
  Users,
  TrendingUp,
  ExternalLink
} from "lucide-react";

export default function ExerciseLibrary() {
  const { 
    exerciseDatabase, 
    searchExercises, 
    stats, 
    searchTerm, 
    setSearchTerm,
    getExercisesByCategory,
    getExercisesByMuscleGroup 
  } = useExerciseDatabase();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');

  const categories = ['all', 'strength', 'cardio', 'flexibility', 'sports_specific'];
  const muscleGroups = ['all', 'pernas', 'braços', 'core', 'peito', 'costas', 'ombros', 'glúteos'];

  const filteredExercises = searchExercises.filter(exercise => {
    const categoryMatch = selectedCategory === 'all' || exercise.category === selectedCategory;
    const muscleMatch = selectedMuscleGroup === 'all' || 
      exercise.muscle_groups.some(mg => mg.toLowerCase().includes(selectedMuscleGroup.toLowerCase()));
    
    return categoryMatch && muscleMatch;
  });

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'strength': 'Força',
      'cardio': 'Cardio',
      'flexibility': 'Flexibilidade',
      'sports_specific': 'Futebol'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'strength': 'bg-[#FFD700] text-white border border-[#FFD700]',
      'cardio': 'bg-[#FFD700] text-white border border-[#FFD700]',
      'flexibility': 'bg-[#FFD700] text-white border border-[#FFD700]',
      'sports_specific': 'bg-[#FFD700] text-white border border-[#FFD700]'
    };
    return colors[category] || 'bg-[#FFD700] text-white border border-[#FFD700]';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-[#FFD700] text-white border border-[#FFD700]',
      'intermediate': 'bg-[#FFD700] text-white border border-[#FFD700]',
      'advanced': 'bg-[#FFD700] text-white border border-[#FFD700]'
    };
    return colors[difficulty] || 'bg-[#FFD700] text-white border border-[#FFD700]';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: { [key: string]: string } = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
    };
    return labels[difficulty] || difficulty;
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
          <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-[#FFD700]/10 rounded-full">
              <Dumbbell className="h-8 w-8 text-[#FFD700]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Biblioteca de Exercícios</h1>
              <p className="text-white">Explore nossa base de exercícios com vídeos e imagens</p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-black border-[#FFD700]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-6 w-6 text-[#FFD700]" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalExercises}</p>
                  <p className="text-sm text-white">Exercícios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border-[#FFD700]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-[#FFD700]" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.categories}</p>
                  <p className="text-sm text-white">Categorias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border-[#FFD700]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-6 w-6 text-[#FFD700]" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.exercisesWithVideos}</p>
                  <p className="text-sm text-white">Com Vídeos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border-[#FFD700]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Image className="h-6 w-6 text-[#FFD700]" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.exercisesWithImages}</p>
                  <p className="text-sm text-white">Com Imagens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-black border-[#FFD700]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="h-5 w-5 text-[#FFD700]" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FFD700]" />
                  <Input
                    placeholder="Buscar exercícios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black border-[#FFD700] text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-black border-[#FFD700] text-white">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[#FFD700]">
                  <SelectItem value="all" className="text-white">Todas</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category} className="text-white">
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger className="w-40 bg-black border-[#FFD700] text-white">
                  <SelectValue placeholder="Grupo Muscular" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[#FFD700]">
                  <SelectItem value="all" className="text-white">Todos</SelectItem>
                  {muscleGroups.slice(1).map(group => (
                    <SelectItem key={group} value={group} className="text-white">
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Exercícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise, index) => (
            <Card key={index} className="hover-scale transition-all hover:shadow-lg bg-black border-[#FFD700]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-white">{exercise.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={getCategoryColor(exercise.category)}>
                      {getCategoryLabel(exercise.category)}
                    </Badge>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Imagem */}
                {exercise.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={exercise.image_url} 
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Descrição */}
                <p className="text-sm text-white line-clamp-3">
                  {exercise.description}
                </p>

                {/* Grupos Musculares */}
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.map((group, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-[#FFD700] text-white bg-[#FFD700]/10">
                      {group}
                    </Badge>
                  ))}
                </div>

                {/* Benefícios */}
                <div className="p-3 bg-[#FFD700]/20 rounded-lg border border-[#FFD700]">
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-1 text-white">
                    <TrendingUp className="h-3 w-3" />
                    Benefícios:
                  </h4>
                  <p className="text-xs text-white line-clamp-2">
                    {exercise.benefits}
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  {exercise.video_url && (
                    <Button size="sm" variant="outline" asChild className="flex-1 border-[#FFD700] text-white hover:bg-[#FFD700] hover:text-black">
                      <a href={exercise.video_url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-3 w-3 mr-1" />
                        Vídeo
                      </a>
                    </Button>
                  )}
                  {exercise.image_url && (
                    <Button size="sm" variant="outline" asChild className="flex-1 border-[#FFD700] text-white hover:bg-[#FFD700] hover:text-black">
                      <a href={exercise.image_url} target="_blank" rel="noopener noreferrer">
                        <Image className="h-3 w-3 mr-1" />
                        Imagem
                      </a>
                    </Button>
                  )}
                </div>

                {/* Aliases */}
                {exercise.aliases.length > 1 && (
                  <div className="text-xs text-white">
                    <span className="font-medium text-white">Também conhecido como:</span> {exercise.aliases.slice(1).join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="h-16 w-16 text-[#FFD700] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Nenhum exercício encontrado</h3>
            <p className="text-white">
              Tente ajustar os filtros ou termo de busca
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
