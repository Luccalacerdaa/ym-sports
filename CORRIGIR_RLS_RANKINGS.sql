-- =====================================================
-- ⚡ CORRIGIR RLS (Row Level Security) DOS RANKINGS
-- =====================================================
-- Problema: Frontend só consegue ver o próprio usuário
-- Solução: Permitir que TODOS vejam TODOS os rankings

-- 1️⃣ REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Rankings são públicos" ON rankings;
DROP POLICY IF EXISTS "Usuários podem ver todos os rankings" ON rankings;
DROP POLICY IF EXISTS "Usuários podem ler seus próprios rankings" ON rankings;
DROP POLICY IF EXISTS "Sistema pode gerenciar rankings" ON rankings;
DROP POLICY IF EXISTS "Rankings são públicos para leitura" ON rankings;

-- 2️⃣ CRIAR POLÍTICA CORRETA: TODOS PODEM LER TODOS OS RANKINGS
CREATE POLICY "Rankings são públicos para leitura"
  ON rankings
  FOR SELECT
  USING (true);  -- TRUE = permite que TODOS leiam TODOS os rankings

-- 3️⃣ VERIFICAR SE RLS ESTÁ ATIVO
-- (Precisa estar ativo, mas com política permissiva)
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- 4️⃣ TESTAR - Esta query deve retornar TODOS os rankings
SELECT 
  ranking_type,
  COUNT(*) as total
FROM rankings
GROUP BY ranking_type;

-- ✅ PRONTO! Agora o frontend deve mostrar todos os jogadores!
-- Atualize a página do app e clique em "Atualizar Rankings"
