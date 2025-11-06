-- Tabela principal de portfólios
CREATE TABLE player_portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Informações Básicas
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  age INTEGER NOT NULL,
  height INTEGER NOT NULL, -- em cm
  weight INTEGER NOT NULL, -- em kg
  preferred_foot TEXT CHECK (preferred_foot IN ('left', 'right', 'both')) NOT NULL,
  nationality TEXT NOT NULL,
  
  -- Informações de Contato
  phone TEXT,
  email TEXT,
  social_media JSONB DEFAULT '{}',
  
  -- Fotos e Mídia
  profile_photo TEXT,
  action_photos TEXT[] DEFAULT '{}',
  highlight_video TEXT,
  
  -- Estatísticas de Carreira
  career_stats JSONB DEFAULT '{}',
  
  -- Habilidades
  skills JSONB DEFAULT '{}',
  
  -- Informações Adicionais
  biography TEXT,
  achievements TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  
  -- Configurações
  is_public BOOLEAN DEFAULT true,
  is_seeking_club BOOLEAN DEFAULT false,
  preferred_leagues TEXT[] DEFAULT '{}',
  salary_expectation TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  
  UNIQUE(user_id) -- Um portfólio por usuário
);

-- Tabela de histórico de clubes
CREATE TABLE club_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES player_portfolios(id) ON DELETE CASCADE NOT NULL,
  club_name TEXT NOT NULL,
  club_logo TEXT,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  games_played INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de visualizações do portfólio
CREATE TABLE portfolio_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES player_portfolios(id) ON DELETE CASCADE NOT NULL,
  viewer_ip INET,
  viewer_location TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT
);

-- Tabela de compartilhamentos
CREATE TABLE portfolio_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES player_portfolios(id) ON DELETE CASCADE NOT NULL,
  shared_via TEXT CHECK (shared_via IN ('link', 'email', 'whatsapp', 'social')) NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipient_info TEXT
);

-- Índices para performance
CREATE INDEX idx_player_portfolios_slug ON player_portfolios(slug);
CREATE INDEX idx_player_portfolios_user_id ON player_portfolios(user_id);
CREATE INDEX idx_player_portfolios_public ON player_portfolios(is_public) WHERE is_public = true;
CREATE INDEX idx_club_history_portfolio_id ON club_history(portfolio_id);
CREATE INDEX idx_portfolio_views_portfolio_id ON portfolio_views(portfolio_id);
CREATE INDEX idx_portfolio_views_viewed_at ON portfolio_views(viewed_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_player_portfolios_updated_at 
    BEFORE UPDATE ON player_portfolios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar views_count
CREATE OR REPLACE FUNCTION increment_portfolio_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE player_portfolios 
    SET views_count = views_count + 1 
    WHERE id = NEW.portfolio_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para incrementar views automaticamente
CREATE TRIGGER increment_views_on_insert
    AFTER INSERT ON portfolio_views
    FOR EACH ROW EXECUTE FUNCTION increment_portfolio_views();

-- RLS (Row Level Security)
ALTER TABLE player_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_shares ENABLE ROW LEVEL SECURITY;

-- Políticas para player_portfolios
CREATE POLICY "Usuários podem ver portfólios públicos"
  ON player_portfolios FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seu próprio portfólio"
  ON player_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio portfólio"
  ON player_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio portfólio"
  ON player_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para club_history
CREATE POLICY "Usuários podem ver histórico de clubes de portfólios públicos"
  ON club_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM player_portfolios 
    WHERE id = portfolio_id 
    AND (is_public = true OR user_id = auth.uid())
  ));

CREATE POLICY "Usuários podem gerenciar histórico do seu portfólio"
  ON club_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM player_portfolios 
    WHERE id = portfolio_id 
    AND user_id = auth.uid()
  ));

-- Políticas para portfolio_views (apenas inserção para tracking)
CREATE POLICY "Qualquer um pode registrar visualização"
  ON portfolio_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Donos podem ver visualizações do seu portfólio"
  ON portfolio_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM player_portfolios 
    WHERE id = portfolio_id 
    AND user_id = auth.uid()
  ));

-- Políticas para portfolio_shares
CREATE POLICY "Qualquer um pode registrar compartilhamento"
  ON portfolio_shares FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Donos podem ver compartilhamentos do seu portfólio"
  ON portfolio_shares FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM player_portfolios 
    WHERE id = portfolio_id 
    AND user_id = auth.uid()
  ));

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
    counter INTEGER := 0;
    final_slug TEXT;
BEGIN
    -- Converter para slug (lowercase, sem espaços, sem acentos)
    slug := lower(regexp_replace(
        translate(base_name, 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiioooooouuuucn'),
        '[^a-z0-9]+', '-', 'g'
    ));
    
    -- Remover hífens do início e fim
    slug := trim(both '-' from slug);
    
    final_slug := slug;
    
    -- Verificar se já existe e adicionar número se necessário
    WHILE EXISTS (SELECT 1 FROM player_portfolios WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
