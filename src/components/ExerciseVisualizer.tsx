import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Info,
  Dumbbell,
  Clock,
  Target
} from "lucide-react";

interface ExerciseVisualizerProps {
  exercise: {
    name: string;
    description: string;
    benefits: string;
    sets?: number;
    reps?: string;
    duration?: string;
    difficulty?: string;
    muscle_groups?: string[];
    video_url?: string;
    image_url?: string;
  };
  onClose: () => void;
}

// Base de dados de GIFs animados para exercícios comuns
const exerciseGifs: { [key: string]: string } = {
  "Agachamento": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Flexão de Braço": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Prancha": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Afundo": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Burpee": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Escalador": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Levantamento Terra": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Barra Fixa": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Corrida em Zigue-Zague": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Exercícios com Cones": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Agachamento com Salto": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Saltos Laterais": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Joelhos Altos": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Calcanhares no Glúteo": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Salto na Caixa": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Peso Morto em Uma Perna": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Giros Russos": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "Prancha Dinâmica": "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
};

// GIFs alternativos de exercícios
const alternativeGifs = [
  "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/3o6Zt4HUhL1H0U2pB6/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
];

export default function ExerciseVisualizer({ exercise, onClose }: ExerciseVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGif, setCurrentGif] = useState(0);
  
  // Obter GIF para o exercício
  const getExerciseGif = () => {
    const gif = exerciseGifs[exercise.name];
    if (gif) return gif;
    
    // Se não encontrar, usar GIF alternativo baseado no índice
    return alternativeGifs[currentGif % alternativeGifs.length];
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetGif = () => {
    setCurrentGif(prev => prev + 1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-500 text-white';
      case 'intermediate': return 'bg-yellow-500 text-white';
      case 'advanced': return 'bg-red-500 text-white';
      default: return 'bg-orange-500 text-white';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'Intermediário';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-orange-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-orange-500 flex items-center gap-2">
              <Dumbbell className="h-6 w-6" />
              {exercise.name}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Visualização do Exercício */}
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-orange-500">
              {exercise.video_url ? (
                <iframe
                  src={exercise.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title={exercise.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={getExerciseGif()}
                    alt={exercise.name}
                    className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse' : ''}`}
                  />
                </div>
              )}
            </div>
            
            {/* Controles */}
            {!exercise.video_url && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={togglePlay}
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetGif}
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Informações do Exercício */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercise.sets && (
              <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Dumbbell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-orange-300">Séries</p>
                  <p className="text-lg font-bold text-orange-200">{exercise.sets}</p>
                </div>
              </div>
            )}
            
            {exercise.reps && (
              <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-orange-300">Repetições</p>
                  <p className="text-lg font-bold text-orange-200">{exercise.reps}</p>
                </div>
              </div>
            )}
            
            {exercise.duration && (
              <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-orange-300">Duração</p>
                  <p className="text-lg font-bold text-orange-200">{exercise.duration}</p>
                </div>
              </div>
            )}
          </div>

          {/* Dificuldade e Grupos Musculares */}
          <div className="flex flex-wrap gap-2">
            {exercise.difficulty && (
              <Badge className={getDifficultyColor(exercise.difficulty)}>
                {getDifficultyLabel(exercise.difficulty)}
              </Badge>
            )}
            
            {exercise.muscle_groups?.map((group, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="border-orange-400 text-orange-300 bg-orange-500/10"
              >
                {group}
              </Badge>
            ))}
          </div>

          {/* Descrição */}
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <h3 className="text-lg font-semibold mb-2 text-orange-200 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Como executar:
            </h3>
            <p className="text-orange-100 leading-relaxed">
              {exercise.description}
            </p>
          </div>

          {/* Benefícios */}
          <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-400">
            <h3 className="text-lg font-semibold mb-2 text-orange-200">
              Benefícios:
            </h3>
            <p className="text-orange-100 leading-relaxed">
              {exercise.benefits}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-black"
              onClick={() => {
                // Aqui você pode implementar lógica para iniciar o exercício
                console.log('Iniciar exercício:', exercise.name);
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Exercício
            </Button>
            
            <Button 
              variant="outline"
              onClick={onClose}
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
