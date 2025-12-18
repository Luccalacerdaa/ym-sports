import { createClient } from '@supabase/supabase-js';

// Verificar variáveis de ambiente
if (!process.env.VITE_SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL não configurado');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado');
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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
    // Verificar se variáveis estão configuradas
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis não configuradas no Vercel');
      return res.status(500).json({ 
        error: 'Variáveis de ambiente não configuradas. Configure no Vercel: Settings → Environment Variables',
        docs: 'Veja CONFIGURAR_VERCEL_AGORA.md',
        configured: {
          supabaseUrl: !!process.env.VITE_SUPABASE_URL,
          supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });
    }

    const { user_id, subscription } = req.body;

    if (!user_id || !subscription) {
      return res.status(400).json({ error: 'user_id and subscription required' });
    }

    console.log(`📝 Salvando subscription para user: ${user_id}`);

    // Verificar se já existe uma subscription com este endpoint
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user_id)
      .eq('endpoint', subscription.endpoint)
      .single();

    if (existing) {
      // Atualizar subscription existente
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
      console.log('✅ Subscription atualizada');
    } else {
      // Criar nova subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        });

      if (error) throw error;
      console.log('✅ Nova subscription criada');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao salvar subscription:', error);
    return res.status(500).json({ error: error.message });
  }
};

