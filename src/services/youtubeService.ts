// Serviço para buscar vídeos do YouTube usando a YouTube Data API v3
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  shortsUrl: string;
  embedUrl: string;
}

export class YouTubeService {
  private static readonly API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || '';
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';

  // Extrair ID do canal de uma URL do YouTube
  static extractChannelId(url: string): string | null {
    // Para URLs como: https://youtube.com/shorts/7zt94EyRO9w?si=Ml4TEP9Ca4DFRP7h
    // Vamos extrair o ID do vídeo e depois buscar o canal
    const videoIdMatch = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return videoIdMatch ? videoIdMatch[1] : null;
  }

  // Buscar informações do canal a partir de um vídeo
  static async getChannelFromVideo(videoId: string): Promise<string | null> {
    if (!this.API_KEY) {
      console.warn('YouTube API Key não configurada');
      return null;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/videos?part=snippet&id=${videoId}&key=${this.API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return data.items[0].snippet.channelId;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar canal do vídeo:', error);
      return null;
    }
  }

  // Buscar vídeos de um canal (incluindo Shorts)
  static async getChannelVideos(channelId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    if (!this.API_KEY) {
      console.warn('YouTube API Key não configurada - usando dados mock');
      return this.getMockVideos();
    }

    try {
      // Primeiro, buscar os vídeos do canal
      const searchResponse = await fetch(
        `${this.BASE_URL}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${this.API_KEY}`
      );
      
      if (!searchResponse.ok) {
        throw new Error(`YouTube API error: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        console.warn('Nenhum vídeo encontrado no canal');
        return this.getMockVideos();
      }

      // Extrair IDs dos vídeos
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      
      // Buscar detalhes dos vídeos (duração, views, etc.)
      const detailsResponse = await fetch(
        `${this.BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.API_KEY}`
      );
      
      if (!detailsResponse.ok) {
        throw new Error(`YouTube API error: ${detailsResponse.status}`);
      }
      
      const detailsData = await detailsResponse.json();
      
      // Processar e formatar os vídeos
      const videos: YouTubeVideo[] = detailsData.items.map((item: any) => {
        const duration = this.parseDuration(item.contentDetails.duration);
        const isShort = duration <= 60; // Shorts são vídeos de até 60 segundos
        
        return {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          publishedAt: item.snippet.publishedAt,
          duration: this.formatDuration(duration),
          viewCount: this.formatViewCount(parseInt(item.statistics.viewCount || '0')),
          shortsUrl: isShort 
            ? `https://youtube.com/shorts/${item.id}` 
            : `https://youtube.com/watch?v=${item.id}`,
          embedUrl: `https://www.youtube.com/embed/${item.id}`
        };
      });
      
      // Filtrar apenas Shorts (vídeos de até 60 segundos) e ordenar por data
      const shorts = videos
        .filter(video => this.parseDuration(video.duration) <= 60)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      console.log(`Encontrados ${shorts.length} Shorts do canal`);
      return shorts;
      
    } catch (error) {
      console.error('Erro ao buscar vídeos do canal:', error);
      return this.getMockVideos();
    }
  }

  // Buscar vídeos a partir de uma URL (vídeo ou canal)
  static async getVideosFromUrl(url: string): Promise<YouTubeVideo[]> {
    const videoId = this.extractChannelId(url);
    
    if (!videoId) {
      console.error('Não foi possível extrair ID do vídeo da URL');
      return this.getMockVideos();
    }

    // Buscar o canal a partir do vídeo
    const channelId = await this.getChannelFromVideo(videoId);
    
    if (!channelId) {
      console.error('Não foi possível encontrar o canal do vídeo');
      return this.getMockVideos();
    }

    console.log(`Canal encontrado: ${channelId}`);
    return this.getChannelVideos(channelId);
  }

  // Converter duração ISO 8601 para segundos
  private static parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Formatar duração em formato legível
  private static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}:00`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
    }
  }

  // Formatar contagem de visualizações
  private static formatViewCount(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M visualizações`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K visualizações`;
    } else {
      return `${views} visualizações`;
    }
  }

  // Dados mock para quando a API não estiver disponível
  private static getMockVideos(): YouTubeVideo[] {
    return [
      {
        id: "7zt94EyRO9w",
        title: "💪 Motivação para Treinar - Nunca Desista!",
        description: "Vídeo motivacional para te inspirar a nunca desistir dos seus objetivos fitness.",
        thumbnail: "https://img.youtube.com/vi/7zt94EyRO9w/hqdefault.jpg",
        publishedAt: new Date().toISOString(),
        duration: "45s",
        viewCount: "1.2K visualizações",
        shortsUrl: "https://youtube.com/shorts/7zt94EyRO9w",
        embedUrl: "https://www.youtube.com/embed/7zt94EyRO9w"
      },
      {
        id: "dQw4w9WgXcQ",
        title: "🏃‍♂️ Treino Matinal - Comece o Dia com Energia",
        description: "Dicas rápidas para um treino matinal eficiente.",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        duration: "52s",
        viewCount: "856 visualizações",
        shortsUrl: "https://youtube.com/shorts/dQw4w9WgXcQ",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
      {
        id: "jNQXAC9IVRw",
        title: "🥗 Alimentação Saudável - Dicas Rápidas",
        description: "Como manter uma alimentação equilibrada no dia a dia.",
        thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        duration: "38s",
        viewCount: "2.1K visualizações",
        shortsUrl: "https://youtube.com/shorts/jNQXAC9IVRw",
        embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw"
      },
      {
        id: "L_jWHffIx5E",
        title: "🎯 Foco nos Objetivos - Mentalidade Vencedora",
        description: "Como manter o foco e a disciplina para alcançar seus objetivos.",
        thumbnail: "https://img.youtube.com/vi/L_jWHffIx5E/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        duration: "41s",
        viewCount: "3.4K visualizações",
        shortsUrl: "https://youtube.com/shorts/L_jWHffIx5E",
        embedUrl: "https://www.youtube.com/embed/L_jWHffIx5E"
      },
      {
        id: "kJQP7kiw5Fk",
        title: "💧 Hidratação - A Importância da Água",
        description: "Por que beber água é fundamental para seu desempenho.",
        thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 345600000).toISOString(),
        duration: "29s",
        viewCount: "1.8K visualizações",
        shortsUrl: "https://youtube.com/shorts/kJQP7kiw5Fk",
        embedUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk"
      }
    ];
  }
}
