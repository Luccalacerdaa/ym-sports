// Service Worker para Push Notifications - YM Sports
// Este arquivo gerencia as notificações push mesmo quando o app está fechado

const APP_URL = 'https://ym-sports.vercel.app';
const SW_VERSION = '8.0.0'; // Incrementar para forçar atualização
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

// Função para verificar e enviar notificações
function checkAndSendNotifications() {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay(); // 0 = domingo, 1 = segunda
  const today = now.toDateString();
  
  console.log(`[SW] 🔔 Verificando notificações para ${currentTime}...`);

  // Recuperar notificações já enviadas hoje
  const sentTodayKey = `notificationsSentToday_${today}`;
  let sentToday = [];
  
  try {
    const stored = localStorage.getItem(sentTodayKey);
    sentToday = stored ? JSON.parse(stored) : [];
  } catch (e) {
    sentToday = [];
  }

  NOTIFICATION_SCHEDULE.forEach(notification => {
    const notificationKey = `${notification.time}-${notification.title}`;
    
    // Verificar se já foi enviada hoje
    if (sentToday.includes(notificationKey)) {
      return;
    }

    // Verificar frequência semanal (apenas segundas-feiras)
    if (notification.frequency === 'weekly' && currentDay !== 1) {
      return;
    }

    // Verificar se é o horário certo
    if (currentTime === notification.time) {
      console.log(`[SW] 🔔 Enviando notificação: ${notification.title}`);
      
      // Enviar notificação
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: `${APP_URL}/icons/icon-192.png`,
        badge: `${APP_URL}/icons/icon-96.png`,
        tag: `ym-sports-${Date.now()}`,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          url: `${APP_URL}/dashboard`,
          timestamp: Date.now()
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
      
      // Marcar como enviada
      sentToday.push(notificationKey);
      try {
        localStorage.setItem(sentTodayKey, JSON.stringify(sentToday));
      } catch (e) {
        console.warn('[SW] Erro ao salvar notificações enviadas:', e);
      }
    }
  });
}

// Verificar notificações a cada minuto
setInterval(() => {
  checkAndSendNotifications();
}, 60000); // 1 minuto

// Listener para mensagens de SKIP_WAITING
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] ⏩ SKIP_WAITING recebido, ativando nova versão...');
    self.skipWaiting();
  }
});

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
    })
  );
});

// Evento: Receber notificação push
self.addEventListener('push', (event) => {
  console.log('[SW] 📥 PUSH EVENT RECEBIDO!', event);
  console.log('[SW] 📋 event.data existe?', !!event.data);
  
  // SEMPRE mostrar uma notificação, mesmo sem dados
  let title = '⚽ YM Sports';
  let options = {
    body: 'Nova atualização!',
    icon: `${APP_URL}/icons/icon-192.png`,
    badge: `${APP_URL}/icons/icon-96.png`,
    data: { url: `${APP_URL}/dashboard` },
    vibrate: [200, 100, 200],
    tag: 'ym-sports',
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
        icon: data.icon || `${APP_URL}/icons/icon-192.png`,
        badge: `${APP_URL}/icons/icon-96.png`,
        image: data.image || undefined,
        data: {
          url: data.url || `${APP_URL}/dashboard`,
          ...data.data
        },
        actions: [
          {
            action: 'open',
            title: '👀 Ver Agora'
          },
          {
            action: 'close',
            title: '✖️ Fechar'
          }
        ],
        vibrate: [200, 100, 200],
        requireInteraction: false,
        timestamp: data.timestamp || Date.now(),
        tag: data.tag || 'ym-sports-notification',
        renotify: true
      };
    } catch (error) {
      console.error('[SW] ❌ Erro ao fazer parse do push:', error);
      // Usar valores padrão definidos acima
    }
  } else {
    console.log('[SW] ⚠️ Push sem dados, usando notificação padrão');
  }

  console.log('[SW] 📤 Mostrando notificação:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[SW] ✅ Notificação exibida com sucesso!');
      })
      .catch((error) => {
        console.error('[SW] ❌ Erro ao exibir notificação:', error);
      })
  );
});

// Evento: Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Notificação clicada!');
  console.log('[SW] 📋 Action:', event.action);
  console.log('[SW] 📋 Data:', event.notification.data);
  
  event.notification.close();
  console.log('[SW] ✅ Notificação fechada');

  // Se clicou em "fechar", não faz nada
  if (event.action === 'close') {
    console.log('[SW] ❌ Usuário fechou a notificação');
    return;
  }

  const urlToOpen = event.notification.data?.url || `${APP_URL}/dashboard`;
  console.log('[SW] 🌐 URL para abrir:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        console.log('[SW] 🔍 Janelas abertas:', clientList.length);
        
        // Se já tem uma janela do app aberta, focar nela
        for (let client of clientList) {
          if (client.url.startsWith(APP_URL) && 'focus' in client) {
            console.log('[SW] ✅ Focando janela existente');
            return client.focus().then(() => {
              // Navegar para a URL se possível
              if ('navigate' in client) {
                console.log('[SW] 🚀 Navegando para:', urlToOpen);
                return client.navigate(urlToOpen);
              }
            });
          }
        }
        
        // Se não tem janela aberta, abrir nova
        if (clients.openWindow) {
          console.log('[SW] 🆕 Abrindo nova janela');
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] ❌ Erro ao abrir janela:', error);
      })
  );
});

// Evento: Fechar notificação (usuário deslizou para o lado, por exemplo)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event.notification.tag);
  
  // Aqui você pode enviar analytics sobre notificações fechadas
  // Por exemplo, registrar que o usuário não interagiu
});

// Evento: Sincronização em background (opcional, para futuro)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    // Aqui você pode sincronizar notificações offline
    event.waitUntil(
      // Sua lógica de sincronização
      Promise.resolve()
    );
  }
});

// Evento: Message (comunicação entre app e SW)
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Responder de volta para o cliente
  if (event.ports[0]) {
    event.ports[0].postMessage({
      type: 'ACK',
      message: 'Service Worker recebeu a mensagem'
    });
  }
});
