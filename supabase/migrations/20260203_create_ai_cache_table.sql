-- =============================================
-- AI Cache Table - YM Sports
-- Data: 03/02/2026
-- Objetivo: Cachear respostas da OpenAI
-- Economia esperada: 30-50% nos custos
-- =============================================

-- Criar tabela de cache
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT UNIQUE NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('training', 'nutrition')),
  user_params JSONB NOT NULL,
  response JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_type ON ai_cache(prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_created ON ai_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_hit_count ON ai_cache(hit_count DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_ai_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_cache_updated_at
  BEFORE UPDATE ON ai_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_cache_updated_at();

-- RLS (Row Level Security)
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ler o cache (é público/compartilhado)
CREATE POLICY "Anyone can read ai_cache" ON ai_cache
  FOR SELECT USING (true);

-- Política: apenas sistema pode escrever
CREATE POLICY "Service role can write ai_cache" ON ai_cache
  FOR ALL USING (true);

-- Comentários
COMMENT ON TABLE ai_cache IS 'Cache de respostas da OpenAI para economizar custos';
COMMENT ON COLUMN ai_cache.prompt_hash IS 'Hash único do prompt (baseado nos parâmetros)';
COMMENT ON COLUMN ai_cache.hit_count IS 'Número de vezes que este cache foi utilizado';

-- Função para limpar cache antigo (executar mensalmente)
CREATE OR REPLACE FUNCTION clean_old_ai_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_cache
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND hit_count < 2; -- Manter entradas populares
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
