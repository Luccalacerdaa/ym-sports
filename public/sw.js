// Service Worker Completo para YM Sports
// Notificações + Cache Offline

const SW_VERSION = '22.0.0';
const CACHE_NAME = `ym-sports-v${SW_VERSION}`;
const RUNTIME_CACHE = `runtime-${SW_VERSION}`;

// Configurações do Supabase (será recebido do app)
let supabaseUrl = null;
let supabaseKey = null;
let userId = null;

// Arquivos essenciais para cache (offline first)
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/logo.svg'
];

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
      const notificationKeyNow = `event_now_${event.id}`;
      
      // Notificar 30 minutos antes (APENAS UMA VEZ)
      if (!eventsNotified.has(notificationKey30) && minutesUntil >= 28 && minutesUntil <= 32) {
        await self.registration.showNotification(`📅 ${event.title}`, {
          body: `Começa em 30 minutos${event.location ? ` - ${event.location}` : ''}`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: `event-30-${event.id}`,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: { url: '/dashboard/calendar', eventId: event.id }
        });
        
        eventsNotified.add(notificationKey30);
      }
      
      // Notificar no horário do evento (APENAS UMA VEZ)
      if (!eventsNotified.has(notificationKeyNow) && minutesUntil >= -1 && minutesUntil <= 1) {
        await self.registration.showNotification(`🚨 ${event.title} AGORA!`, {
          body: `Seu evento está começando${event.location ? ` em ${event.location}` : ''}!`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          tag: `event-now-${event.id}`,
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 300],
          data: { url: '/dashboard/calendar', eventId: event.id }
        });
        
        eventsNotified.add(notificationKeyNow);
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
  // NÃO usar skipWaiting() para evitar loop de recarregamento
  // self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] ⚡ Ativando...');
  event.waitUntil(
    (async () => {
      // Limpar caches antigos
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
      
      // NÃO usar clients.claim() automaticamente para evitar recarregamentos
      // Apenas tomar controle em páginas novas
      console.log('[SW] ✅ Service Worker ativo!');
      
      // Iniciar verificações
      checkNotifications();
      checkUpcomingEvents();
    })()
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
  // Não logar o payload completo — pode conter chaves sensíveis
  console.log('[SW] 💬 Mensagem recebida:', event.data?.type);
  
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
    supabaseUrl = event.data.supabaseUrl;
    supabaseKey = event.data.supabaseKey;
    userId = event.data.userId;
    console.log('[SW] ✅ Supabase configurado!');
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

// =============================================
// EVENTOS DE CACHE PARA OFFLINE
// =============================================

// INSTALL: Cachear arquivos essenciais
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 💾 Cacheando arquivos essenciais');
      return cache.addAll(ESSENTIAL_FILES).catch(err => {
        console.warn('[SW] ⚠️ Alguns arquivos não foram cacheados:', err);
      });
    }).then(() => {
      console.log('[SW] ✅ Instalação completa');
      return self.skipWaiting(); // Ativar imediatamente
    })
  );
});

// ACTIVATE: Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] 🔄 Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] 🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Ativação completa');
      return self.clients.claim(); // Controlar todas as páginas
    })
  );
});

// FETCH: Estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições de extensões do Chrome e dev tools
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Nunca interceptar requisições POST/PUT/PATCH/DELETE — deixar passar direto
  if (request.method !== 'GET') {
    return;
  }
  
  // Requisições para APIs externas (Supabase, OpenAI, Hotmart, etc)
  // Network only — mas trata falha de rede para não quebrar o SW
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).catch(() => {
        // Offline: retornar resposta de erro estruturada em vez de deixar o SW crashar
        const isJson = request.headers.get('accept')?.includes('application/json') ||
                       url.pathname.includes('/rest/') ||
                       url.pathname.includes('/auth/');
        if (isJson) {
          return new Response(JSON.stringify({ error: 'offline', message: 'Sem conexão com a internet' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }
  
  // Estratégia: Cache First para assets estáticos
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // console.log('[SW] 💾 Cache HIT:', url.pathname);
          return cached;
        }
        
        return fetch(request).then((response) => {
          // Cachear para futuras requisições
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          console.log('[SW] ❌ Offline e sem cache para:', url.pathname);
          // Retornar imagem placeholder se for imagem
          if (request.destination === 'image') {
            return caches.match('/icons/icon-192.png');
          }
        });
      })
    );
    return;
  }
  
  // Estratégia: Network First para HTML e dados dinâmicos
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear HTML para offline
        if (response.status === 200 && request.destination === 'document') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se offline, tentar cache
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log('[SW] 💾 Servindo do cache (offline):', url.pathname);
            return cached;
          }
          
          // Fallback para index.html (SPA routing)
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          console.log('[SW] ❌ Sem cache disponível para:', url.pathname);
          return new Response('Offline - recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

console.log('[SW] 🎯 Service Worker configurado e pronto (com cache offline)!');
