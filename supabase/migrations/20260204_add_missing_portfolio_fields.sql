-- Adicionar campos faltantes à tabela player_portfolios
-- Data: 2026-02-04
-- Motivo: Resolver erro 400 ao salvar portfolio

-- Adicionar campos de localização
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Adicionar campos de mídia adicional
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS gallery_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skill_videos TEXT[] DEFAULT '{}';

-- Adicionar campo de conquistas estruturadas (JSONB)
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS achievements_data JSONB DEFAULT '{"medals": [], "championships": [], "individual_awards": []}';

-- Comentários para documentação
COMMENT ON COLUMN player_portfolios.city IS 'Cidade onde o jogador reside';
COMMENT ON COLUMN player_portfolios.state IS 'Estado onde o jogador reside';
COMMENT ON COLUMN player_portfolios.gallery_photos IS 'URLs das fotos da galeria do portfólio';
COMMENT ON COLUMN player_portfolios.skill_videos IS 'URLs dos vídeos de habilidades';
COMMENT ON COLUMN player_portfolios.achievements_data IS 'Conquistas estruturadas: medalhas, campeonatos e prêmios individuais';

-- Garantir que dados existentes tenham valores padrão
UPDATE player_portfolios 
SET 
  gallery_photos = COALESCE(gallery_photos, '{}'),
  skill_videos = COALESCE(skill_videos, '{}'),
  achievements_data = COALESCE(achievements_data, '{"medals": [], "championships": [], "individual_awards": []}')
WHERE gallery_photos IS NULL 
   OR skill_videos IS NULL 
   OR achievements_data IS NULL;
