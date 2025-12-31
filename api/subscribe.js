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
    // ========================================
    // INICIALIZAR SUPABASE AQUI
    // ========================================
    console.log('🔧 Inicializando Supabase...');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('📋 Verificando variáveis:');
    console.log('  - SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');

    // Verificar se variáveis estão configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis não configuradas no Vercel');
      return res.status(500).json({ 
        error: 'Variáveis de ambiente não configuradas. Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel.',
        configured: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseServiceKey
        }
      });
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Cliente Supabase criado');

    // ========================================
    // PROCESSAR SUBSCRIPTION
    // ========================================

    const { user_id, subscription } = req.body;

    if (!user_id || !subscription) {
      return res.status(400).json({ error: 'user_id and subscription required' });
    }

    console.log(`📝 Salvando subscription para user: ${user_id}`);
    console.log(`📍 Endpoint: ${subscription.endpoint.substring(0, 60)}...`);

    // PASSO 1: Verificar se este endpoint já existe para QUALQUER usuário
    const { data: anyExisting } = await supabase
      .from('push_subscriptions')
      .select('id, user_id')
      .eq('endpoint', subscription.endpoint);

    if (anyExisting && anyExisting.length > 0) {
      console.log(`🔍 Endpoint já existe! Encontradas ${anyExisting.length} ocorrências`);
      
      // Se o endpoint já pertence a OUTRO usuário, remover
      const otherUsers = anyExisting.filter(sub => sub.user_id !== user_id);
      if (otherUsers.length > 0) {
        console.log(`🗑️ Removendo ${otherUsers.length} subscription(s) de outros usuários`);
        for (const otherSub of otherUsers) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', otherSub.id);
          console.log(`  ✅ Removido de user: ${otherSub.user_id.substring(0, 8)}...`);
        }
      }

      // Verificar se já existe para este usuário
      const userExisting = anyExisting.find(sub => sub.user_id === user_id);
      
      if (userExisting) {
        // Atualizar subscription existente para este usuário
        const { error } = await supabase
          .from('push_subscriptions')
          .update({
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            updated_at: new Date().toISOString()
          })
          .eq('id', userExisting.id);

        if (error) throw error;
        console.log('✅ Subscription atualizada para este usuário');
        return res.status(200).json({ success: true, action: 'updated' });
      }
    }

    // PASSO 2: Criar nova subscription para este usuário
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
    return res.status(200).json({ success: true, action: 'created' });
  } catch (error) {
    console.error('❌ Erro ao salvar subscription:', error);
    return res.status(500).json({ error: error.message });
  }
};

