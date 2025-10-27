import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, subscription } = req.body;

    // Validar dados
    if (!user_id || !subscription) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'user_id e subscription são obrigatórios'
      });
    }

    if (!subscription.endpoint) {
      return res.status(400).json({ 
        error: 'Invalid subscription',
        message: 'subscription.endpoint é obrigatório'
      });
    }

    // Criar cliente Supabase com service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar se já existe inscrição para este usuário e endpoint
    const { data: existing, error: selectError } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user_id)
      .eq('endpoint', subscription.endpoint)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error('Erro ao verificar inscrição existente:', selectError);
      throw selectError;
    }

    if (existing) {
      // Atualizar inscrição existente
      console.log('Atualizando inscrição existente:', existing.id);
      
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          subscription_data: subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Erro ao atualizar inscrição:', updateError);
        throw updateError;
      }

      return res.status(200).json({ 
        success: true,
        message: 'Inscrição atualizada com sucesso',
        id: existing.id
      });
    } else {
      // Criar nova inscrição
      console.log('Criando nova inscrição para usuário:', user_id);
      
      const { data: newSubscription, error: insertError } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id,
          endpoint: subscription.endpoint,
          subscription_data: subscription,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar inscrição:', insertError);
        throw insertError;
      }

      return res.status(201).json({ 
        success: true,
        message: 'Inscrição criada com sucesso',
        id: newSubscription.id
      });
    }
  } catch (error: any) {
    console.error('Erro no save-subscription:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Erro ao salvar inscrição'
    });
  }
}

