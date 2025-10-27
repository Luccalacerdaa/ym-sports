import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, endpoint } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Se endpoint é fornecido, remove apenas essa inscrição específica
    // Caso contrário, remove todas as inscrições do usuário
    let query = supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user_id);

    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }

    const { error } = await query;

    if (error) {
      console.error('Erro ao remover inscrição:', error);
      throw error;
    }

    return res.status(200).json({ 
      success: true,
      message: 'Inscrição removida com sucesso'
    });
  } catch (error: any) {
    console.error('Erro no remove-subscription:', error);
    return res.status(500).json({ error: error.message });
  }
}

