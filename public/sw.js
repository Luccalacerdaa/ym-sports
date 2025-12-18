// Service Worker Simplificado para YM Sports
// Foco em notificações que funcionem mesmo com app fechado

const SW_VERSION = '14.0.0';
const CACHE_NAME = `ym-sports-v${SW_VERSION}`;

console.log(`[SW] 🚀 YM Sports Service Worker v${SW_VERSION} iniciado!`);

// Limpar notificações antigas
self.registration.getNotifications().then(notifications => {
  console.log(`[SW] 🧹 Limpando ${notifications.length} notificações antigas`);
  notifications.forEach(notification => notification.close());
});

// Cronograma simplificado de notificações
const NOTIFICATIONS = [
  { time: "07:00", title: "💪 Bom dia, atleta!", body: "Hora de começar o dia com energia!" },
  { time: "08:30", title: "🏃‍♂️ Treino te espera", body: "Seu treino personalizado está disponível!" },
  { time: "12:00", title: "🥗 Hora do almoço", body: "Cuide da sua alimentação!" },
  { time: "15:30", title: "🎯 Foco no objetivo", body: "Continue firme nos seus sonhos!" },
  { time: "18:30", title: "🌟 Fim de dia", body: "Que tal um treino noturno?" },
  { time: "20:00", title: "🏆 Ranking", body: "Veja sua posição no ranking!" }
];

// Cache simples para notificações enviadas
let sentToday = [];
let currentDate = new Date().toDateString();

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
      console.log(`[SW] 📤 Enviando: ${notification.title}`);
      
      // Enviar notificação
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        tag: `ym-${Date.now()}`,
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: { url: '/dashboard' },
        actions: [
          { action: 'open', title: 'Abrir App' }
        ]
      }).then(() => {
        console.log(`[SW] ✅ Notificação enviada: ${notification.title}`);
        sentToday.push(key);
      }).catch(error => {
        console.error(`[SW] ❌ Erro ao enviar: ${error}`);
      });
    }
  });
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
    })
  );
});

// Verificar notificações a cada minuto
setInterval(() => {
  checkNotifications();
}, 60000);

// Log de vida a cada 5 minutos
setInterval(() => {
  console.log(`[SW] 💚 Service Worker v${SW_VERSION} rodando - ${new Date().toLocaleTimeString()}`);
}, 5 * 60 * 1000);

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 👆 Notificação clicada');
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/dashboard')
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
