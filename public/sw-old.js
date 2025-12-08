// Service Worker para Push Notifications - YM Sports
// Este arquivo gerencia as notificações push mesmo quando o app está fechado

const APP_URL = 'https://ym-sports.vercel.app';
const SW_VERSION = '9.0.0'; // Incrementar para forçar atualização
const CACHE_NAME = `ym-sports-v${SW_VERSION}`;

console.log(`[SW] 🚀 Service Worker YM Sports v${SW_VERSION} carregado!`);

// Cronograma de notificações
const NOTIFICATION_SCHEDULE = [
  { time: "07:00", title: "💪 Motivação Matinal", body: "Seu futuro agradece o esforço de hoje." },
  { time: "08:30", title: "🏃‍♂️ Treino Disponível", body: "Seu treino personalizado está te esperando!" },
  { time: "09:30", title: "💦 Hidratação Matinal", body: "Comece o dia tomando água" },
  { time: "10:30", title: "📈 Atualize Seu Perfil", body: "Complete suas informações!", frequency: "weekly" },
  { time: "12:00", title: "🥗 Hora da Nutrição", body: "Cuide da sua alimentação para ter energia!" },
  { time: "13:00", title: "🏆 Nova Conquista Disponível", body: "Você tem conquistas esperando!" },
  { time: "14:00", title: "💧 Hidratação é Fundamental", body: "Mantenha-se hidratado durante o dia!" },
  { time: "15:30", title: "🎯 Foco no Objetivo", body: "Mantenha o foco nos seus sonhos!" },
  { time: "16:30", title: "📱 Portfólio Online", body: "Divulgue sua marca e seja descoberto!" },
  { time: "18:30", title: "🌟 Motivação Noturna", body: "Orgulhe-se do que você fez hoje." },
  { time: "19:00", title: "🍽️ Jantar Inteligente", body: "Termine o dia com uma refeição saudável!" },
  { time: "20:00", title: "🥇 Ranking Atualizado", body: "Veja sua posição no ranking!", frequency: "weekly" }
];

// Cache para rastrear notificações enviadas (usando IndexedDB seria melhor, mas vamos simplificar)
let notificationsSentToday = new Set();
let lastCheckDate = new Date().toDateString();

// Função para verificar e enviar notificações
async function checkAndSendNotifications() {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay(); // 0 = domingo, 1 = segunda
  const today = now.toDateString();
  
  console.log(`[SW] 🔔 Verificando notificações para ${currentTime}...`);

  // Resetar cache se mudou o dia
  if (today !== lastCheckDate) {
    console.log('[SW] 🗓️ Novo dia detectado, resetando cache de notificações');
    notificationsSentToday.clear();
    lastCheckDate = today;
  }

  // Verificar cada notificação do cronograma
  for (const notification of NOTIFICATION_SCHEDULE) {
    const notificationKey = `${notification.time}-${notification.title}`;
    
    // Verificar se já foi enviada hoje
    if (notificationsSentToday.has(notificationKey)) {
      continue;
    }

    // Verificar frequência semanal (apenas segundas-feiras)
    if (notification.frequency === 'weekly' && currentDay !== 1) {
      continue;
    }

    // Verificar se é o horário certo (com tolerância de ±1 minuto)
    const [targetHour, targetMinute] = notification.time.split(':').map(Number);
    const targetTime = targetHour * 60 + targetMinute;
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Tolerância de 1 minuto para garantir que não perca a notificação
    if (Math.abs(currentTimeMinutes - targetTime) <= 1) {
      console.log(`[SW] 🔔 Enviando notificação: ${notification.title}`);
      
      try {
        // Enviar notificação
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: `${APP_URL}/icons/logo.png`,
          badge: `${APP_URL}/icons/logo.png`,
          tag: `ym-sports-scheduled-${Date.now()}`,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
          data: {
            url: `${APP_URL}/dashboard`,
            timestamp: Date.now(),
            scheduled: true,
            time: notification.time
          },
          actions: [
            {
              action: 'open',
              title: 'Abrir App'
            },
            {
              action: 'dismiss',
              title: 'Dispensar'
            }
          ]
        });
        
        console.log(`[SW] ✅ Notificação enviada: ${notification.title}`);
        
        // Marcar como enviada
        notificationsSentToday.add(notificationKey);
        
        // Notificar clientes (se houver algum aberto)
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'NOTIFICATION_SENT',
            notification: notification.title,
            time: currentTime
          });
        });
        
      } catch (error) {
        console.error(`[SW] ❌ Erro ao enviar notificação ${notification.title}:`, error);
      }
    }
  }
}

