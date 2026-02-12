-- Sistema de Assinaturas e Pagamentos
-- Integração com Hotmart

-- Tabela de planos disponíveis
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_brl DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL, -- 30, 90, 365
  hotmart_product_id TEXT UNIQUE, -- ID do produto na Hotmart
  hotmart_offer_code TEXT, -- Código da oferta na Hotmart
  features JSONB DEFAULT '[]'::jsonb, -- Lista de features do plano
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  
  -- Status da assinatura
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, cancelled, expired, refunded
  
  -- Datas
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Informações de pagamento (Hotmart)
  hotmart_transaction_id TEXT UNIQUE,
  hotmart_subscriber_code TEXT,
  hotmart_purchase_date TIMESTAMPTZ,
  
  -- Informações do afiliado (se houver)
  affiliate_code TEXT,
  affiliate_name TEXT,
  affiliate_commission_percentage DECIMAL(5,2),
  
  -- Histórico
  payment_method TEXT, -- credit_card, pix, boleto
  amount_paid DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Informações extras do webhook
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de histórico de pagamentos/eventos da Hotmart
CREATE TABLE IF NOT EXISTS hotmart_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- PURCHASE_COMPLETE, SUBSCRIPTION_CANCELLATION, etc
  transaction_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  
  -- Payload completo do webhook
  payload JSONB NOT NULL,
  
  -- Status do processamento
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  received_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_affiliate ON user_subscriptions(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_hotmart_webhooks_transaction ON hotmart_webhooks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_webhooks_user ON hotmart_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_webhooks_processed ON hotmart_webhooks(processed);

-- Índice único parcial: usuário só pode ter uma assinatura ativa por vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_unique_active 
  ON user_subscriptions(user_id) 
  WHERE status = 'active';

-- RLS (Row Level Security)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotmart_webhooks ENABLE ROW LEVEL SECURITY;

-- Policies para subscription_plans
DROP POLICY IF EXISTS "Anyone can view plans" ON subscription_plans;
CREATE POLICY "Anyone can view plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Policies para user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Service can manage subscriptions"
  ON user_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policies para hotmart_webhooks (apenas service role)
DROP POLICY IF EXISTS "Service can manage webhooks" ON hotmart_webhooks;
CREATE POLICY "Service can manage webhooks"
  ON hotmart_webhooks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Função para verificar se usuário tem assinatura ativa
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_subscriptions 
    WHERE user_id = p_user_id 
      AND status = 'active' 
      AND expires_at > NOW()
  );
END;
$$;

-- Função para expirar assinaturas vencidas (executar via cron)
CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE user_subscriptions
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Inserir planos iniciais (adapte conforme seus planos reais da Hotmart)
INSERT INTO subscription_plans (name, description, price_brl, duration_days, hotmart_product_id, hotmart_offer_code, features, is_active)
VALUES 
  (
    'Mensal',
    'Acesso completo por 30 dias',
    39.90,
    30,
    'SEU_PRODUCT_ID_HOTMART_MENSAL',
    'OFFER_CODE_MENSAL',
    '["Treinos personalizados", "Planos nutricionais", "Ranking nacional", "Portfólio profissional", "Suporte prioritário"]'::jsonb,
    true
  ),
  (
    'Trimestral',
    'Acesso completo por 90 dias - Apenas R$ 33,30/mês',
    99.90,
    90,
    'SEU_PRODUCT_ID_HOTMART_TRIMESTRAL',
    'OFFER_CODE_TRIMESTRAL',
    '["Treinos personalizados", "Planos nutricionais", "Ranking nacional", "Portfólio profissional", "Suporte prioritário", "Economia de 16%"]'::jsonb,
    true
  ),
  (
    'Semestral',
    'Acesso completo por 6 meses - Melhor custo-benefício',
    189.90,
    180,
    'SEU_PRODUCT_ID_HOTMART_SEMESTRAL',
    'OFFER_CODE_SEMESTRAL',
    '["Treinos personalizados", "Planos nutricionais", "Ranking nacional", "Portfólio profissional", "Suporte prioritário", "Economia de 21%", "Bônus exclusivos"]'::jsonb,
    true
  )
ON CONFLICT (hotmart_product_id) DO NOTHING;

COMMENT ON TABLE subscription_plans IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE user_subscriptions IS 'Assinaturas ativas e históricas dos usuários';
COMMENT ON TABLE hotmart_webhooks IS 'Log de todos os eventos recebidos da Hotmart';
COMMENT ON COLUMN user_subscriptions.affiliate_code IS 'Código do afiliado que gerou a venda';
