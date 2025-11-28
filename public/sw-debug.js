// Service Worker de DEBUG - YM Sports
// Este arquivo adiciona logs detalhados para diagnóstico

const SW_VERSION = '10.0.0-DEBUG';
const APP_URL = 'https://ym-sports.vercel.app';

console.log(`[SW-DEBUG] 🔍 Service Worker DEBUG v${SW_VERSION} iniciado!`);
console.log(`[SW-DEBUG] 📅 Timestamp: ${new Date().toISOString()}`);

// Sistema de log persistente usando IndexedDB
class SWLogger {
  constructor() {
    this.dbName = 'sw-logs';
    this.storeName = 'logs';
    this.db = null;
    this.init();
  }

  async init() {
    try {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => {
        console.error('[SW-DEBUG] ❌ Erro ao abrir IndexedDB');
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[SW-DEBUG] ✅ IndexedDB inicializado');
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('level', 'level', { unique: false });
          console.log('[SW-DEBUG] 📦 Object Store criado');
        }
      };
    } catch (error) {
      console.error('[SW-DEBUG] ❌ Erro no init:', error);
    }
  }

  async log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.stringify(data) : null,
      userAgent: navigator.userAgent
    };

    console.log(`[SW-DEBUG] [${level}] ${message}`, data || '');

    if (!this.db) {
      console.warn('[SW-DEBUG] ⚠️ DB não inicializado ainda');
      return;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      objectStore.add(logEntry);
    } catch (error) {
      console.error('[SW-DEBUG] ❌ Erro ao salvar log:', error);
    }
  }

  async getLogs(limit = 100) {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const logs = request.result.slice(-limit);
        resolve(logs);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

const logger = new SWLogger();

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

// Cache em memória
let notificationsSentToday = new Set();
let lastCheckDate = new Date().toDateString();
let checkCount = 0;

// Função de verificação com logs detalhados
async function checkAndSendNotifications() {
  checkCount++;
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay();
  const today = now.toDateString();
  
  await logger.log('INFO', `🔔 Verificação #${checkCount}`, {
    currentTime,
    currentDay,
    today,
    cacheSize: notificationsSentToday.size,
    lastCheckDate
  });

  // Reset cache se mudou o dia
  if (today !== lastCheckDate) {
    await logger.log('INFO', '🗓️ Novo dia detectado, resetando cache');
    notificationsSentToday.clear();
    lastCheckDate = today;
  }

  // Verificar cada notificação
  for (const notification of NOTIFICATION_SCHEDULE) {
    const notificationKey = `${notification.time}-${notification.title}`;
    
    // Já foi enviada?
    if (notificationsSentToday.has(notificationKey)) {
      continue;
    }

    // Verificar frequência semanal
    if (notification.frequency === 'weekly' && currentDay !== 1) {
      continue;
    }

    // Calcular diferença de tempo
    const [targetHour, targetMinute] = notification.time.split(':').map(Number);
    const targetTime = targetHour * 60 + targetMinute;
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    const timeDiff = Math.abs(currentTimeMinutes - targetTime);
    
    await logger.log('DEBUG', `⏰ Verificando: ${notification.title}`, {
      targetTime: notification.time,
      currentTime,
      timeDiff,
      shouldSend: timeDiff <= 1
    });

    // Enviar se estiver no horário (±1 minuto)
    if (timeDiff <= 1) {
      await logger.log('INFO', `📤 ENVIANDO: ${notification.title}`, {
        targetTime: notification.time,
        currentTime,
        timeDiff
      });
      
      try {
        // Tentar enviar notificação
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: `${APP_URL}/icons/logo.png`,
          badge: `${APP_URL}/icons/logo.png`,
          tag: `ym-sports-${Date.now()}`,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
          data: {
            url: `${APP_URL}/dashboard`,
            timestamp: Date.now(),
            scheduled: true,
            time: notification.time
          }
        });
        
        await logger.log('SUCCESS', `✅ Notificação enviada: ${notification.title}`);
        
        // Marcar como enviada
        notificationsSentToday.add(notificationKey);
        
        // Notificar clientes
        const clients = await self.clients.matchAll();
        await logger.log('INFO', `📱 Notificando ${clients.length} clientes`);
        
        clients.forEach(client => {
          client.postMessage({
            type: 'NOTIFICATION_SENT',
            notification: notification.title,
            time: currentTime,
            timestamp: Date.now()
          });
        });
        
      } catch (error) {
        await logger.log('ERROR', `❌ Erro ao enviar: ${notification.title}`, {
          error: error.message,
          stack: error.stack
        });
      }
    }
  }
}

