-- Atualizar IDs reais dos produtos na Hotmart
-- ATENÇÃO: hotmart_product_id deve ser o código do link de checkout (não o ID numérico interno)
-- Exemplo de link correto: https://pay.hotmart.com/CODIGO_AQUI
-- Para encontrar: Hotmart > Produto > Compartilhar > copiar o código após pay.hotmart.com/

-- Passo 1: Remover os registros com placeholder para recriar com os IDs corretos
DELETE FROM subscription_plans WHERE hotmart_product_id LIKE 'SEU_PRODUCT_ID%';

-- Passo 2: Inserir com os IDs reais
INSERT INTO subscription_plans (name, description, price_brl, duration_days, hotmart_product_id, hotmart_offer_code, features, is_active)
VALUES 
  (
    'Mensal',
    'Acesso completo por 30 dias',
    39.90,
    30,
    '7196326',
    NULL,
    '["Treinos personalizados", "Planos nutricionais", "Ranking nacional", "Portfólio profissional", "Suporte prioritário"]'::jsonb,
    true
  ),
  (
    'Trimestral',
    'Acesso completo por 90 dias - Apenas R$ 33,30/mês',
    99.90,
    90,
    '7196731',
    NULL,
    '["Treinos personalizados", "Planos nutricionais", "Ranking nacional", "Portfólio profissional", "Suporte prioritário", "Economia de 16%"]'::jsonb,
    true
  ),
  (
    'Semestral',
    'Acesso completo por 6 meses - Melhor custo-benefício',
    189.90,
    180,
    '7196777',
    NULL,
    '["Treinos personalizados", "Planos nutricionais", "Ranking nacional", "Portfólio profissional", "Suporte prioritário", "Economia de 21%", "Bônus exclusivos"]'::jsonb,
    true
  )
ON CONFLICT (hotmart_product_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_brl = EXCLUDED.price_brl,
  duration_days = EXCLUDED.duration_days,
  hotmart_offer_code = EXCLUDED.hotmart_offer_code,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Verificar resultado
SELECT name, price_brl, hotmart_product_id, is_active FROM subscription_plans ORDER BY price_brl;
