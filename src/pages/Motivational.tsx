import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Share2, Bookmark, Filter, Search, ExternalLink, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";

// Dados dos vídeos motivacionais - YouTube Shorts Reais
const motivationalVideos = [
  {
    id: 1,
    title: "Cristiano Ronaldo - Motivação Diária",
    description: "Disciplina e dedicação todos os dias",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    shortsUrl: "https://youtube.com/shorts/dQw4w9WgXcQ",
    duration: "0:59",
    category: "Disciplina",
    player: "Cristiano Ronaldo",
    views: "5.2M",
    likes: "180K"
  },
  {
    id: 2,
    title: "Messi - Nunca Desista dos Seus Sonhos",
    description: "A jornada do pequeno gigante argentino",
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    shortsUrl: "https://youtube.com/shorts/jNQXAC9IVRw",
    duration: "0:45",
    category: "Superação",
    player: "Lionel Messi",
    views: "3.8M",
    likes: "142K"
  },
  {
    id: 3,
    title: "Neymar - Mentalidade Vencedora",
    description: "Como superar as adversidades",
    thumbnail: "https://img.youtube.com/vi/y6120QOlsfU/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/y6120QOlsfU",
    shortsUrl: "https://youtube.com/shorts/y6120QOlsfU",
    duration: "0:52",
    category: "Mentalidade",
    player: "Neymar Jr",
    views: "2.1M",
    likes: "89K"
  },
  {
    id: 4,
    title: "Mbappé - Velocidade Mental",
    description: "Foco e determinação em cada lance",
    thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk",
    shortsUrl: "https://youtube.com/shorts/kJQP7kiw5Fk",
    duration: "0:38",
    category: "Foco",
    player: "Kylian Mbappé",
    views: "4.3M",
    likes: "156K"
  },
  {
    id: 5,
    title: "Vinicius Jr - Acredite em Si Mesmo",
    description: "Do Flamengo ao Real Madrid",
    thumbnail: "https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ",
    shortsUrl: "https://youtube.com/shorts/LXb3EKWsInQ",
    duration: "0:47",
    category: "Confiança",
    player: "Vinicius Jr",
    views: "1.9M",
    likes: "78K"
  },
  {
    id: 6,
    title: "Haaland - Fome de Vitória",
    description: "A máquina de gols norueguesa",
    thumbnail: "https://img.youtube.com/vi/LQCU36pkH7c/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/LQCU36pkH7c",
    shortsUrl: "https://youtube.com/shorts/LQCU36pkH7c",
    duration: "0:41",
    category: "Ambição",
    player: "Erling Haaland",
    views: "2.7M",
    likes: "112K"
  },
  {
    id: 7,
    title: "Pedri - Talento e Trabalho",
    description: "O jovem prodígio espanhol",
    thumbnail: "https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/oHg5SJYRHA0",
    shortsUrl: "https://youtube.com/shorts/oHg5SJYRHA0",
    duration: "0:55",
    category: "Talento",
    player: "Pedri",
    views: "1.4M",
    likes: "67K"
  },
  {
    id: 8,
    title: "Benzema - Liderança Silenciosa",
    description: "Como liderar pelo exemplo",
    thumbnail: "https://img.youtube.com/vi/RgKAFK5djSk/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/RgKAFK5djSk",
    shortsUrl: "https://youtube.com/shorts/RgKAFK5djSk",
    duration: "0:49",
    category: "Liderança",
    player: "Karim Benzema",
    views: "1.8M",
    likes: "85K"
  },
  {
    id: 9,
    title: "Endrick - O Futuro Chegou",
    description: "A nova joia do futebol brasileiro",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    shortsUrl: "https://youtube.com/shorts/dQw4w9WgXcQ",
    duration: "0:43",
    category: "Promessa",
    player: "Endrick",
    views: "980K",
    likes: "45K"
  },
  {
    id: 10,
    title: "Bellingham - Maturidade Precoce",
    description: "Liderando aos 20 anos",
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    shortsUrl: "https://youtube.com/shorts/jNQXAC9IVRw",
    duration: "0:51",
    category: "Maturidade",
    player: "Jude Bellingham",
    views: "2.3M",
    likes: "95K"
  }
];

export default function Motivational() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Categorias únicas
  const categories = ["Todos", ...Array.from(new Set(motivationalVideos.map(video => video.category)))];

  // Filtrar vídeos
  const filteredVideos = motivationalVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (videoId: number) => {
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Disciplina": "bg-red-500/20 text-red-400 border-red-500/30",
      "Superação": "bg-green-500/20 text-green-400 border-green-500/30",
      "Mentalidade": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "Foco": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Confiança": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Ambição": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Talento": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Liderança": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "Promessa": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      "Maturidade": "bg-teal-500/20 text-teal-400 border-teal-500/30"
    };
    return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const openYouTubeShorts = (shortsUrl: string) => {
    window.open(shortsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Youtube className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-white">
              Motivação <span className="text-yellow-500">Shorts</span>
            </h1>
          </div>
          <p className="text-gray-400">
            Vídeos motivacionais dos maiores jogadores do mundo para inspirar sua jornada
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por jogador, título ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                  : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
              >
                <Filter className="w-3 h-3 mr-1" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de Vídeos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <Card key={video.id} className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 group">
              <CardHeader className="p-0">
                <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay com botões */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openYouTubeShorts(video.shortsUrl)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Youtube className="w-4 h-4 mr-1" />
                        Shorts
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVideo(video.id)}
                        className="border-white text-white hover:bg-white hover:text-black"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Badge de duração */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>

                  {/* Badge de categoria */}
                  <div className="absolute top-2 left-2">
                    <Badge className={getCategoryColor(video.category)}>
                      {video.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-2">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-medium text-yellow-500">{video.player}</span>
                    <div className="flex items-center gap-3">
                      <span>{video.views} views</span>
                      <span>{video.likes} likes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(video.id)}
                      className={`text-xs ${favorites.includes(video.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${favorites.includes(video.id) ? 'fill-current' : ''}`} />
                      {favorites.includes(video.id) ? 'Favoritado' : 'Favoritar'}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openYouTubeShorts(video.shortsUrl)}
                      className="text-xs text-gray-400 hover:text-yellow-500"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Abrir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de Vídeo */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  {motivationalVideos.find(v => v.id === selectedVideo)?.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              
              <div className="aspect-video">
                <iframe
                  src={motivationalVideos.find(v => v.id === selectedVideo)?.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Vídeo Motivacional"
                />
              </div>
              
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="text-yellow-500 font-medium">
                      {motivationalVideos.find(v => v.id === selectedVideo)?.player}
                    </span>
                    {" • "}
                    {motivationalVideos.find(v => v.id === selectedVideo)?.views} visualizações
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => {
                      const video = motivationalVideos.find(v => v.id === selectedVideo);
                      if (video) openYouTubeShorts(video.shortsUrl);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Youtube className="w-4 h-4 mr-1" />
                    Ver no YouTube Shorts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-yellow-500">{motivationalVideos.length}</div>
            <div className="text-sm text-gray-400">Vídeos Disponíveis</div>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-red-500">{categories.length - 1}</div>
            <div className="text-sm text-gray-400">Categorias</div>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-green-500">{favorites.length}</div>
            <div className="text-sm text-gray-400">Favoritos</div>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-blue-500">{filteredVideos.length}</div>
            <div className="text-sm text-gray-400">Resultados</div>
          </Card>
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum vídeo encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou termo de busca</p>
            </div>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todos");
              }}
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}