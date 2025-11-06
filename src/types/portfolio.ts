export interface PlayerPortfolio {
  id: string;
  user_id: string;
  slug: string; // URL amigável para compartilhamento
  
  // Informações Básicas
  full_name: string;
  position: string;
  age: number;
  height: number; // em cm
  weight: number; // em kg
  preferred_foot: 'left' | 'right' | 'both';
  nationality: string;
  city?: string;
  state?: string;
  
  // Informações de Contato
  phone?: string;
  email?: string;
  social_media?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  
  // Fotos e Mídia
  profile_photo?: string;
  action_photos?: string[];
  highlight_video?: string;
  
  // Histórico de Clubes
  club_history: ClubHistory[];
  
  // Estatísticas
  career_stats: CareerStats;
  
  // Habilidades e Características
  skills: PlayerSkills;
  
  // Informações Adicionais
  biography?: string;
  achievements?: string[];
  languages?: string[];
  
  // Configurações
  is_public: boolean;
  is_seeking_club: boolean;
  preferred_leagues?: string[];
  salary_expectation?: string;
  
  // Metadados
  created_at: string;
  updated_at: string;
  views_count: number;
}

export interface ClubHistory {
  id: string;
  club_name: string;
  club_logo?: string;
  position: string;
  start_date: string;
  end_date?: string; // null se ainda joga no clube
  games_played?: number;
  goals_scored?: number;
  assists?: number;
  achievements?: string[];
  is_current: boolean;
}

export interface CareerStats {
  total_games: number;
  total_goals: number;
  total_assists: number;
  yellow_cards: number;
  red_cards: number;
  clean_sheets?: number; // para goleiros
  saves?: number; // para goleiros
  goals_conceded?: number; // para goleiros
}

export interface PlayerSkills {
  // Habilidades Técnicas (1-10)
  ball_control: number;
  passing: number;
  shooting: number;
  dribbling: number;
  crossing: number;
  finishing: number;
  
  // Habilidades Físicas (1-10)
  speed: number;
  acceleration: number;
  strength: number;
  jumping: number;
  stamina: number;
  agility: number;
  
  // Habilidades Mentais (1-10)
  vision: number;
  decision_making: number;
  concentration: number;
  leadership: number;
  teamwork: number;
  
  // Habilidades Defensivas (1-10)
  marking: number;
  tackling: number;
  interceptions: number;
  heading: number;
}

export interface PortfolioView {
  id: string;
  portfolio_id: string;
  viewer_ip?: string;
  viewer_location?: string;
  viewed_at: string;
  referrer?: string;
}

export interface PortfolioShare {
  id: string;
  portfolio_id: string;
  shared_via: 'link' | 'email' | 'whatsapp' | 'social';
  shared_at: string;
  recipient_info?: string;
}
