-- =====================================================
-- CORREÇÃO: Portfólio e Verificação de Rankings
-- =====================================================
-- Data: 2026-02-05
-- Objetivo: 
-- 1. Garantir que todos os campos do portfólio estejam corretos
-- 2. Verificar que os rankings ainda funcionam corretamente
-- 3. Ajustar políticas RLS se necessário

-- ============================================
-- 1. VERIFICAR E GARANTIR ESTRUTURA DO PORTFÓLIO
-- ============================================

-- Verificar se os campos existem (não fazer nada se já existirem)
DO $$
BEGIN
    -- Adicionar campos apenas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_portfolios' AND column_name = 'city') THEN
        ALTER TABLE player_portfolios ADD COLUMN city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_portfolios' AND column_name = 'state') THEN
        ALTER TABLE player_portfolios ADD COLUMN state TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_portfolios' AND column_name = 'gallery_photos') THEN
        ALTER TABLE player_portfolios ADD COLUMN gallery_photos TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_portfolios' AND column_name = 'skill_videos') THEN
        ALTER TABLE player_portfolios ADD COLUMN skill_videos TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_portfolios' AND column_name = 'achievements_data') THEN
        ALTER TABLE player_portfolios ADD COLUMN achievements_data JSONB DEFAULT '{"medals": [], "championships": [], "individual_awards": []}';
    END IF;
END $$;

-- Garantir valores padrão para registros existentes
UPDATE player_portfolios 
SET 
  gallery_photos = COALESCE(gallery_photos, '{}'),
  skill_videos = COALESCE(skill_videos, '{}'),
  achievements_data = COALESCE(achievements_data, '{"medals": [], "championships": [], "individual_awards": []}')
WHERE gallery_photos IS NULL 
   OR skill_videos IS NULL 
   OR achievements_data IS NULL;

-- ============================================
-- 2. VERIFICAR POLÍTICAS RLS DO PORTFÓLIO
-- ============================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem ler seus próprios portfólios" ON player_portfolios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios portfólios" ON player_portfolios;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios portfólios" ON player_portfolios;
DROP POLICY IF EXISTS "Portfólios públicos são visíveis para todos" ON player_portfolios;

-- Criar políticas corretas
CREATE POLICY "Portfólios públicos são visíveis para todos"
  ON player_portfolios FOR SELECT
  USING (is_public = true);

CREATE POLICY "Usuários podem ler seus próprios portfólios"
  ON player_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios portfólios"
  ON player_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios portfólios"
  ON player_portfolios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios portfólios"
  ON player_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. VERIFICAR RANKINGS (NÃO DEVEM SER AFETADOS)
-- ============================================

-- Verificar se a tabela rankings_cache existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'rankings_cache') THEN
        RAISE EXCEPTION 'ERRO: Tabela rankings_cache não existe! Execute a migração 20250120_novo_sistema_rankings.sql';
    END IF;
END $$;

-- Verificar políticas RLS dos rankings
DROP POLICY IF EXISTS "Rankings são públicos para leitura" ON rankings_cache;
DROP POLICY IF EXISTS "Sistema pode gerenciar rankings" ON rankings_cache;

CREATE POLICY "Rankings são públicos para leitura"
  ON rankings_cache FOR SELECT
  USING (true);

CREATE POLICY "Sistema pode gerenciar rankings"
  ON rankings_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- Recriar funções de ranking (caso tenham sido afetadas)
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
-- 4. VERIFICAR STATUS DAS TABELAS
-- ============================================

-- Verificar campos do portfólio
SELECT 
  'player_portfolios' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'player_portfolios'
  AND column_name IN ('city', 'state', 'gallery_photos', 'skill_videos', 'achievements_data')
ORDER BY column_name;

-- Verificar se rankings_cache tem dados
SELECT 
  'rankings_cache' as table_name,
  ranking_type,
  COUNT(*) as total_users
FROM rankings_cache
GROUP BY ranking_type
ORDER BY ranking_type;

-- ============================================
-- ✅ CORREÇÃO APLICADA COM SUCESSO!
-- ============================================
-- Próximos passos:
-- 1. Teste o salvamento do portfólio
-- 2. Verifique se os rankings ainda funcionam
-- 3. Se o erro 400 persistir, verifique os logs do Supabase
-- ============================================
