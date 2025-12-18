// Service Worker Simplificado para YM Sports
// Foco em notificações que funcionem mesmo com app fechado

const SW_VERSION = '17.0.0';
const CACHE_NAME = `ym-sports-v${SW_VERSION}`;

// Configurações do Supabase (será recebido do app)
let supabaseUrl = null;
let supabaseKey = null;
let userId = null;

console.log(`[SW] 🚀 YM Sports Service Worker v${SW_VERSION} iniciado!`);

// Limpar notificações antigas
self.registration.getNotifications().then(notifications => {
  console.log(`[SW] 🧹 Limpando ${notifications.length} notificações antigas`);
  notifications.forEach(notification => notification.close());
});

// Cronograma de notificações diárias (sincronizado com useDailyNotifications)
const NOTIFICATIONS = [
  { time: "07:00", type: "morning", title: "💪 Bom dia, atleta!", body: "Hora de começar o dia com energia! Vamos treinar hoje?", url: "/dashboard" },
  { time: "09:00", type: "hydration", title: "💧 Hidratação", body: "Já bebeu água hoje? Mantenha-se hidratado!", url: "/dashboard/nutrition" },
  { time: "11:30", type: "workout", title: "🏋️ Hora do Treino!", body: "Seu treino está te esperando. Vamos nessa!", url: "/dashboard/training" },
  { time: "14:00", type: "hydration", title: "💧 Hidratação", body: "Continue bebendo água! Seu corpo agradece.", url: "/dashboard/nutrition" },
  { time: "17:00", type: "workout", title: "🏃‍♂️ Treino da Tarde!", body: "Que tal um treino agora? Você consegue!", url: "/dashboard/training" },
  { time: "19:00", type: "hydration", title: "💧 Última Hidratação", body: "Beba mais água antes de dormir!", url: "/dashboard/nutrition" },
  { time: "21:00", type: "evening", title: "🌙 Boa Noite!", body: "Descanse bem para conquistar seus objetivos amanhã!", url: "/dashboard/motivational" }
];

// Cache simples para notificações enviadas
let sentToday = [];
let currentDate = new Date().toDateString();
let eventsNotified = new Set(); // Cache de eventos já notificados

// Função principal para verificar notificações
function checkNotifications() {
  const now = new Date();
  const today = now.toDateString();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  console.log(`[SW] ⏰ Verificando ${currentTime} - ${today}`);
  
  // Reset diário
  if (today !== currentDate) {
    console.log('[SW] 🗓️ Novo dia - resetando cache');
    sentToday = [];
    currentDate = today;
  }
  
  // Verificar cada notificação
  NOTIFICATIONS.forEach(notification => {
    const key = `${notification.time}-${today}`;
    
    // Se é o horário certo e ainda não foi enviada hoje
    if (currentTime === notification.time && !sentToday.includes(key)) {
      console.log(`[SW] 📤 Enviando notificação agendada: ${notification.title} (${notification.type})`);
      
      // Enviar notificação
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        tag: `daily-${notification.type}-${Date.now()}`,
        requireInteraction: notification.type === 'workout', // Treinos exigem interação
        vibrate: [200, 100, 200],
        data: { 
          url: notification.url,
          type: notification.type,
          timestamp: now.toISOString()
        },
        actions: [
          { action: 'open', title: notification.type === 'workout' ? 'Ver Treino' : 'Abrir App' }
        ]
      }).then(() => {
        console.log(`[SW] ✅ Notificação enviada: ${notification.title} às ${currentTime}`);
        sentToday.push(key);
      }).catch(error => {
        console.error(`[SW] ❌ Erro ao enviar notificação: ${error}`);
      });
    }
  });
}

