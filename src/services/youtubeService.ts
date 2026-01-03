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
        id: "y0gfkHX4JTI",
        title: "🏃‍♂️ Motivação Esportiva",
        description: "Conteúdo motivacional para atletas.",
        thumbnail: "https://img.youtube.com/vi/y0gfkHX4JTI/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        duration: "52s",
        viewCount: "856 visualizações",
        shortsUrl: "https://youtube.com/shorts/y0gfkHX4JTI",
        embedUrl: "https://www.youtube.com/embed/y0gfkHX4JTI"
      },
      {
        id: "CB_txzChCrg",
        title: "⚽ Treino de Elite",
        description: "Técnicas e motivação para treinos de alto nível.",
        thumbnail: "https://img.youtube.com/vi/CB_txzChCrg/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        duration: "38s",
        viewCount: "2.1K visualizações",
        shortsUrl: "https://youtube.com/shorts/CB_txzChCrg",
        embedUrl: "https://www.youtube.com/embed/CB_txzChCrg"
      },
      {
        id: "QB5YBad5xhU",
        title: "🎯 Foco e Determinação",
        description: "Como manter o foco nos seus objetivos esportivos.",
        thumbnail: "https://img.youtube.com/vi/QB5YBad5xhU/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        duration: "41s",
        viewCount: "3.4K visualizações",
        shortsUrl: "https://youtube.com/shorts/QB5YBad5xhU",
        embedUrl: "https://www.youtube.com/embed/QB5YBad5xhU"
      },
      {
        id: "tNepTLIcRQk",
        title: "💯 Superação no Esporte",
        description: "Histórias de superação e motivação.",
        thumbnail: "https://img.youtube.com/vi/tNepTLIcRQk/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 345600000).toISOString(),
        duration: "29s",
        viewCount: "1.8K visualizações",
        shortsUrl: "https://youtube.com/shorts/tNepTLIcRQk",
        embedUrl: "https://www.youtube.com/embed/tNepTLIcRQk"
      },
      {
        id: "adzILomT374",
        title: "🔥 Mentalidade Vencedora",
        description: "Desenvolva a mentalidade de um campeão.",
        thumbnail: "https://img.youtube.com/vi/adzILomT374/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 432000000).toISOString(),
        duration: "35s",
        viewCount: "2.5K visualizações",
        shortsUrl: "https://youtube.com/shorts/adzILomT374",
        embedUrl: "https://www.youtube.com/embed/adzILomT374"
      },
      {
        id: "N9Js1eG81DU",
        title: "⚡ Energia para Treinar",
        description: "Dicas para manter energia nos treinos.",
        thumbnail: "https://img.youtube.com/vi/N9Js1eG81DU/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 518400000).toISOString(),
        duration: "44s",
        viewCount: "1.9K visualizações",
        shortsUrl: "https://youtube.com/shorts/N9Js1eG81DU",
        embedUrl: "https://www.youtube.com/embed/N9Js1eG81DU"
      },
      {
        id: "ELeBOArjsmI",
        title: "🏆 Caminho do Sucesso",
        description: "O que fazer para alcançar o sucesso no esporte.",
        thumbnail: "https://img.youtube.com/vi/ELeBOArjsmI/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 604800000).toISOString(),
        duration: "50s",
        viewCount: "3.2K visualizações",
        shortsUrl: "https://youtube.com/shorts/ELeBOArjsmI",
        embedUrl: "https://www.youtube.com/embed/ELeBOArjsmI"
      },
      {
        id: "8PfzY2im3gQ",
        title: "💪 Força e Resistência",
        description: "Treinos para desenvolvimento físico.",
        thumbnail: "https://img.youtube.com/vi/8PfzY2im3gQ/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 691200000).toISOString(),
        duration: "47s",
        viewCount: "2.8K visualizações",
        shortsUrl: "https://youtube.com/shorts/8PfzY2im3gQ",
        embedUrl: "https://www.youtube.com/embed/8PfzY2im3gQ"
      },
      {
        id: "qAr9dciOapk",
        title: "🎖️ Disciplina Esportiva",
        description: "A importância da disciplina no esporte.",
        thumbnail: "https://img.youtube.com/vi/qAr9dciOapk/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 777600000).toISOString(),
        duration: "42s",
        viewCount: "2.3K visualizações",
        shortsUrl: "https://youtube.com/shorts/qAr9dciOapk",
        embedUrl: "https://www.youtube.com/embed/qAr9dciOapk"
      },
      {
        id: "JPkrqQGmTw0",
        title: "🌟 Brilhe no Campo",
        description: "Como se destacar durante os jogos.",
        thumbnail: "https://img.youtube.com/vi/JPkrqQGmTw0/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 864000000).toISOString(),
        duration: "39s",
        viewCount: "1.7K visualizações",
        shortsUrl: "https://youtube.com/shorts/JPkrqQGmTw0",
        embedUrl: "https://www.youtube.com/embed/JPkrqQGmTw0"
      },
      {
        id: "fmJM7kyGqEE",
        title: "🚀 Evolução Constante",
        description: "Sempre busque evoluir no esporte.",
        thumbnail: "https://img.youtube.com/vi/fmJM7kyGqEE/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 950400000).toISOString(),
        duration: "46s",
        viewCount: "2.9K visualizações",
        shortsUrl: "https://youtube.com/shorts/fmJM7kyGqEE",
        embedUrl: "https://www.youtube.com/embed/fmJM7kyGqEE"
      },
      {
        id: "YPB_bLgUL6c",
        title: "⭐ Estrelas do Esporte",
        description: "Inspiração dos grandes atletas.",
        thumbnail: "https://img.youtube.com/vi/YPB_bLgUL6c/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 1036800000).toISOString(),
        duration: "54s",
        viewCount: "3.5K visualizações",
        shortsUrl: "https://youtube.com/shorts/YPB_bLgUL6c",
        embedUrl: "https://www.youtube.com/embed/YPB_bLgUL6c"
      },
      {
        id: "Z7Bot0qYni4",
        title: "🎮 Táticas Vencedoras",
        description: "Estratégias para vencer.",
        thumbnail: "https://img.youtube.com/vi/Z7Bot0qYni4/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 1123200000).toISOString(),
        duration: "48s",
        viewCount: "2.1K visualizações",
        shortsUrl: "https://youtube.com/shorts/Z7Bot0qYni4",
        embedUrl: "https://www.youtube.com/embed/Z7Bot0qYni4"
      },
      {
        id: "pQpVISYWUQ4",
        title: "🏅 Espírito de Equipe",
        description: "A força do trabalho em equipe.",
        thumbnail: "https://img.youtube.com/vi/pQpVISYWUQ4/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 1209600000).toISOString(),
        duration: "43s",
        viewCount: "2.6K visualizações",
        shortsUrl: "https://youtube.com/shorts/pQpVISYWUQ4",
        embedUrl: "https://www.youtube.com/embed/pQpVISYWUQ4"
      },
      {
        id: "oRbMBRaH7Lo",
        title: "🔰 Fundamentos do Jogo",
        description: "Domine os fundamentos básicos.",
        thumbnail: "https://img.youtube.com/vi/oRbMBRaH7Lo/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 1296000000).toISOString(),
        duration: "51s",
        viewCount: "1.5K visualizações",
        shortsUrl: "https://youtube.com/shorts/oRbMBRaH7Lo",
        embedUrl: "https://www.youtube.com/embed/oRbMBRaH7Lo"
      },
      {
        id: "GzH70edQqXU",
        title: "🎯 Precisão e Técnica",
        description: "Aprimore sua técnica esportiva.",
        thumbnail: "https://img.youtube.com/vi/GzH70edQqXU/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 1382400000).toISOString(),
        duration: "40s",
        viewCount: "2.2K visualizações",
        shortsUrl: "https://youtube.com/shorts/GzH70edQqXU",
        embedUrl: "https://www.youtube.com/embed/GzH70edQqXU"
      },
      {
        id: "sygtYfrl9Wg",
        title: "💎 Talento e Dedicação",
        description: "Talento com trabalho duro.",
        thumbnail: "https://img.youtube.com/vi/sygtYfrl9Wg/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 1468800000).toISOString(),
        duration: "36s",
        viewCount: "3.1K visualizações",
        shortsUrl: "https://youtube.com/shorts/sygtYfrl9Wg",
        embedUrl: "https://www.youtube.com/embed/sygtYfrl9Wg"
      },
      {
        id: "HZeQSNlJas4",
        title: "🏃 Velocidade e Agilidade",
        description: "Desenvolva velocidade nos treinos.",
        thumbnail: "https://img.youtube.com/vi/HZeQSNlJas4/hqdefault.jpg",
        publishedAt: new Date(Date.now() - 1555200000).toISOString(),
        duration: "37s",
        viewCount: "2.4K visualizações",
        shortsUrl: "https://youtube.com/shorts/HZeQSNlJas4",
        embedUrl: "https://www.youtube.com/embed/HZeQSNlJas4"
      }
    ];
  }
}
