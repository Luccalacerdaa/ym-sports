-- ============================================
-- 🆕 NOVO SISTEMA DE RANKINGS - LIMPO E SIMPLES
-- ============================================
-- Criado em: 20/01/2026
-- Arquitetura: Cálculo em tempo real sem duplicações

-- 1️⃣ LIMPAR TUDO DO SISTEMA ANTIGO
-- ============================================
DROP TABLE IF EXISTS rankings CASCADE;
DROP INDEX IF EXISTS idx_rankings_unique_user_type_period;
DROP INDEX IF EXISTS idx_rankings_user_id;
DROP INDEX IF EXISTS idx_rankings_type_region;

-- 2️⃣ CRIAR NOVA TABELA DE RANKINGS (Mais simples)
-- ============================================
-- Esta tabela armazena apenas snapshots dos rankings
-- Não armazena posições (calculadas em tempo real)
CREATE TABLE rankings_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_type TEXT NOT NULL CHECK (ranking_type IN ('national', 'regional', 'local')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  region TEXT, -- Para regional: 'Sudeste', 'Norte', etc. Para local: estado (ex: 'MG')
  city TEXT, -- Para local: cidade aproximada
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3️⃣ ÍNDICES PARA PERFORMANCE
-- ============================================
-- Índice único para prevenir duplicações (suporta COALESCE)
CREATE UNIQUE INDEX idx_rankings_cache_unique 
  ON rankings_cache(user_id, ranking_type, COALESCE(region, ''), COALESCE(city, ''));

-- Índices para performance de queries
CREATE INDEX idx_rankings_cache_type ON rankings_cache(ranking_type);
CREATE INDEX idx_rankings_cache_user ON rankings_cache(user_id);
CREATE INDEX idx_rankings_cache_points ON rankings_cache(points DESC);
CREATE INDEX idx_rankings_cache_region ON rankings_cache(region) WHERE region IS NOT NULL;
CREATE INDEX idx_rankings_cache_city ON rankings_cache(city) WHERE city IS NOT NULL;

-- 4️⃣ HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE rankings_cache ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler
CREATE POLICY "Rankings são públicos para leitura"
  ON rankings_cache FOR SELECT
  USING (true);

-- Política: Sistema pode inserir/atualizar
CREATE POLICY "Sistema pode gerenciar rankings"
  ON rankings_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5️⃣ POPULAR COM DADOS ATUAIS
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
WHERE up.total_points > 0;

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
WHERE up.total_points > 0 AND ul.region IS NOT NULL;

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
WHERE up.total_points > 0 AND ul.state IS NOT NULL;

-- 6️⃣ CRIAR FUNÇÃO PARA ATUALIZAR RANKINGS
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

-- 7️⃣ TRIGGER PARA ATUALIZAR AUTOMATICAMENTE
-- ============================================
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
DROP TRIGGER IF EXISTS on_user_progress_change ON user_progress;
CREATE TRIGGER on_user_progress_change
  AFTER INSERT OR UPDATE OF total_points ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_rankings();

-- Trigger quando user_locations mudar
DROP TRIGGER IF EXISTS on_user_location_change ON user_locations;
CREATE TRIGGER on_user_location_change
  AFTER INSERT OR UPDATE ON user_locations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_rankings();

-- ============================================
-- ✅ SISTEMA DE RANKINGS CRIADO COM SUCESSO!
-- ============================================
-- Próximos passos:
-- 1. No frontend: usar queries simples para buscar de rankings_cache
-- 2. Posições calculadas em tempo real (ORDER BY points DESC)
-- 3. Cache no localStorage para melhor performance
-- ============================================
