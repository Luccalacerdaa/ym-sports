-- Tabela para armazenar push subscriptions dos usuários
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para buscar por user_id
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Índice para buscar por endpoint
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias subscriptions  
CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias subscriptions
CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE push_subscriptions IS 'Armazena subscriptions de Web Push Notifications';
COMMENT ON COLUMN push_subscriptions.subscription IS 'Objeto de subscription completo em JSON';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Endpoint da subscription para busca rápida';