// Verificar a cada minuto
const intervalId = setInterval(async () => {
  await logger.log('DEBUG', '⏱️ Intervalo disparado');
  await checkAndSendNotifications();
}, 60000);

await logger.log('INFO', '✅ setInterval configurado (60s)');

// Verificação imediata
await logger.log('INFO', '🚀 Executando verificação inicial');
await checkAndSendNotifications();

// INSTALAÇÃO
self.addEventListener('install', async (event) => {
  await logger.log('INFO', '⚙️ SW instalando...');
  self.skipWaiting();
  await logger.log('SUCCESS', '✅ SW instalado!');
});

// ATIVAÇÃO
self.addEventListener('activate', async (event) => {
  await logger.log('INFO', '⚙️ SW ativando...');
  
  event.waitUntil(
    clients.claim().then(async () => {
      await logger.log('SUCCESS', '✅ SW ativado e controlando páginas!');
      await checkAndSendNotifications();
    })
  );
});

// PUSH (para push notifications reais)
self.addEventListener('push', async (event) => {
  await logger.log('INFO', '📥 PUSH EVENT recebido', {
    hasData: !!event.data
  });
  
  let title = '⚽ YM Sports';
  let options = {
    body: 'Nova atualização!',
    icon: `${APP_URL}/icons/logo.png`,
    badge: `${APP_URL}/icons/logo.png`,
    data: { url: `${APP_URL}/dashboard` },
    vibrate: [200, 100, 200],
    tag: 'ym-sports-push'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      await logger.log('INFO', '✅ Push data parseado', data);
      title = data.title || title;
      options.body = data.body || options.body;
    } catch (error) {
      await logger.log('ERROR', '❌ Erro ao parsear push', {
        error: error.message
      });
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(async () => {
        await logger.log('SUCCESS', '✅ Push notification exibida');
      })
      .catch(async (error) => {
        await logger.log('ERROR', '❌ Erro ao exibir push', {
          error: error.message
        });
      })
  );
});

// CLICK NA NOTIFICAÇÃO
self.addEventListener('notificationclick', async (event) => {
  await logger.log('INFO', '🖱️ Notificação clicada', {
    action: event.action,
    tag: event.notification.tag
  });
  
  event.notification.close();

  if (event.action === 'close' || event.action === 'dismiss') {
    await logger.log('INFO', '❌ Usuário dispensou notificação');
    return;
  }

  const urlToOpen = event.notification.data?.url || `${APP_URL}/dashboard`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (clientList) => {
        await logger.log('INFO', `🔍 ${clientList.length} janelas abertas`);
        
        for (let client of clientList) {
          if (client.url.startsWith(APP_URL) && 'focus' in client) {
            await logger.log('INFO', '✅ Focando janela existente');
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          await logger.log('INFO', '🆕 Abrindo nova janela');
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// MENSAGENS
self.addEventListener('message', async (event) => {
  await logger.log('INFO', '📨 Mensagem recebida', {
    type: event.data?.type
  });
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    await logger.log('INFO', '⏩ SKIP_WAITING solicitado');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    await logger.log('INFO', '🔔 Verificação manual solicitada');
    await checkAndSendNotifications();
  }
  
  if (event.data && event.data.type === 'GET_LOGS') {
    const logs = await logger.getLogs(event.data.limit || 100);
    await logger.log('INFO', `📋 Enviando ${logs.length} logs`);
    
    if (event.ports[0]) {
      event.ports[0].postMessage({
        type: 'LOGS',
        logs
      });
    }
  }
  
  if (event.ports[0]) {
    event.ports[0].postMessage({
      type: 'ACK',
      message: 'SW recebeu mensagem',
      version: SW_VERSION
    });
  }
});

// Log periódico
setInterval(async () => {
  await logger.log('INFO', `💚 SW v${SW_VERSION} ativo`, {
    checkCount,
    cacheSize: notificationsSentToday.size,
    uptime: Date.now()
  });
}, 5 * 60 * 1000);

await logger.log('SUCCESS', '🎯 Sistema de notificações DEBUG inicializado!');