// Verificar notificações a cada minuto
setInterval(() => {
  checkAndSendNotifications();
}, 60000); // 1 minuto

// Também verificar imediatamente quando o SW é ativado
checkAndSendNotifications();

// Evento: Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] ⚙️ Service Worker instalando...');
  self.skipWaiting(); // Ativa imediatamente
  console.log('[SW] ✅ Service Worker instalado!');
});

// Evento: Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] ⚙️ Service Worker ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('ym-sports-v')) {
              console.log('[SW] 🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Assumir controle das páginas
      clients.claim()
    ]).then(() => {
      console.log('[SW] ✅ Service Worker ativado e controlando páginas!');
      console.log('[SW] 📦 Cache atual:', CACHE_NAME);
      
      // Iniciar verificação de notificações
      checkAndSendNotifications();
    })
  );
});

// Evento: Receber notificação push (para push notifications reais do servidor)
self.addEventListener('push', (event) => {
  console.log('[SW] 📥 PUSH EVENT RECEBIDO!', event);
  
  let title = '⚽ YM Sports';
  let options = {
    body: 'Nova atualização!',
    icon: `${APP_URL}/icons/logo.png`,
    badge: `${APP_URL}/icons/logo.png`,
    data: { url: `${APP_URL}/dashboard` },
    vibrate: [200, 100, 200],
    tag: 'ym-sports-push',
    requireInteraction: false,
    timestamp: Date.now()
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW] ✅ Dados do push parseados:', data);
      
      title = data.title || title;
      options = {
        body: data.body || 'Nova atualização no YM Sports!',
        icon: data.icon || `${APP_URL}/icons/logo.png`,
        badge: `${APP_URL}/icons/logo.png`,
        image: data.image || undefined,
        data: {
          url: data.url || `${APP_URL}/dashboard`,
          ...data.data
        },
        actions: [
          {
            action: 'open',
            title: 'Ver Agora'
          },
          {
            action: 'close',
            title: 'Fechar'
          }
        ],
        vibrate: [200, 100, 200],
        requireInteraction: false,
        timestamp: data.timestamp || Date.now(),
        tag: data.tag || 'ym-sports-push',
        renotify: true
      };
    } catch (error) {
      console.error('[SW] ❌ Erro ao fazer parse do push:', error);
    }
  }

  console.log('[SW] 📤 Mostrando notificação push:', title);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] ✅ Notificação push exibida!'))
      .catch((error) => console.error('[SW] ❌ Erro ao exibir notificação:', error))
  );
});

// Evento: Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Notificação clicada!');
  
  event.notification.close();

  if (event.action === 'close' || event.action === 'dismiss') {
    console.log('[SW] ❌ Usuário dispensou a notificação');
    return;
  }

  const urlToOpen = event.notification.data?.url || `${APP_URL}/dashboard`;
  console.log('[SW] 🌐 Abrindo:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela do app aberta, focar nela
        for (let client of clientList) {
          if (client.url.startsWith(APP_URL) && 'focus' in client) {
            console.log('[SW] ✅ Focando janela existente');
            return client.focus();
          }
        }
        
        // Se não tem janela aberta, abrir nova
        if (clients.openWindow) {
          console.log('[SW] 🆕 Abrindo nova janela');
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => console.error('[SW] ❌ Erro ao abrir janela:', error))
  );
});

// Evento: Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] 🔕 Notificação fechada:', event.notification.tag);
});

// Evento: Message (comunicação entre app e SW)
self.addEventListener('message', (event) => {
  console.log('[SW] 📨 Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] ⏩ Ativando nova versão...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    console.log('[SW] 🔔 Verificação manual de notificações solicitada');
    checkAndSendNotifications();
  }
  
  // Responder de volta
  if (event.ports[0]) {
    event.ports[0].postMessage({
      type: 'ACK',
      message: 'Service Worker recebeu a mensagem',
      version: SW_VERSION
    });
  }
});

// Log periódico para confirmar que o SW está ativo
setInterval(() => {
  console.log(`[SW] 💚 Service Worker v${SW_VERSION} ativo e monitorando...`);
}, 5 * 60 * 1000); // A cada 5 minutos

console.log('[SW] 🎯 Sistema de notificações inicializado!');
