import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:suporte@ymsports.com',
  process.env.VITE_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, title, body, url } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({ error: 'user_id and title required' });
    }

    // Buscar subscriptions do usuário
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;

    if (!subs || subs.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhuma subscription encontrada. Ative o Push nas Configurações.',
        sent: 0,
        failed: 0,
        total: 0
      });
    }

    const payload = JSON.stringify({
      title,
      body: body || '',
      url: url || '/dashboard',
      icon: '/icons/icon-192.png'
    });

    let sent = 0;
    let failed = 0;

    // Enviar para cada subscription
    for (const sub of subs) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        console.log(`📤 Tentando enviar para: ${sub.endpoint.substring(0, 50)}...`);
        await webpush.sendNotification(pushSubscription, payload);
        sent++;
        console.log(`✅ Enviado com sucesso!`);
      } catch (error: any) {
        failed++;
        console.error(`❌ Erro ao enviar:`, {
          statusCode: error.statusCode,
          message: error.message,
          endpoint: sub.endpoint.substring(0, 50) + '...'
        });
        
        // Se a subscription está inválida (410, 404 ou outros erros de push), remover
        if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 400) {
          console.log(`🗑️ Removendo subscription inválida (status: ${error.statusCode})`);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
          console.log(`✅ Subscription removida`);
        }
      }
    }

    return res.status(200).json({
      success: sent > 0,
      sent,
      failed,
      total: subs.length
    });
  } catch (error: any) {
    console.error('Erro no notify:', error);
    return res.status(500).json({ error: error.message });
  }
}

