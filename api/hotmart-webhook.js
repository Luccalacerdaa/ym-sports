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

    // Extrair dados do payload
    const data = payload.data || payload;
    const buyer = data.buyer || {};
    const product = data.product || {};
    const purchase = data.purchase || {};
    const affiliates = data.affiliates || data.commissions?.[0] || {};
    
    // Transaction ID único da Hotmart
    const transactionId = purchase.transaction || data.transaction;
    
    // Extrair user_id customizado (passado no checkout)
    const userId = purchase.custom_fields?.sck_user_id || 
                   data.custom_fields?.sck_user_id ||
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
        result = await handlePurchaseComplete(supabase, payload, userId, webhookRecord?.id);
        break;
        
      case 'SUBSCRIPTION_CANCELLATION':
      case 'PURCHASE_CANCELED':
        result = await handleSubscriptionCancellation(supabase, payload, userId, webhookRecord?.id);
        break;
        
      case 'PURCHASE_REFUNDED':
      case 'REFUND_REQUESTED':
        result = await handleRefund(supabase, payload, userId, webhookRecord?.id);
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

// Handler: Compra completa
async function handlePurchaseComplete(supabase, payload, userId, webhookId) {
  console.log('\n💰 Processando compra completa...');

  try {
    const data = payload.data || payload;
    const product = data.product || {};
    const purchase = data.purchase || {};
    const buyer = data.buyer || {};
    const affiliates = data.affiliates || data.commissions?.[0] || {};
    
    const transactionId = purchase.transaction || data.transaction;
    const productId = product.id?.toString();
    const subscriberCode = data.subscriber_code || buyer.email;
    
    // Se não temos user_id, tentar buscar por email
    let finalUserId = userId;
    if (!finalUserId && buyer.email) {
      console.log('🔍 User ID não informado, buscando por email:', buyer.email);
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', buyer.email)
        .single();
      
      if (profile) {
        finalUserId = profile.user_id;
        console.log('✅ Usuário encontrado:', finalUserId);
      }
    }

    if (!finalUserId) {
      console.error('❌ Não foi possível identificar o usuário');
      return { 
        success: false, 
        error: 'User ID not found. Configure sck_user_id no checkout da Hotmart.' 
      };
    }

    // Buscar plano pelo product_id da Hotmart
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('hotmart_product_id', productId)
      .single();

    if (planError || !plan) {
      console.error('❌ Plano não encontrado:', productId);
      return { success: false, error: 'Plan not found' };
    }

    console.log('📦 Plano encontrado:', plan.name);

    // Calcular data de expiração
    const startDate = new Date();
    const expiresAt = new Date(startDate);
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    // Criar ou atualizar assinatura
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: finalUserId,
        plan_id: plan.id,
        status: 'active',
        started_at: startDate.toISOString(),
        expires_at: expiresAt.toISOString(),
        hotmart_transaction_id: transactionId,
        hotmart_subscriber_code: subscriberCode,
        hotmart_purchase_date: purchase.approved_date || new Date().toISOString(),
        affiliate_code: affiliates.affiliate_code || null,
        affiliate_name: affiliates.name || null,
        affiliate_commission_percentage: affiliates.commission_percentage || null,
        payment_method: purchase.payment_type || null,
        amount_paid: purchase.price?.value || plan.price_brl,
        currency: purchase.price?.currency_code || 'BRL',
        metadata: {
          hotmart_payload: payload,
          buyer_info: buyer
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'hotmart_transaction_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (subError) {
      console.error('❌ Erro ao criar assinatura:', subError);
      return { success: false, error: subError.message };
    }

    console.log('✅ Assinatura criada/atualizada:', subscription.id);
    console.log('📅 Válida até:', expiresAt.toISOString());
    
    if (affiliates.affiliate_code) {
      console.log('👥 Venda via afiliado:', affiliates.name, '(' + affiliates.affiliate_code + ')');
    } else {
      console.log('👥 Venda direta (sem afiliado)');
    }

    return { 
      success: true, 
      message: 'Subscription activated',
      subscriptionId: subscription.id,
      userId: finalUserId,
      affiliateCode: affiliates.affiliate_code
    };

  } catch (error) {
    console.error('❌ Erro no handlePurchaseComplete:', error);
    return { success: false, error: error.message };
  }
}

// Handler: Cancelamento
async function handleSubscriptionCancellation(supabase, payload, userId, webhookId) {
  console.log('\n❌ Processando cancelamento...');

  try {
    const data = payload.data || payload;
    const transactionId = data.transaction || data.purchase?.transaction;

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('hotmart_transaction_id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao cancelar:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Assinatura cancelada:', subscription.id);
    return { success: true, message: 'Subscription cancelled', subscriptionId: subscription.id };

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
    const transactionId = data.transaction || data.purchase?.transaction;

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('hotmart_transaction_id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao processar reembolso:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Reembolso processado:', subscription.id);
    return { success: true, message: 'Refund processed', subscriptionId: subscription.id };

  } catch (error) {
    console.error('❌ Erro no handleRefund:', error);
    return { success: false, error: error.message };
  }
}
