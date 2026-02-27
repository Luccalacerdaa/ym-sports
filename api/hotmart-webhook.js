/**
 * Webhook da Hotmart - Processar eventos de pagamento
 * 
 * Configure este endpoint na Hotmart:
 * URL: https://ym-sports.vercel.app/api/hotmart-webhook
 * Eventos: PURCHASE_COMPLETE, SUBSCRIPTION_CANCELLATION, REFUND_REQUESTED
 */

import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💳 WEBHOOK HOTMART RECEBIDO');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Validação de segurança (opcional mas recomendado)
    const hotmartToken = req.headers['x-hotmart-hottok'];
    const expectedToken = process.env.HOTMART_WEBHOOK_TOKEN;
    
    if (expectedToken && hotmartToken !== expectedToken) {
      console.log('❌ Token inválido');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Payload da Hotmart
    const payload = req.body;
    const event = payload.event;
    
    console.log('📦 Evento:', event);
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));

    // Inicializar Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase não configurado');
      return res.status(500).json({ error: 'Configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair dados do payload (Hotmart v2.0.0)
    const data = payload.data || payload;
    const buyer = data.buyer || {};
    const product = data.product || {};
    const purchase = data.purchase || {};
    const affiliates = data.affiliates?.[0] || data.commissions?.[0] || {};
    
    // Transaction ID único da Hotmart
    const transactionId = purchase.transaction || data.transaction;
    
    // Extrair user_id via parâmetro sck (passado no checkout URL)
    // Na v2.0.0, o sck fica em purchase.origin.sck
    const userId = purchase.origin?.sck ||
                   purchase.tracking_parameters?.sck ||
                   data.tracking_parameters?.sck ||
                   purchase.custom_fields?.sck ||
                   data.custom_fields?.sck ||
                   null;

    console.log('🆔 Transaction ID:', transactionId);
    console.log('👤 User ID:', userId || 'NÃO INFORMADO');
    console.log('👥 Afiliado:', affiliates.affiliate_code || 'Venda direta');

    // Salvar webhook no histórico (sempre, mesmo que falhe)
    const { data: webhookRecord, error: webhookError } = await supabase
      .from('hotmart_webhooks')
      .insert({
        event_type: event,
        transaction_id: transactionId,
        user_id: userId,
        payload: payload,
        processed: false
      })
      .select()
      .single();

    if (webhookError) {
      console.error('❌ Erro ao salvar webhook:', webhookError);
    } else {
      console.log('✅ Webhook salvo no histórico:', webhookRecord.id);
    }

    // Processar evento
    let result;
    switch (event) {
      case 'PURCHASE_COMPLETE':
      case 'PURCHASE_APPROVED':
        // Cobre primeira compra E renovações automáticas (recurrence_number > 1)
        result = await handlePurchaseComplete(supabase, payload, userId, webhookRecord?.id);
        break;

      case 'SUBSCRIPTION_CANCELLATION':
      case 'PURCHASE_CANCELED':
      case 'PURCHASE_CHARGEBACK':
        result = await handleSubscriptionCancellation(supabase, payload, userId, webhookRecord?.id);
        break;
        
      case 'PURCHASE_REFUNDED':
      case 'REFUND_REQUESTED':
        result = await handleRefund(supabase, payload, userId, webhookRecord?.id);
        break;

      case 'SUBSCRIPTION_REACTIVATED':
        // Assinatura reativada após suspensão (ex: cartão atualizado)
        result = await handlePurchaseComplete(supabase, payload, userId, webhookRecord?.id);
        break;
        
      default:
        console.log(`⚠️ Evento não processado: ${event}`);
        result = { success: true, message: 'Event logged but not processed' };
    }

    // Atualizar status do webhook
    if (webhookRecord?.id) {
      await supabase
        .from('hotmart_webhooks')
        .update({
          processed: result.success,
          processed_at: new Date().toISOString(),
          error_message: result.error || null,
          subscription_id: result.subscriptionId || null
        })
        .eq('id', webhookRecord.id);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PROCESSAMENTO CONCLUÍDO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return res.status(200).json({
      success: true,
      event: event,
      processed: result.success,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Mapa fixo de product_id → plano (fallback quando subscription_plans não tem o dado)
const PRODUCT_PLAN_MAP = {
  '7196326': { name: 'mensal',     duration_days: 30,  price: 39.90 },
  '7196731': { name: 'trimestral', duration_days: 90,  price: 99.90 },
  '7196777': { name: 'semestral',  duration_days: 180, price: 189.90 },
};

// Handler: Compra completa — resiliente a falhas em tabelas auxiliares
async function handlePurchaseComplete(supabase, payload, userId, webhookId) {
  console.log('\n💰 Processando compra completa...');

  try {
    const data = payload.data || payload;
    const product = data.product || {};
    const purchase = data.purchase || {};
    const buyer = data.buyer || {};
    const affiliates = data.affiliates?.[0] || {};

    const transactionId = purchase.transaction || data.transaction;
    const productId = product.id?.toString();

    // ── 1. Identificar usuário ───────────────────────────────────────────
    let finalUserId = userId;
    let userCreatedNow = false;

    if (!finalUserId && buyer.email) {
      console.log('🔍 sck ausente (compra via link de afiliado), buscando por email:', buyer.email);

      // Tentar achar conta existente pelo email
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', buyer.email)
        .maybeSingle();

      if (profileByEmail) {
        finalUserId = profileByEmail.id;
        console.log('✅ Conta existente encontrada por email:', finalUserId);
      } else {
        // Usuário comprou sem ter conta no app → criar conta automaticamente
        console.log('📝 Usuário sem conta, criando automaticamente via admin...');
        try {
          const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: buyer.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { name: buyer.name || buyer.first_name || 'Atleta' }
          });

          if (createError) {
            console.error('❌ Erro ao criar usuário:', createError.message);
          } else if (newUser?.user) {
            finalUserId = newUser.user.id;
            userCreatedNow = true;
            console.log('✅ Conta criada automaticamente:', finalUserId);

            // Criar perfil básico
            await supabase.from('profiles').insert({
              id: finalUserId,
              name: buyer.name || buyer.first_name || 'Atleta',
              email: buyer.email,
            }).select().single();

            // TODO: Enviar email de boas-vindas com link para definir senha
            console.log('📧 Conta criada. Usuário precisa redefinir senha via:', buyer.email);
          }
        } catch (createErr) {
          console.error('❌ Exceção ao criar conta:', createErr.message);
        }
      }
    }

    if (!finalUserId) {
      console.error('❌ Usuário não identificado. sck:', userId, '| email:', buyer.email);
      // Salvar para processamento manual posterior
      return { success: false, error: 'User not found - manual activation needed' };
    }

    // ── 2. Determinar plano ──────────────────────────────────────────────
    // Tenta no banco primeiro; se falhar, usa mapa fixo como fallback
    let planInfo = PRODUCT_PLAN_MAP[productId];
    let planId = null;

    const { data: planFromDB } = await supabase
      .from('subscription_plans')
      .select('id, name, duration_days, price_brl')
      .eq('hotmart_product_id', productId)
      .maybeSingle();

    if (planFromDB) {
      console.log('📦 Plano encontrado no banco:', planFromDB.name);
      planId = planFromDB.id;
      planInfo = {
        name: planFromDB.name.toLowerCase(),
        duration_days: planFromDB.duration_days,
        price: planFromDB.price_brl,
      };
    } else {
      console.warn('⚠️ Plano não encontrado no banco para product_id:', productId, '— usando mapa fixo');
      if (!planInfo) {
        console.error('❌ Product ID desconhecido:', productId);
        planInfo = { name: 'mensal', duration_days: 30, price: 39.90 }; // safe default
      }
    }

    // ── 3. Calcular expiração ────────────────────────────────────────────
    const startDate = new Date();
    const expiresAt = new Date(startDate);
    expiresAt.setDate(expiresAt.getDate() + planInfo.duration_days);

    console.log('📅 Plano:', planInfo.name, '| Expira em:', expiresAt.toISOString());

    // ── 4. Atualizar profiles IMEDIATAMENTE (crítico para o SubscriptionGate) ──
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: planInfo.name,
        subscription_expires_at: expiresAt.toISOString(),
        hotmart_subscriber_code: data.subscription?.subscriber?.code || null,
      })
      .eq('id', finalUserId);

    if (profileError) {
      console.error('❌ CRÍTICO: Erro ao atualizar profile:', profileError.message, profileError);
    } else {
      console.log('✅ Profile atualizado com sucesso → subscription_status=active');
    }

    // ── 5. Registrar em user_subscriptions (histórico, não crítico para acesso) ──
    let subscriptionId = null;
    try {
      const upsertData = {
        user_id: finalUserId,
        status: 'active',
        started_at: startDate.toISOString(),
        expires_at: expiresAt.toISOString(),
        hotmart_transaction_id: transactionId,
        hotmart_subscriber_code: data.subscription?.subscriber?.code || null,
        hotmart_purchase_date: purchase.approved_date
          ? new Date(purchase.approved_date).toISOString()
          : startDate.toISOString(),
        affiliate_code: affiliates.affiliate_code || null,
        affiliate_name: affiliates.name || null,
        payment_method: purchase.payment?.type || null,
        amount_paid: purchase.price?.value || planInfo.price,
        currency: purchase.price?.currency_value || 'BRL',
        updated_at: new Date().toISOString(),
      };

      if (planId) upsertData.plan_id = planId;

      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .upsert(upsertData, { onConflict: 'hotmart_transaction_id', ignoreDuplicates: false })
        .select('id')
        .single();

      if (subError) {
        console.warn('⚠️ Erro ao registrar user_subscriptions (não crítico):', subError.message);
      } else {
        subscriptionId = subscription?.id;
        console.log('✅ user_subscriptions registrado:', subscriptionId);
      }
    } catch (subErr) {
      console.warn('⚠️ Exceção em user_subscriptions (não crítico):', subErr.message);
    }

    return {
      success: true,
      message: 'Subscription activated',
      subscriptionId,
      userId: finalUserId,
    };

  } catch (error) {
    console.error('❌ Erro crítico no handlePurchaseComplete:', error);
    return { success: false, error: error.message };
  }
}

// Handler: Cancelamento — robusto mesmo sem registro em user_subscriptions
async function handleSubscriptionCancellation(supabase, payload, userId, webhookId) {
  console.log('\n❌ Processando cancelamento/chargeback...');

  try {
    const data = payload.data || payload;
    const purchase = data.purchase || {};
    const buyer = data.buyer || {};
    const transactionId = purchase.transaction || data.transaction;

    // ── 1. Tentar atualizar user_subscriptions pelo transaction_id ──
    let finalUserId = userId;
    
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('hotmart_transaction_id', transactionId)
      .select('id, user_id')
      .maybeSingle();

    if (subscription?.user_id) {
      finalUserId = subscription.user_id;
      console.log('✅ user_subscriptions cancelada:', subscription.id);
    }

    // ── 2. Se não achou pelo transaction, tentar pelo sck ou email ──
    if (!finalUserId && buyer.email) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', buyer.email)
        .maybeSingle();
      if (profileByEmail) finalUserId = profileByEmail.id;
    }

    // ── 3. Atualizar profile ──
    if (finalUserId) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
        })
        .eq('id', finalUserId);
      console.log('✅ Profile atualizado → subscription_status=cancelled');
    } else {
      console.warn('⚠️ Usuário não identificado para cancelamento');
    }

    return { success: true, message: 'Subscription cancelled', subscriptionId: subscription?.id };

  } catch (error) {
    console.error('❌ Erro no handleSubscriptionCancellation:', error);
    return { success: false, error: error.message };
  }
}

// Handler: Reembolso
async function handleRefund(supabase, payload, userId, webhookId) {
  console.log('\n💸 Processando reembolso...');

  try {
    const data = payload.data || payload;
    const purchase = data.purchase || {};
    const buyer = data.buyer || {};
    const transactionId = purchase.transaction || data.transaction;

    let finalUserId = userId;

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .update({ status: 'refunded', updated_at: new Date().toISOString() })
      .eq('hotmart_transaction_id', transactionId)
      .select('id, user_id')
      .maybeSingle();

    if (subscription?.user_id) finalUserId = subscription.user_id;

    if (!finalUserId && buyer.email) {
      const { data: p } = await supabase.from('profiles').select('id').eq('email', buyer.email).maybeSingle();
      if (p) finalUserId = p.id;
    }

    if (finalUserId) {
      await supabase.from('profiles').update({ subscription_status: 'refunded' }).eq('id', finalUserId);
      console.log('✅ Reembolso processado, profile atualizado');
    }

    return { success: true, message: 'Refund processed', subscriptionId: subscription?.id };

  } catch (error) {
    console.error('❌ Erro no handleRefund:', error);
    return { success: false, error: error.message };
  }
}
