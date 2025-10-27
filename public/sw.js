// Service Worker para Push Notifications - YM Sports
// Este arquivo gerencia as notificações push mesmo quando o app está fechado

const APP_URL = 'https://ym-sports.vercel.app';
const CACHE_NAME = 'ym-sports-v1';

// Evento: Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting(); // Ativa imediatamente
});

// Evento: Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(clients.claim()); // Assume controle imediatamente
});

// Evento: Receber notificação push
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);
  
  if (!event.data) {
    console.log('[SW] Push sem dados');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Dados do push:', data);

    // Configurações da notificação
    const options = {
      body: data.body || 'Nova atualização no YM Sports!',
      icon: data.icon || `${APP_URL}/icons/logo.png`,
      badge: `${APP_URL}/icons/logo.png`,
      image: data.image || null,
      data: {
        url: data.url || `${APP_URL}/dashboard`,
        ...data.data
      },
      actions: [
        {
          action: 'open',
          title: '👀 Ver Agora',
          icon: `${APP_URL}/icons/logo.png`
        },
        {
          action: 'close',
          title: '✖️ Fechar'
        }
      ],
      vibrate: [200, 100, 200], // Padrão de vibração
      requireInteraction: false, // Não requer interação para sumir
      timestamp: Date.now(),
      tag: data.tag || 'ym-sports-notification', // Agrupa notificações similares
      renotify: true // Vibra novamente se já existe notificação com mesma tag
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '⚽ YM Sports', options)
    );
  } catch (error) {
    console.error('[SW] Erro ao processar push:', error);
    
    // Fallback: mostrar notificação genérica
    event.waitUntil(
      self.registration.showNotification('YM Sports', {
        body: 'Você tem uma nova atualização!',
        icon: `${APP_URL}/icons/logo.png`,
        data: { url: `${APP_URL}/dashboard` }
      })
    );
  }
});

// Evento: Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event.action);
  
  event.notification.close(); // Fecha a notificação

  // Se clicou em "fechar", não faz nada
  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || `${APP_URL}/dashboard`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela do app aberta, focar nela
        for (let client of clientList) {
          if (client.url.startsWith(APP_URL) && 'focus' in client) {
            console.log('[SW] Focando janela existente');
            return client.focus().then(() => {
              // Navegar para a URL se possível
              if ('navigate' in client) {
                return client.navigate(urlToOpen);
              }
            });
          }
        }
        
        // Se não tem janela aberta, abrir nova
        if (clients.openWindow) {
          console.log('[SW] Abrindo nova janela:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Erro ao abrir janela:', error);
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

console.log('[SW] Service Worker YM Sports carregado ✅');
