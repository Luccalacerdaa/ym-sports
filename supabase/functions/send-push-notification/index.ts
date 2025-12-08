// Edge Function para enviar Push Notifications - YM Sports
// Deploy: supabase functions deploy send-push-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = 'BDccAmSWepZa8p4veXdgB1lHFqbe8rYAES_CgFX30H-So64CED0YyLLqUAHuVP4lNk05aad5GqN6vWfZwrjQAqw';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'V6oYbeMc7mPO4f7nGc_KnK9DhxoIU0Seeoj7g1qeDy0';

// Importar web-push
// @ts-ignore
import webpush from 'npm:web-push@3.6.6';

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:your-email@example.com',
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

interface NotificationRequest {
  userId?: string;      // Enviar para um usuário específico
  userIds?: string[];   // Enviar para múltiplos usuários
  all?: boolean;        // Enviar para todos
  payload: PushPayload;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const request: NotificationRequest = await req.json();
    const { userId, userIds, all, payload } = request;

    console.log('📨 Enviando push notifications...');
    console.log('Payload:', payload);

    // Buscar subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }
    // Se all=true, busca todas as subscriptions

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar subscriptions:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ Nenhuma subscription encontrada');
      return new Response(
        JSON.stringify({ message: 'Nenhuma subscription encontrada', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Enviando para ${subscriptions.length} subscriptions...`);

    // Preparar payload
    const pushPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/icon-96.png',
      tag: payload.tag || `notification-${Date.now()}`,
      data: {
        url: payload.url || '/dashboard'
      }
    };

    // Enviar para cada subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription);
          await webpush.sendNotification(subscription, JSON.stringify(pushPayload));
          console.log(`✅ Enviado para user_id: ${sub.user_id}`);
          return { success: true, userId: sub.user_id };
        } catch (error) {
          console.error(`❌ Erro ao enviar para user_id: ${sub.user_id}`, error);
          
          // Se a subscription expirou ou é inválida, remover do banco
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`🗑️ Removendo subscription inválida: ${sub.user_id}`);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
          
          return { success: false, userId: sub.user_id, error: error.message };
        }
      })
    );

    // Contar sucessos e falhas
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    console.log(`✅ Enviado com sucesso: ${successful}`);
    console.log(`❌ Falhas: ${failed}`);

    return new Response(
      JSON.stringify({
        message: 'Push notifications enviadas',
        sent: successful,
        failed: failed,
        total: subscriptions.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na função:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
