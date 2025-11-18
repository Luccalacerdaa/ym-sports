import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Share2, Bookmark, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Dados dos vídeos motivacionais
const motivationalVideos = [
  {
    id: 1,
    title: "Cristiano Ronaldo - Nunca Desista",
    description: "A jornada de superação do maior jogador de todos os tempos",
    thumbnail: "https://img.youtube.com/vi/uelHwf8o7_U/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/uelHwf8o7_U",
    duration: "3:45",
    category: "Superação",
    player: "Cristiano Ronaldo",
    views: "2.1M",
    likes: "85K"
  },
  {
    id: 2,
    title: "Messi - O Poder da Persistência",
    description: "Como a dedicação transformou um garoto em lenda",
    thumbnail: "https://img.youtube.com/vi/gVv3yTJLzlE/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/gVv3yTJLzlE",
    duration: "4:12",
    category: "Inspiração",
    player: "Lionel Messi",
    views: "1.8M",
    likes: "72K"
  },
  {
    id: 3,
    title: "Neymar Jr - Superando as Críticas",
    description: "A mentalidade vencedora diante dos desafios",
    thumbnail: "https://img.youtube.com/vi/QcZKDSk4wP4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/QcZKDSk4wP4",
    duration: "2:58",
    category: "Mentalidade",
    player: "Neymar Jr",
    views: "950K",
    likes: "41K"
  },
  {
    id: 4,
    title: "Mbappé - Velocidade e Determinação",
    description: "O futuro do futebol mundial em ação",
    thumbnail: "https://img.youtube.com/vi/Nt9L1jCKGnE/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/Nt9L1jCKGnE",
    duration: "3:21",
    category: "Talento",
    player: "Kylian Mbappé",
    views: "1.2M",
    likes: "58K"
  },
  {
    id: 5,
    title: "Ronaldinho - A Magia do Futebol",
    description: "Quando o talento encontra a paixão",
    thumbnail: "https://img.youtube.com/vi/tGq7VcaHoqo/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/tGq7VcaHoqo",
    duration: "4:33",
    category: "Técnica",
    player: "Ronaldinho",
    views: "3.5M",
    likes: "125K"
  },
  {
    id: 6,
    title: "Pelé - O Rei Eterno",
    description: "A lenda que inspirou gerações",
    thumbnail: "https://img.youtube.com/vi/seKaU-qQuts/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/seKaU-qQuts",
    duration: "5:15",
    category: "Lenda",
    player: "Pelé",
    views: "4.2M",
    likes: "180K"
  }
];

const categories = ["Todos", "Superação", "Inspiração", "Mentalidade", "Talento", "Técnica", "Lenda"];

export default function Motivational() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  const [savedVideos, setSavedVideos] = useState<number[]>([]);

  const filteredVideos = motivationalVideos.filter(video => {
    const matchesCategory = selectedCategory === "Todos" || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.player.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (videoId: number) => {
    setLikedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSave = (videoId: number) => {
    setSavedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-yellow-500">
          💪 MOTIVAÇÃO
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Inspire-se com os melhores momentos dos maiores jogadores da história. 
          Transforme motivação em performance!
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar vídeos ou jogadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-yellow-500 text-black" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-yellow-500">{selectedVideo.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              
              <div className="aspect-video mb-4">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-yellow-500 text-black">{selectedVideo.category}</Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">{selectedVideo.player}</Badge>
                <span className="text-gray-400">{selectedVideo.views} visualizações</span>
              </div>
              
              <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLike(selectedVideo.id)}
                  className={`border-gray-600 ${likedVideos.includes(selectedVideo.id) ? 'text-red-500 border-red-500' : 'text-gray-300'}`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${likedVideos.includes(selectedVideo.id) ? 'fill-current' : ''}`} />
                  {selectedVideo.likes}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(selectedVideo.id)}
                  className={`border-gray-600 ${savedVideos.includes(selectedVideo.id) ? 'text-yellow-500 border-yellow-500' : 'text-gray-300'}`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${savedVideos.includes(selectedVideo.id) ? 'fill-current' : ''}`} />
                  Salvar
                </Button>
                
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={() => setSelectedVideo(video)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full w-16 h-16 p-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Play className="h-6 w-6 ml-1" />
                </Button>
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-black/70 text-white text-xs">
                  {video.duration}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-semibold text-white line-clamp-2 group-hover:text-yellow-500 transition-colors">
                  {video.title}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">
                    {video.category}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                    {video.player}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(video.id);
                    }}
                    className={`p-1 h-8 w-8 ${likedVideos.includes(video.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`h-4 w-4 ${likedVideos.includes(video.id) ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(video.id);
                    }}
                    className={`p-1 h-8 w-8 ${savedVideos.includes(video.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  >
                    <Bookmark className={`h-4 w-4 ${savedVideos.includes(video.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{video.views} visualizações</span>
                <span>{video.likes} curtidas</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Nenhum vídeo encontrado para "{searchTerm}" na categoria "{selectedCategory}"
          </p>
        </div>
      )}
    </div>
  );
}
