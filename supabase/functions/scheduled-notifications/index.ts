// Edge Function para Notificações Agendadas - YM Sports
// Esta função deve ser chamada por um cron job nos horários específicos
// Deploy: supabase functions deploy scheduled-notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const PUSH_FUNCTION_URL = Deno.env.get('SUPABASE_URL') + '/functions/v1/send-push-notification';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Cronograma de notificações
const NOTIFICATIONS: Record<string, { title: string; body: string }> = {
  '07:00': { 
    title: '💪 Bom dia, atleta!', 
    body: 'Hora de começar o dia com energia!' 
  },
  '08:30': { 
    title: '🏃‍♂️ Treino te espera', 
    body: 'Seu treino personalizado está disponível!' 
  },
  '12:00': { 
    title: '🥗 Hora do almoço', 
    body: 'Cuide da sua alimentação!' 
  },
  '15:30': { 
    title: '🎯 Foco no objetivo', 
    body: 'Continue firme nos seus sonhos!' 
  },
  '18:30': { 
    title: '🌟 Fim de dia', 
    body: 'Que tal um treino noturno?' 
  },
  '20:00': { 
    title: '🏆 Ranking', 
    body: 'Veja sua posição no ranking!' 
  }
};

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticação (secret key para cron jobs)
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter horário atual (formato HH:MM)
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`⏰ Verificando notificação para ${currentTime}...`);

    // Verificar se há notificação para este horário
    const notification = NOTIFICATIONS[currentTime];
    
    if (!notification) {
      console.log(`ℹ️ Nenhuma notificação agendada para ${currentTime}`);
      return new Response(
        JSON.stringify({ 
          message: `Nenhuma notificação agendada para ${currentTime}`,
          time: currentTime 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Enviando notificação: ${notification.title}`);

    // Chamar a função de push notification
    const response = await fetch(PUSH_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        all: true, // Enviar para todos os usuários
        payload: {
          title: notification.title,
          body: notification.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: `scheduled-${currentTime}`,
          url: '/dashboard'
        }
      })
    });

    const result = await response.json();
    
    console.log('✅ Resultado:', result);

    return new Response(
      JSON.stringify({
        message: 'Notificação agendada enviada',
        time: currentTime,
        notification: notification,
        result: result
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
