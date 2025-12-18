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
      let notificationTag = '';  // Tag única para cada tipo de notificação
      
      // AGORA ou evento recente (já começou há até 2 minutos)
      if (minutesUntil <= 2 && minutesUntil >= -2) {
        emoji = '🚀';
        message = `Está começando AGORA!${event.location ? ` - ${event.location}` : ''}`;
        notificationTag = 'now';
        console.log(`   🎯 Tipo: AGORA (${minutesUntil}min)`);
      } 
      // 3-5 minutos antes
      else if (minutesUntil <= 5) {
        emoji = '🚨';
        message = `Faltam apenas ${minutesUntil} minutos!${event.location ? ` - ${event.location}` : ''}`;
        notificationTag = '5min';
        console.log(`   ⚠️ Tipo: 5 MINUTOS (${minutesUntil}min)`);
      } 
      // 6-15 minutos antes
      else if (minutesUntil <= 15) {
        emoji = '⚠️';
        message = `Começa em ${minutesUntil} minutos${event.location ? ` - ${event.location}` : ''}`;
        notificationTag = '15min';
        console.log(`   📢 Tipo: 15 MINUTOS (${minutesUntil}min)`);
      } 
      // 16-30 minutos antes
      else if (minutesUntil <= 30) {
        emoji = '📅';
        message = `Começa em ${minutesUntil} minutos${event.location ? ` - ${event.location}` : ''}`;
        notificationTag = '30min';
        console.log(`   📆 Tipo: 30 MINUTOS (${minutesUntil}min)`);
      } 
      // Evento muito distante ou muito antigo
      else {
        console.log(`   ⏭️ Evento fora do intervalo (${minutesUntil}min), pulando...`);
        continue;
      }

      // Enviar notificação via API
      try {
        console.log(`   📤 Enviando notificação: ${emoji} ${event.title}`);
        
        // Montar URL corretamente (VERCEL_URL não inclui https://)
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'https://ym-sports.vercel.app';
        
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
          notifications.push({
            event_id: event.id,
            title: event.title,
            minutes_until: minutesUntil,
            status: 'sent',
            devices_notified: notifyResult.sent || 0
          });
        } else {
          console.error(`   ❌ Erro ao enviar notificação:`, notifyResult.error);
          notifications.push({
            event_id: event.id,
            title: event.title,
            minutes_until: minutesUntil,
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

