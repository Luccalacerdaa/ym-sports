/**
 * Vercel Cron Job - Verificação de Eventos Próximos
 * 
 * Esta função é executada automaticamente a cada 5 minutos pelo Vercel Cron
 * Verifica eventos próximos e envia notificações push
 * 
 * Configurado em: vercel.json
 */

import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 60, // 60 segundos de timeout
};

export default async function handler(req, res) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 VERCEL CRON - Verificando eventos próximos');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Validar que é uma requisição de cron do Vercel
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;

  // Se CRON_SECRET estiver configurado, validar
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('❌ Unauthorized - Invalid cron secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Configurar Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Nome correto da variável

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
      return res.status(500).json({ 
        error: 'Supabase configuration missing',
        message: 'Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel'
      });
    }

    // Cliente Supabase com Service Role Key (bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar eventos próximos (próximos 30 minutos) usando RPC function
    console.log('📅 Buscando eventos próximos...');
    
    const { data: events, error } = await supabase
      .rpc('get_upcoming_events', { minutes_ahead: 30 });

    if (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch events',
        details: error.message 
      });
    }

    console.log(`✅ Eventos encontrados: ${events?.length || 0}`);

    if (!events || events.length === 0) {
      console.log('ℹ️ Nenhum evento próximo encontrado');
      return res.status(200).json({ 
        message: 'No upcoming events',
        checked_at: new Date().toISOString(),
        events_found: 0
      });
    }

    // Processar cada evento
    const notifications = [];
    const now = new Date();

    for (const event of events) {
      const eventDate = new Date(event.start_date);
      const minutesUntil = Math.round((eventDate.getTime() - now.getTime()) / 60000);

      console.log(`\n📅 Evento: ${event.title}`);
      console.log(`   ⏰ Começa em: ${minutesUntil} minutos`);
      console.log(`   👤 Usuário: ${event.user_id.substring(0, 8)}...`);

      // Determinar se deve notificar e qual mensagem
      let emoji = '';
      let message = '';
      let notificationTag = '';
      
      // APENAS 2 NOTIFICAÇÕES:
      // 1) 30 minutos antes (range: 25-35 min)
      // 2) Na hora do evento (range: -1 a 2 min)
      
      if (minutesUntil >= -1 && minutesUntil <= 2) {
        emoji = '🚀';
        message = `Está começando AGORA!${event.location ? ` - ${event.location}` : ''}`;
        notificationTag = 'now';
        console.log(`   🎯 Tipo: AGORA (${minutesUntil}min)`);
      } 
      else if (minutesUntil >= 25 && minutesUntil <= 35) {
        emoji = '📅';
        message = `Começa em 30 minutos${event.location ? ` - ${event.location}` : ''}`;
        notificationTag = '30min';
        console.log(`   📆 Tipo: 30 MINUTOS (${minutesUntil}min)`);
      } 
      else {
        console.log(`   ⏭️ Fora do intervalo de notificação (${minutesUntil}min), pulando...`);
        continue;
      }

      // Verificar se já enviamos essa notificação
      const { data: alreadySent } = await supabase
        .from('event_notifications_sent')
        .select('id')
        .eq('event_id', event.id)
        .eq('notification_type', notificationTag)
        .single();

      if (alreadySent) {
        console.log(`   ⏭️ Notificação ${notificationTag} já enviada, pulando...`);
        continue;
      }

      // Enviar notificação via API
      try {
        console.log(`   📤 Enviando notificação: ${emoji} ${event.title}`);
        
        const baseUrl = process.env.VITE_APP_URL || 'https://ymsports.com.br';
        
        const notifyResponse = await fetch(`${baseUrl}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: event.user_id,
            title: `${emoji} ${event.title}`,
            body: message,
            url: '/dashboard/calendar'
          })
        });

        const notifyResult = await notifyResponse.json();
        
        if (notifyResponse.ok) {
          console.log(`   ✅ Notificação enviada! Dispositivos: ${notifyResult.sent || 0}`);
          
          // Registrar no cache para evitar duplicatas
          await supabase
            .from('event_notifications_sent')
            .insert({
              event_id: event.id,
              user_id: event.user_id,
              notification_type: notificationTag
            });
          
          notifications.push({
            event_id: event.id,
            title: event.title,
            minutes_until: minutesUntil,
            type: notificationTag,
            status: 'sent',
            devices_notified: notifyResult.sent || 0
          });
        } else {
          console.error(`   ❌ Erro ao enviar notificação:`, notifyResult.error);
          notifications.push({
            event_id: event.id,
            title: event.title,
            minutes_until: minutesUntil,
            type: notificationTag,
            status: 'failed',
            error: notifyResult.error
          });
        }
      } catch (error) {
        console.error(`   ❌ Erro ao chamar /api/notify:`, error.message);
        notifications.push({
          event_id: event.id,
          title: event.title,
          minutes_until: minutesUntil,
          type: notificationTag,
          status: 'error',
          error: error.message
        });
      }

      // Aguardar 500ms entre notificações para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PROCESSAMENTO CONCLUÍDO');
    console.log(`📊 Total de eventos: ${events.length}`);
    console.log(`📤 Notificações enviadas: ${notifications.filter(n => n.status === 'sent').length}`);
    console.log(`❌ Falhas: ${notifications.filter(n => n.status !== 'sent').length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return res.status(200).json({
      success: true,
      checked_at: new Date().toISOString(),
      events_found: events.length,
      notifications_sent: notifications.filter(n => n.status === 'sent').length,
      notifications_failed: notifications.filter(n => n.status !== 'sent').length,
      details: notifications
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

