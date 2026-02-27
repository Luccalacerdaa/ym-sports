-- Atualizar offer codes dos planos Trimestral e Semestral
UPDATE subscription_plans SET hotmart_offer_code = 'oqu2blky' WHERE name = 'Trimestral';
UPDATE subscription_plans SET hotmart_offer_code = 'lpzvw837' WHERE name = 'Semestral';

-- Verificar resultado final
SELECT name, price_brl, hotmart_product_id, hotmart_checkout_code, hotmart_offer_code
FROM subscription_plans
ORDER BY price_brl;
