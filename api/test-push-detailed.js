import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Inicializar Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        configured: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseServiceKey,
          vapidPublic: !!vapidPublicKey,
          vapidPrivate: !!vapidPrivateKey
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    webpush.setVapidDetails('mailto:suporte@ymsports.com', vapidPublicKey, vapidPrivateKey);

    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    console.log(`🧪 TESTE DETALHADO - User: ${user_id}`);

    // Buscar subscriptions do usuário
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      console.error('Erro ao buscar subscriptions:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!subs || subs.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhuma subscription encontrada',
        user_id 
      });
    }

    console.log(`📱 Encontradas ${subs.length} subscription(s)`);

    const payload = JSON.stringify({
      title: '🧪 Teste Detalhado YM Sports',
      body: 'Esta é uma notificação de teste com diagnóstico completo',
      url: '/dashboard',
      icon: '/icons/icon-192.png',
      timestamp: new Date().toISOString()
    });

    const results = [];

    // Testar cada subscription com detalhes completos
    for (const sub of subs) {
      const result = {
        subscription_id: sub.id,
        endpoint_preview: sub.endpoint.substring(0, 60) + '...',
        created_at: sub.created_at,
        updated_at: sub.updated_at,
        is_old_system: !sub.updated_at
      };

      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        console.log(`📤 Testando envio para: ${sub.endpoint.substring(0, 50)}...`);
        
        const pushResponse = await webpush.sendNotification(pushSubscription, payload);
        
        result.status = 'success';
        result.http_status = pushResponse.statusCode;
        result.response_body = pushResponse.body;
        result.headers = pushResponse.headers;
        
        console.log(`✅ Enviado! Status: ${pushResponse.statusCode}`);
      } catch (error) {
        result.status = 'failed';
        result.error_message = error.message;
        result.error_code = error.statusCode;
        result.error_body = error.body;
        result.error_stack = error.stack;
        
        console.error(`❌ Erro ao enviar:`, {
          statusCode: error.statusCode,
          message: error.message,
          body: error.body
        });

        // Se a subscription está inválida, marcar para remoção
        if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 400) {
          result.action_taken = 'removed_from_database';
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
          console.log(`🗑️ Subscription inválida removida`);
        }
      }

      results.push(result);
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return res.status(200).json({
      success: successCount > 0,
      summary: {
        total_subscriptions: subs.length,
        sent_successfully: successCount,
        failed: failedCount
      },
      detailed_results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
};

