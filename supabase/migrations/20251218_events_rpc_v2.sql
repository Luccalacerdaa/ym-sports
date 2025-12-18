-- ===================================================================
-- FUNÇÃO RPC PARA BUSCAR EVENTOS PRÓXIMOS (VERSÃO 2 - SIMPLIFICADA)
-- ===================================================================
-- Esta função permite que o GitHub Actions busque eventos próximos
-- fazendo bypass do RLS (Row Level Security)
-- ===================================================================

-- 1. Deletar função anterior se existir
DROP FUNCTION IF EXISTS get_upcoming_events(INTEGER);

-- 2. Criar função com estrutura mais simples
CREATE OR REPLACE FUNCTION get_upcoming_events(minutes_ahead INTEGER DEFAULT 30)
RETURNS JSON
SECURITY DEFINER  -- Roda com permissões do owner (bypass RLS)
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  -- Buscar eventos e converter para JSON
  SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json)
  INTO result
  FROM (
    SELECT 
      id,
      user_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      opponent
    FROM events
    WHERE 
      start_date >= NOW() 
      AND start_date <= (NOW() + (minutes_ahead || ' minutes')::INTERVAL)
    ORDER BY start_date ASC
  ) e;
  
  RETURN result;
END;
$$;

-- 3. Dar permissões explícitas para anon e authenticated
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO service_role;

-- 4. Comentário
COMMENT ON FUNCTION get_upcoming_events(INTEGER) IS 'Busca eventos próximos para notificações (v2 - retorna JSON)';

-- 5. Teste rápido (deve retornar [] se não houver eventos)
SELECT get_upcoming_events(30);

