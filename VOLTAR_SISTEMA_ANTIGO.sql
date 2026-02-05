-- =====================================================
-- ⚡ VOLTAR AO SISTEMA DE RANKINGS QUE FUNCIONAVA
-- =====================================================
-- Este script vai:
-- 1. Deletar a tabela 'rankings' (antiga/problemática)
-- 2. Recriar a tabela 'rankings_cache' (que funcionava 100%)
-- 3. Criar triggers automáticos
-- 4. Popular com dados de todos os usuários

-- ============================================
-- 1️⃣ LIMPAR SISTEMA ANTIGO
-- ============================================
DROP TABLE IF EXISTS rankings CASCADE;
DROP INDEX IF EXISTS idx_rankings_unique_user_type_period;
DROP INDEX IF EXISTS idx_rankings_user_id;
DROP INDEX IF EXISTS idx_rankings_type_region;

-- ============================================
-- 2️⃣ CRIAR TABELA RANKINGS_CACHE
-- ============================================
DROP TABLE IF EXISTS rankings_cache CASCADE;

CREATE TABLE rankings_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_type TEXT NOT NULL CHECK (ranking_type IN ('national', 'regional', 'local')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  region TEXT, -- Para regional: 'Sudeste', 'Norte', etc. Para local: estado (ex: 'MG')
  city TEXT, -- Para local: cidade aproximada
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3️⃣ CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================
-- Índice único para prevenir duplicações
CREATE UNIQUE INDEX idx_rankings_cache_unique 
  ON rankings_cache(user_id, ranking_type, COALESCE(region, ''), COALESCE(city, ''));

-- Índices para performance de queries
CREATE INDEX idx_rankings_cache_type ON rankings_cache(ranking_type);
CREATE INDEX idx_rankings_cache_user ON rankings_cache(user_id);
CREATE INDEX idx_rankings_cache_points ON rankings_cache(points DESC);
CREATE INDEX idx_rankings_cache_region ON rankings_cache(region) WHERE region IS NOT NULL;
CREATE INDEX idx_rankings_cache_city ON rankings_cache(city) WHERE city IS NOT NULL;

-- ============================================
-- 4️⃣ HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE rankings_cache ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Rankings são públicos para leitura" ON rankings_cache;
DROP POLICY IF EXISTS "Sistema pode gerenciar rankings" ON rankings_cache;

-- Criar políticas corretas
CREATE POLICY "Rankings são públicos para leitura"
  ON rankings_cache FOR SELECT
  USING (true);

CREATE POLICY "Sistema pode gerenciar rankings"
  ON rankings_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5️⃣ CRIAR FUNÇÃO DE ATUALIZAÇÃO
-- ============================================
CREATE OR REPLACE FUNCTION refresh_user_rankings(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_points INTEGER;
  user_region TEXT;
  user_state TEXT;
  user_city TEXT;
BEGIN
  -- Buscar dados do usuário
  SELECT total_points INTO user_points 
  FROM user_progress 
  WHERE user_id = target_user_id;
  
  SELECT region, state, city_approximate 
  INTO user_region, user_state, user_city
  FROM user_locations 
  WHERE user_id = target_user_id;
  
  -- Deletar rankings antigos do usuário
  DELETE FROM rankings_cache WHERE user_id = target_user_id;
  
  -- Inserir ranking nacional
  INSERT INTO rankings_cache (user_id, ranking_type, points, region, city)
  VALUES (target_user_id, 'national', COALESCE(user_points, 0), NULL, NULL);
  
  -- Inserir ranking regional (se tiver região)
  IF user_region IS NOT NULL THEN
    INSERT INTO rankings_cache (user_id, ranking_type, points, region, city)
    VALUES (target_user_id, 'regional', COALESCE(user_points, 0), user_region, NULL);
  END IF;
  
  -- Inserir ranking local (se tiver estado)
  IF user_state IS NOT NULL THEN
    INSERT INTO rankings_cache (user_id, ranking_type, points, region, city)
    VALUES (target_user_id, 'local', COALESCE(user_points, 0), user_state, user_city);
  END IF;
END;
$$;

-- ============================================
-- 6️⃣ CRIAR TRIGGERS AUTOMÁTICOS
-- ============================================
DROP TRIGGER IF EXISTS on_user_progress_change ON user_progress;
DROP TRIGGER IF EXISTS on_user_location_change ON user_locations;
DROP FUNCTION IF EXISTS trigger_refresh_rankings();

CREATE OR REPLACE FUNCTION trigger_refresh_rankings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM refresh_user_rankings(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Trigger quando user_progress mudar
CREATE TRIGGER on_user_progress_change
  AFTER INSERT OR UPDATE OF total_points ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_rankings();

-- Trigger quando user_locations mudar
CREATE TRIGGER on_user_location_change
  AFTER INSERT OR UPDATE ON user_locations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_rankings();

-- ============================================
-- 7️⃣ POPULAR COM DADOS ATUAIS
-- ============================================
-- Nacional: Todos os usuários
INSERT INTO rankings_cache (user_id, ranking_type, points, region, city)
SELECT 
  up.user_id,
  'national' as ranking_type,
  COALESCE(up.total_points, 0) as points,
  NULL as region,
  NULL as city
FROM user_progress up
WHERE up.total_points > 0
ON CONFLICT DO NOTHING;

-- Regional: Agrupar por região (Sudeste, Norte, etc.)
INSERT INTO rankings_cache (user_id, ranking_type, points, region, city)
SELECT 
  up.user_id,
  'regional' as ranking_type,
  COALESCE(up.total_points, 0) as points,
  ul.region,
  NULL as city
FROM user_progress up
INNER JOIN user_locations ul ON up.user_id = ul.user_id
WHERE up.total_points > 0 AND ul.region IS NOT NULL
ON CONFLICT DO NOTHING;

-- Local: Agrupar por estado
INSERT INTO rankings_cache (user_id, ranking_type, points, region, city)
SELECT 
  up.user_id,
  'local' as ranking_type,
  COALESCE(up.total_points, 0) as points,
  ul.state as region,
  ul.city_approximate as city
FROM user_progress up
INNER JOIN user_locations ul ON up.user_id = ul.user_id
WHERE up.total_points > 0 AND ul.state IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- 8️⃣ VERIFICAR RESULTADOS
-- ============================================
SELECT 
  ranking_type,
  COUNT(*) as total_rankings,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  MIN(points) as min_pontos,
  MAX(points) as max_pontos,
  AVG(points)::INTEGER as media_pontos
FROM rankings_cache
GROUP BY ranking_type
ORDER BY ranking_type;

-- ============================================
-- ✅ SISTEMA ANTIGO RESTAURADO COM SUCESSO!
-- ============================================
-- Agora o frontend deve usar useRankingSystem
-- Triggers automáticos vão manter tudo atualizado
-- ============================================
