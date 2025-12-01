import React, { useState, useEffect } from 'react';
import { Play, Youtube, AlertCircle } from 'lucide-react';
import { YouTubeVideo } from '@/services/youtubeService';

interface VideoThumbnailProps {
  video: YouTubeVideo;
  className?: string;
}

export default function VideoThumbnail({ video, className = "" }: VideoThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Gerar thumbnail do YouTube a partir do ID do vídeo
  const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high') => {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  };

  // Extrair ID do vídeo da URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const videoId = extractVideoId(video.shortsUrl || video.embedUrl || '');
  
  // URLs de fallback para thumbnails
  const thumbnailUrls = [
    video.thumbnail, // URL original
    videoId ? getYouTubeThumbnail(videoId, 'maxres') : null,
    videoId ? getYouTubeThumbnail(videoId, 'high') : null,
    videoId ? getYouTubeThumbnail(videoId, 'medium') : null,
    videoId ? getYouTubeThumbnail(videoId, 'default') : null,
  ].filter(Boolean) as string[];

  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  const currentThumbnail = thumbnailUrls[currentThumbnailIndex];

  // Reset quando o vídeo muda
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setCurrentThumbnailIndex(0);
  }, [video.id]);

  // Tentar próximo thumbnail se o atual falhar
  const handleImageError = () => {
    if (currentThumbnailIndex < thumbnailUrls.length - 1) {
      setCurrentThumbnailIndex(prev => prev + 1);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Fallback quando todas as imagens falharam
  if (imageError || !currentThumbnail) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-gray-400`}>
        <div className="text-center p-4">
          <Youtube className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <div className="text-sm font-medium text-white mb-1 line-clamp-2">
            {video.title}
          </div>
          <div className="text-xs text-gray-400 mb-3 line-clamp-2">
            {video.description}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <Play className="w-3 h-3" />
            <span>Vídeo do YouTube</span>
          </div>
        </div>
        
        {/* Overlay de play */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading spinner */}
      {imageLoading && (
        <div className={`${className} bg-gray-800 flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      )}
      
      {/* Imagem */}
      <img
        src={currentThumbnail}
        alt={video.title}
        className={`${className} ${imageLoading ? 'opacity-0 absolute' : 'opacity-100'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      
      {/* Indicador de qualidade da thumbnail */}
      {!imageLoading && currentThumbnailIndex > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {currentThumbnailIndex === 1 && '4K'}
          {currentThumbnailIndex === 2 && 'HD'}
          {currentThumbnailIndex === 3 && 'MD'}
          {currentThumbnailIndex === 4 && 'SD'}
        </div>
      )}
    </div>
  );
}
