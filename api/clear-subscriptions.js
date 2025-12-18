const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
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
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    console.log(`🗑️ Removendo subscriptions para user: ${user_id}`);

    // Remover todas as subscriptions do usuário
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;

    console.log('✅ Subscriptions removidas com sucesso');

    return res.status(200).json({
      success: true,
      message: 'Subscriptions removidas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao limpar subscriptions:', error);
    return res.status(500).json({ error: error.message });
    }
};

