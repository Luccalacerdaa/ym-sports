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
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    // Remover todas as subscriptions do usuário
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Subscriptions removidas com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao limpar subscriptions:', error);
    return res.status(500).json({ error: error.message });
  }
}

