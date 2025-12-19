import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Cronograma de notificações diárias (constante, pode ficar fora)
const DAILY_SCHEDULE = {
  '07:00': { title: "💪 Bom dia, atleta!", body: "Hora de começar o dia com energia!", url: "/dashboard" },
  '09:00': { title: "💧 Hora da Hidratação!", body: "Beba água para manter o foco e a energia!", url: "/dashboard/nutrition" },
  '11:30': { title: "🏋️ Hora do Treino!", body: "Seu treino personalizado está disponível!", url: "/dashboard/training" },
  '14:00': { title: "💧 Hidratação!", body: "Não se esqueça de beber água!", url: "/dashboard/nutrition" },
  '17:00': { title: "🏃‍♂️ Treino da Tarde!", body: "Que tal um treino agora? Você consegue!", url: "/dashboard/training" },
  '19:00': { title: "💧 Última Hidratação!", body: "Mantenha-se hidratado até o fim do dia!", url: "/dashboard/nutrition" },
  '21:00': { title: "🌙 Boa Noite!", body: "Descanse bem para conquistar seus objetivos amanhã!", url: "/dashboard/motivational" }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📅 VERCEL CRON - Notificações Diárias');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ✅ Ler variáveis de ambiente DENTRO do handler (necessário para Vercel)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webPushVapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const webPushVapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const webPushContact = process.env.WEB_PUSH_CONTACT;

  // Debug das variáveis
  console.log('🔍 Verificando variáveis de ambiente:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✓ Configurada' : '✗ Faltando'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✓ Configurada' : '✗ Faltando'}`);
  console.log(`   NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${webPushVapidPublicKey ? '✓ Configurada' : '✗ Faltando'}`);
  console.log(`   VAPID_PRIVATE_KEY: ${webPushVapidPrivateKey ? '✓ Configurada' : '✗ Faltando'}`);
  console.log(`   WEB_PUSH_CONTACT: ${webPushContact ? '✓ Configurada' : '✗ Faltando'}`);

  // Validar variáveis de ambiente
  if (!supabaseUrl || !supabaseServiceKey || !webPushVapidPublicKey || !webPushVapidPrivateKey || !webPushContact) {
    console.error('❌ Variáveis de ambiente não configuradas completamente');
    return res.status(500).json({ 
      error: 'Environment variables not configured',
      missing: {
        supabaseUrl: !supabaseUrl,
        supabaseServiceKey: !supabaseServiceKey,
        webPushVapidPublicKey: !webPushVapidPublicKey,
        webPushVapidPrivateKey: !webPushVapidPrivateKey,
        webPushContact: !webPushContact
      }
    });
  }

  // ✅ Inicializar Supabase DENTRO do handler
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ✅ Inicializar Web-Push DENTRO do handler
  webpush.setVapidDetails(
    webPushContact,
    webPushVapidPublicKey,
    webPushVapidPrivateKey
  );

  try {
    // Pegar horário atual (UTC)
    const now = new Date();
    const currentTimeUTC = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
    
    // Pegar horário BRT (UTC-3)
    const brTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const currentTimeBRT = `${brTime.getHours().toString().padStart(2, '0')}:${brTime.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`🕐 Horário UTC: ${currentTimeUTC}`);
    console.log(`🇧🇷 Horário BRT: ${currentTimeBRT}`);

    // Encontrar notificação para este horário (BRT)
    let notificationData = null;
    let scheduleKey = null;

    // Verificar horário exato
    if (DAILY_SCHEDULE[currentTimeBRT]) {
      notificationData = DAILY_SCHEDULE[currentTimeBRT];
      scheduleKey = currentTimeBRT;
    }

    // Se não encontrou, pode ser que esteja próximo (tolerância de 1 minuto)
    if (!notificationData) {
      for (const [time, data] of Object.entries(DAILY_SCHEDULE)) {
        const [scheduleHour, scheduleMin] = time.split(':').map(Number);
        const scheduleTotalMin = scheduleHour * 60 + scheduleMin;
        const currentTotalMin = brTime.getHours() * 60 + brTime.getMinutes();
        
        // Tolerância de ±1 minuto
        if (Math.abs(scheduleTotalMin - currentTotalMin) <= 1) {
          notificationData = data;
          scheduleKey = time;
          console.log(`⚠️ Usando tolerância de 1min: ${time} ≈ ${currentTimeBRT}`);
          break;
        }
      }
    }

    if (!notificationData) {
      console.log(`ℹ️ Nenhuma notificação agendada para ${currentTimeBRT} BRT`);
      return res.status(200).json({
        success: true,
        message: 'No notification scheduled for this time',
        current_time_brt: currentTimeBRT,
        schedule: Object.keys(DAILY_SCHEDULE)
      });
    }

    console.log(`📢 Notificação encontrada para ${scheduleKey}:`);
    console.log(`   📝 Título: ${notificationData.title}`);
    console.log(`   💬 Corpo: ${notificationData.body}`);

    // Buscar todos os usuários com push ativo
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth');

    if (subError) {
      console.error('❌ Erro ao buscar subscriptions:', subError);
      return res.status(500).json({ error: 'Failed to fetch subscriptions', details: subError.message });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ Nenhum usuário com push ativo encontrado');
      return res.status(200).json({
        success: true,
        message: 'No active subscriptions',
        scheduled_time: scheduleKey,
        users_notified: 0
      });
    }

    console.log(`👥 ${subscriptions.length} subscriptions encontradas`);

    let successCount = 0;
    let failCount = 0;
    const results = [];

    // Enviar notificação para cada subscription
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: notificationData.title,
            body: notificationData.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            tag: `daily-${scheduleKey.replace(':', '')}`,
            url: notificationData.url,
          })
        );

        console.log(`   ✅ Enviado para: ${sub.user_id.substring(0, 20)}...`);
        successCount++;
        results.push({ user_id: sub.user_id, status: 'success' });

      } catch (pushError) {
        console.error(`   ❌ Erro para ${sub.user_id.substring(0, 20)}...:`, pushError.message);
        failCount++;
        results.push({ user_id: sub.user_id, status: 'failed', error: pushError.message });

        // Se o erro for 410 Gone (subscription expirada), remover do banco
        if (pushError.statusCode === 410) {
          console.log(`   🗑️ Removendo subscription expirada`);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PROCESSAMENTO CONCLUÍDO');
    console.log(`📊 Total de subscriptions: ${subscriptions.length}`);
    console.log(`📤 Enviadas com sucesso: ${successCount}`);
    console.log(`❌ Falhas: ${failCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return res.status(200).json({
      success: true,
      scheduled_time_brt: scheduleKey,
      notification: {
        title: notificationData.title,
        body: notificationData.body,
      },
      stats: {
        total_subscriptions: subscriptions.length,
        sent: successCount,
        failed: failCount,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Erro geral no Vercel Cron:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

