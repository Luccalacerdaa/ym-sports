-- Atualizar offer codes para o modelo de produto único com 3 ofertas
-- Produto único: W104403854A (product_id: 7196326)
-- Os planos Trimestral e Semestral agora são OFERTAS do mesmo produto

UPDATE subscription_plans SET
  hotmart_checkout_code = 'W104403854A',
  hotmart_offer_code    = 'olbidtw7'
WHERE name = 'Mensal';

UPDATE subscription_plans SET
  hotmart_checkout_code = 'W104403854A',
  hotmart_offer_code    = 'fpxzoplr'
WHERE name = 'Trimestral';

UPDATE subscription_plans SET
  hotmart_checkout_code = 'W104403854A',
  hotmart_offer_code    = 'nh5b7zqg'
WHERE name = 'Semestral';

-- Confirmar resultado
SELECT name, price_brl, hotmart_product_id, hotmart_checkout_code, hotmart_offer_code
FROM subscription_plans
ORDER BY price_brl;
