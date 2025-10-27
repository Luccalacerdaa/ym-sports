import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    const { user_id, title, body, url, icon, data } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({ 
        error: 'user_id and title are required' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar todas as inscrições do usuário
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (fetchError) {
      console.error('Erro ao buscar inscrições:', fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Nenhuma inscrição encontrada para este usuário'
      });
    }

    // Preparar payload da notificação
    const payload = JSON.stringify({
      title,
      body: body || '',
      icon: icon || 'https://ym-sports.vercel.app/icons/logo.png',
      url: url || 'https://ym-sports.vercel.app/dashboard',
      data: data || {},
      timestamp: Date.now()
    });

    console.log(`Enviando notificação para ${subscriptions.length} dispositivo(s)...`);

    // Enviar notificação para cada inscrição do usuário
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          console.log(`📤 Tentando enviar para: ${sub.endpoint.substring(0, 80)}...`);
          console.log(`📋 Payload:`, JSON.parse(payload));
          
          const result = await webpush.sendNotification(sub.subscription_data, payload);
          
          console.log(`✅ Web-push diz: SUCESSO para ${sub.endpoint.substring(0, 50)}...`);
          console.log(`📊 Status code:`, result.statusCode);
          console.log(`📄 Headers:`, result.headers);
          
          return { success: true, endpoint: sub.endpoint, statusCode: result.statusCode };
        } catch (error: any) {
          console.error(`❌ ERRO ao enviar para: ${sub.endpoint.substring(0, 50)}...`);
          console.error(`   Mensagem:`, error.message);
          console.error(`   Status:`, error.statusCode);
          console.error(`   Body:`, error.body);
          
          // Se a inscrição está inválida (410 Gone ou 404 Not Found), remover do banco
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`🗑️ Removendo inscrição inválida: ${sub.id}`);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
          
          return { success: false, endpoint: sub.endpoint, error: error.message, statusCode: error.statusCode };
        }
      })
    );

    // Contar sucessos e falhas
    const successful = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;
    
    const failed = results.length - successful;

    console.log(`📊 Resultados: ${successful} enviadas, ${failed} falharam`);

    return res.status(200).json({
      success: successful > 0,
      sent: successful,
      failed,
      total: subscriptions.length,
      message: `${successful} notificação(ões) enviada(s) com sucesso`
    });
  } catch (error: any) {
    console.error('Erro no send-notification-to-user:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

