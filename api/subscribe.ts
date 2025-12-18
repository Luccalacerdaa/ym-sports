import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, subscription } = req.body;

    if (!user_id || !subscription) {
      return res.status(400).json({ error: 'user_id and subscription required' });
    }

    const { endpoint, keys } = subscription;

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user_id)
      .eq('endpoint', endpoint)
      .single();

    if (existing) {
      // Atualizar
      await supabase
        .from('push_subscriptions')
        .update({
          p256dh: keys.p256dh,
          auth: keys.auth
        })
        .eq('id', existing.id);
    } else {
      // Criar novo
      await supabase
        .from('push_subscriptions')
        .insert({
          user_id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth
        });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Erro ao salvar subscription:', error);
    return res.status(500).json({ error: error.message });
  }
}

