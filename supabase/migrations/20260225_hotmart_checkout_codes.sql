-- Adicionar coluna hotmart_checkout_code para links de checkout (go.hotmart.com)
-- hotmart_product_id = ID numérico interno (usado para matching no webhook)
-- hotmart_checkout_code = código do go.hotmart.com (usado para gerar link de compra)

ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS hotmart_checkout_code TEXT;

-- Atualizar os 3 planos com IDs e códigos reais
UPDATE subscription_plans SET
  hotmart_product_id = '7196326',
  hotmart_checkout_code = 'W104403854A'
WHERE name = 'Mensal';

UPDATE subscription_plans SET
  hotmart_product_id = '7196731',
  hotmart_checkout_code = 'N104404912H'
WHERE name = 'Trimestral';

UPDATE subscription_plans SET
  hotmart_product_id = '7196777',
  hotmart_checkout_code = 'Q104405037F'
WHERE name = 'Semestral';

-- Verificar resultado
SELECT name, price_brl, hotmart_product_id, hotmart_checkout_code FROM subscription_plans ORDER BY price_brl;