// Função para verificar eventos próximos (CALENDARIO)
async function checkUpcomingEvents() {
  if (!supabaseUrl || !supabaseKey || !userId) {
    console.log('[SW] ⚠️ Supabase não configurado ainda');
    return;
  }

  try {
    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    
    console.log('[SW] 📅 Verificando eventos próximos...');
    
    // Buscar eventos do Supabase
    const response = await fetch(
      `${supabaseUrl}/rest/v1/events?user_id=eq.${userId}&start_date=gte.${now.toISOString()}&start_date=lte.${in30Minutes.toISOString()}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const events = await response.json();
    console.log(`[SW] 📅 Encontrados ${events.length} eventos próximos`);

    // Processar cada evento
    for (const event of events) {
      const eventDate = new Date(event.start_date);
      const minutesUntil = Math.round((eventDate.getTime() - now.getTime()) / 60000);
      
      const notificationKey30 = `event_30min_${event.id}`;
      const notificationKey5 = `event_5min_${event.id}`;
      const notificationKeyNow = `event_now_${event.id}`;
      
      // Notificar 30 minutos antes
      if (!eventsNotified.has(notificationKey30) && minutesUntil <= 30 && minutesUntil > 10) {
        console.log(`[SW] 📤 Enviando notificação: ${event.title} em ${minutesUntil}min`);
        
        await self.registration.showNotification(`📅 ${event.title}`, {
          body: `Começa em ${minutesUntil} minutos${event.location ? ` - ${event.location}` : ''}`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: `event-${event.id}`,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: { url: '/calendar', eventId: event.id }
        });
        
        eventsNotified.add(notificationKey30);
        console.log(`[SW] ✅ Notificação enviada: ${event.title} (30min)`);
      }
      
      // Notificar 5 minutos antes
      if (!eventsNotified.has(notificationKey5) && minutesUntil <= 10 && minutesUntil > 1) {
        console.log(`[SW] 📤 Enviando notificação: ${event.title} em ${minutesUntil}min`);
        
        await self.registration.showNotification(`⚠️ ${event.title}`, {
          body: `Faltam apenas ${minutesUntil} minutos!${event.location ? ` - ${event.location}` : ''}`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: `event-${event.id}-warning`,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          data: { url: '/calendar', eventId: event.id }
        });
        
        eventsNotified.add(notificationKey5);
        console.log(`[SW] ✅ Notificação enviada: ${event.title} (5min)`);
      }
      
      // Notificar quando começar (0-1 minuto)
      if (!eventsNotified.has(notificationKeyNow) && minutesUntil <= 1 && minutesUntil >= 0) {
        console.log(`[SW] 📤 Enviando notificação: ${event.title} AGORA`);
        
        await self.registration.showNotification(`🚀 ${event.title}`, {
          body: `Está começando AGORA!${event.location ? ` - ${event.location}` : ''}`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: `event-${event.id}-start`,
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 300],
          data: { url: '/calendar', eventId: event.id }
        });
        
        eventsNotified.add(notificationKeyNow);
        console.log(`[SW] ✅ Notificação enviada: ${event.title} (AGORA)`);
      }
    }
    
    // Limpar cache de eventos notificados após 2 horas
    if (eventsNotified.size > 100) {
      eventsNotified.clear();
      console.log('[SW] 🧹 Cache de eventos limpo');
    }
    
  } catch (error) {
    console.error('[SW] ❌ Erro ao verificar eventos:', error);
  }
}

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Instalando...');
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] ⚡ Ativando...');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('[SW] ✅ Service Worker ativo e controlando páginas!');
      // Iniciar verificação imediatamente
      checkNotifications();
      checkUpcomingEvents();
    })
  );
});

// Verificar notificações e eventos a cada minuto
setInterval(() => {
  checkNotifications();
  checkUpcomingEvents();
}, 60000);

// Log de vida a cada 5 minutos
setInterval(() => {
  console.log(`[SW] 💚 Service Worker v${SW_VERSION} rodando - ${new Date().toLocaleTimeString()}`);
}, 5 * 60 * 1000);

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 👆 Notificação clicada:', event.notification.data);
  event.notification.close();
  
  const url = event.notification.data?.url || '/dashboard';
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Se já existe uma janela aberta, focar nela e navegar
          for (const client of clientList) {
            if ('focus' in client) {
              client.focus();
              client.postMessage({ type: 'NAVIGATE', url });
              return;
            }
          }
          // Senão, abrir nova janela
          return clients.openWindow(url);
        })
    );
  }
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] ❌ Notificação fechada');
});

// Mensagens do app
self.addEventListener('message', (event) => {
  console.log('[SW] 💬 Mensagem recebida:', event.data);
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    console.log('[SW] 🔔 Notificação solicitada:', event.data.title);
    
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: event.data.options?.icon || '/icons/icon-192.png',
      badge: event.data.options?.badge || '/icons/icon-96.png',
      tag: event.data.options?.tag || `notification-${Date.now()}`,
      requireInteraction: event.data.options?.requireInteraction || false,
      vibrate: [200, 100, 200],
      data: { url: '/dashboard' }
    }).then(() => {
      console.log(`[SW] ✅ Notificação mostrada: ${event.data.title}`);
    }).catch(error => {
      console.error(`[SW] ❌ Erro ao mostrar notificação: ${error}`);
    });
  }
  
  if (event.data.type === 'TEST_NOTIFICATION') {
    console.log('[SW] 🧪 Teste de notificação solicitado');
    
    self.registration.showNotification('🧪 Teste YM Sports', {
      body: 'Notificação de teste funcionando!',
      icon: '/icons/icon-192.png',
      tag: 'test-notification',
      requireInteraction: true
    });
  }
  
  if (event.data.type === 'FORCE_CHECK') {
    console.log('[SW] 🔄 Verificação forçada de notificações');
    checkNotifications();
    checkUpcomingEvents();
  }
  
  if (event.data.type === 'SET_SUPABASE_CONFIG') {
    console.log('[SW] ⚙️ Configurando Supabase');
    supabaseUrl = event.data.supabaseUrl;
    supabaseKey = event.data.supabaseKey;
    userId = event.data.userId;
    console.log('[SW] ✅ Supabase configurado!', { 
      url: supabaseUrl ? '✓' : '✗', 
      key: supabaseKey ? '✓' : '✗', 
      userId: userId ? '✓' : '✗' 
    });
    // Verificar eventos imediatamente após configurar
    checkUpcomingEvents();
  }
  
  if (event.data.type === 'SET_DAILY_SCHEDULE') {
    console.log('[SW] 📅 Recebendo cronograma de notificações diárias');
    console.log('[SW] 📋 Horários:', event.data.schedule.map(s => `${s.time} (${s.type})`).join(', '));
    
    // Atualizar o cronograma global (se necessário)
    // Por enquanto, o SW já tem o cronograma hardcoded
    // Mas podemos adicionar lógica dinâmica aqui no futuro
    
    console.log('[SW] ✅ Cronograma confirmado! Notificações serão enviadas nos horários programados.');
    
    // Forçar verificação imediata
    checkNotifications();
  }
  
  if (event.data.type === 'SCHEDULE_TEST') {
    console.log('[SW] ⏰ Notificação de teste agendada');
    
    const targetTime = event.data.time;
    const now = Date.now();
    const delay = targetTime - now;
    
    if (delay > 0) {
      setTimeout(() => {
        console.log('[SW] 🧪 Enviando notificação de teste agendada');
        self.registration.showNotification('🧪 Teste YM Sports', {
          body: 'Notificação agendada funcionando perfeitamente! ✅',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: 'scheduled-test',
          requireInteraction: true,
          vibrate: [200, 100, 200]
        });
      }, delay);
      
      console.log(`[SW] ⏰ Teste agendado para daqui ${Math.round(delay/1000)}s`);
    }
  }
});

// Push Notification (funciona com app FECHADO!)
self.addEventListener('push', (event) => {
  console.log('[SW] 📨 Push notification recebido!');
  
  let data = {
    title: '🏆 YM Sports',
    body: 'Você tem uma nova notificação!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'push-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: '/dashboard' }
  };
  
  // Se o push trouxe dados, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
      console.log('[SW] 📦 Dados do push:', pushData);
    } catch (error) {
      console.log('[SW] ⚠️ Push sem dados JSON, usando padrão');
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      vibrate: data.vibrate,
      data: data.data,
      actions: [
        { action: 'open', title: 'Abrir App' }
      ]
    }).then(() => {
      console.log('[SW] ✅ Push notification exibida!');
    })
  );
});

console.log('[SW] 🎯 Service Worker configurado e pronto!');
