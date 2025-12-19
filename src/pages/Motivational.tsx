import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RefreshCw, 
  Search, 
  Calendar, 
  Eye,
  Loader2
} from 'lucide-react';
import { YouTubeService, YouTubeVideo } from '@/services/youtubeService';
import VideoThumbnail from '@/components/VideoThumbnail';
import { toast } from 'sonner';

export default function Motivational() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [channelUrl] = useState("https://youtube.com/shorts/7zt94EyRO9w?si=Ml4TEP9Ca4DFRP7h");

  // Carregar vídeos do canal
  const loadVideosFromChannel = async (url: string) => {
    setLoading(true);
    try {
      toast.info("🔍 Buscando vídeos do canal...");
      
      const fetchedVideos = await YouTubeService.getVideosFromUrl(url);
      
      if (fetchedVideos.length > 0) {
        setVideos(fetchedVideos);
        toast.success(`✅ ${fetchedVideos.length} vídeos carregados!`);
      } else {
        toast.warning("⚠️ Nenhum vídeo encontrado. Usando dados de exemplo.");
        setVideos(YouTubeService.getMockVideos());
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      toast.error("❌ Erro ao carregar vídeos. Usando dados de exemplo.");
      setVideos(YouTubeService.getMockVideos());
    } finally {
      setLoading(false);
    }
  };

  // Carregar vídeos na inicialização
  useEffect(() => {
    loadVideosFromChannel(channelUrl);
  }, []);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('ym-sports-favorite-videos');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Salvar favoritos no localStorage
  useEffect(() => {
    localStorage.setItem('ym-sports-favorite-videos', JSON.stringify(favorites));
  }, [favorites]);

  // Filtrar vídeos
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle favorito
  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Play className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-white">
                Motivação
              </h1>
            </div>
          </div>
          
          <p className="text-gray-400">
            Vídeos motivacionais para inspirar sua jornada
          </p>
        </div>


        {/* Filtros */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar vídeos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            
            {/* Botão de atualizar */}
            <Button
              onClick={() => loadVideosFromChannel(channelUrl)}
              disabled={loading}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Atualizar
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-500" />
            <p className="text-gray-400">Carregando vídeos do YouTube...</p>
          </div>
        )}

        {/* Grid de Vídeos */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map(video => (
              <Card key={video.id} className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 group">
                <CardHeader className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-800">
                    <VideoThumbnail 
                      video={video}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay com botão */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVideo(video)}
                        className="border-white text-white hover:bg-white hover:text-black"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Badge de duração */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>

                    {/* Badge de favorito */}
                    {favorites.includes(video.id) && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          ❤️ Favorito
                        </Badge>
                      </div>
                    )}
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
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{video.viewCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-2 border-t border-gray-800">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFavorite(video.id)}
                        className={`text-xs ${favorites.includes(video.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                      >
                        <span className={`mr-1 ${favorites.includes(video.id) ? '❤️' : '🤍'}`} />
                        {favorites.includes(video.id) ? 'Favoritado' : 'Favoritar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Vídeo */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white line-clamp-1">
                  {selectedVideo.title}
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
                  src={selectedVideo.embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>
              
              <div className="p-4 border-t border-gray-800">
                <div className="text-sm text-gray-400 text-center">
                  <span>{selectedVideo.viewCount}</span>
                  {" • "}
                  <span>{formatDate(selectedVideo.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-yellow-500">{videos.length}</div>
            <div className="text-sm text-gray-400">Vídeos Disponíveis</div>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-red-500">{favorites.length}</div>
            <div className="text-sm text-gray-400">Favoritos</div>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-blue-500">{filteredVideos.length}</div>
            <div className="text-sm text-gray-400">Resultados</div>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-green-500">
              {videos.filter(v => parseInt(v.duration) <= 60).length}
            </div>
            <div className="text-sm text-gray-400">Shorts</div>
          </Card>
        </div>

        {/* Mensagem quando não há resultados */}
        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum vídeo encontrado</p>
              <p className="text-sm">Tente ajustar o termo de busca ou configurar um novo canal</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Limpar Busca
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}