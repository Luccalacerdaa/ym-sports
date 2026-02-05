-- =====================================================
-- APLICAR MIGRAÇÃO: Campos faltantes no portfólio
-- =====================================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar campos de localização
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- 2. Adicionar campos de mídia adicional
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS gallery_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skill_videos TEXT[] DEFAULT '{}';

-- 3. Adicionar campo de conquistas estruturadas (JSONB)
ALTER TABLE player_portfolios 
ADD COLUMN IF NOT EXISTS achievements_data JSONB DEFAULT '{"medals": [], "championships": [], "individual_awards": []}';

-- 4. Comentários para documentação
COMMENT ON COLUMN player_portfolios.city IS 'Cidade onde o jogador reside';
COMMENT ON COLUMN player_portfolios.state IS 'Estado onde o jogador reside';
COMMENT ON COLUMN player_portfolios.gallery_photos IS 'URLs das fotos da galeria do portfólio';
COMMENT ON COLUMN player_portfolios.skill_videos IS 'URLs dos vídeos de habilidades';
COMMENT ON COLUMN player_portfolios.achievements_data IS 'Conquistas estruturadas: medalhas, campeonatos e prêmios individuais';

-- 5. Garantir que dados existentes tenham valores padrão
UPDATE player_portfolios 
SET 
  gallery_photos = COALESCE(gallery_photos, '{}'),
  skill_videos = COALESCE(skill_videos, '{}'),
  achievements_data = COALESCE(achievements_data, '{"medals": [], "championships": [], "individual_awards": []}')
WHERE gallery_photos IS NULL 
   OR skill_videos IS NULL 
   OR achievements_data IS NULL;

-- 6. Verificar se os campos foram criados
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'player_portfolios'
  AND column_name IN ('city', 'state', 'gallery_photos', 'skill_videos', 'achievements_data')
ORDER BY column_name;

-- ✅ Se a query acima retornar 5 linhas, a migração foi aplicada com sucesso!
