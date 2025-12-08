// Vercel Serverless Function para enviar Push Notifications
// URL: https://ym-sports.vercel.app/api/send-push

import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC_KEY = 'BDccAmSWepZa8p4veXdgB1lHFqbe8rYAES_CgFX30H-So64CED0YyLLqUAHuVP4lNk05aad5GqN6vWfZwrjQAqw';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'V6oYbeMc7mPO4f7nGc_KnK9DhxoIU0Seeoj7g1qeDy0';
const CRON_SECRET = process.env.CRON_SECRET || 'ym-sports-cron-2024';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:contato@ymsports.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
}

interface RequestBody {
  userId?: string;
  userIds?: string[];
  all?: boolean;
  payload: PushPayload;
  secret?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: RequestBody = req.body;

    // Verificar secret (proteção contra uso não autorizado)
    if (body.secret && body.secret !== CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Inicializar Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar subscriptions
    let query = supabase.from('push_subscriptions').select('*');

    if (body.userId) {
      query = query.eq('user_id', body.userId);
    } else if (body.userIds && body.userIds.length > 0) {
      query = query.in('user_id', body.userIds);
    }
    // Se all=true, busca todas

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('Erro ao buscar subscriptions:', error);
      return res.status(500).json({ error: 'Erro ao buscar subscriptions' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ 
        message: 'Nenhuma subscription encontrada', 
        sent: 0 
      });
    }

    console.log(`Enviando para ${subscriptions.length} subscriptions...`);

    // Preparar payload
    const pushPayload = {
      title: body.payload.title,
      body: body.payload.body,
      icon: body.payload.icon || '/icons/icon-192.png',
      badge: body.payload.badge || '/icons/icon-96.png',
      tag: body.payload.tag || `notification-${Date.now()}`,
      data: {
        url: body.payload.url || '/dashboard'
      }
    };

    // Enviar para cada subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription);
          await webpush.sendNotification(subscription, JSON.stringify(pushPayload));
          console.log(`✅ Enviado para user: ${sub.user_id}`);
          return { success: true, userId: sub.user_id };
        } catch (error: any) {
          console.error(`❌ Erro para user: ${sub.user_id}`, error);

          // Se subscription expirou, remover do banco
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }

          return { success: false, userId: sub.user_id };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failed = results.length - successful;

    console.log(`✅ Sucesso: ${successful}, ❌ Falhas: ${failed}`);

    return res.status(200).json({
      message: 'Push notifications enviadas',
      sent: successful,
      failed: failed,
      total: subscriptions.length
    });

  } catch (error: any) {
    console.error('Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}
