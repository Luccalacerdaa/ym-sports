// Sistema de logs detalhado para debug de notificações
export class NotificationLogger {
  private static logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'success';
    source: string;
    message: string;
    data?: any;
  }> = [];

  private static readonly MAX_LOGS = 500; // Aumentar para mais logs

  static log(level: 'info' | 'warn' | 'error' | 'success', source: string, message: string, data?: any) {
    const timestamp = new Date().toLocaleString('pt-BR');
    const logEntry = { timestamp, level, source, message, data };
    
    // Adicionar ao array de logs
    this.logs.unshift(logEntry);
    
    // Limitar número de logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
    
    // Salvar no localStorage
    try {
      localStorage.setItem('ym-sports-notification-logs', JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Erro ao salvar logs:', e);
    }
    
    // Log no console com cores
    const emoji = {
      info: '🔵',
      warn: '🟡', 
      error: '🔴',
      success: '🟢'
    }[level];
    
    console.log(`${emoji} [${source}] ${message}`, data || '');
  }

  static info(source: string, message: string, data?: any) {
    this.log('info', source, message, data);
  }

  static warn(source: string, message: string, data?: any) {
    this.log('warn', source, message, data);
  }

  static error(source: string, message: string, data?: any) {
    this.log('error', source, message, data);
  }

  static success(source: string, message: string, data?: any) {
    this.log('success', source, message, data);
  }

  static getLogs() {
    try {
      const stored = localStorage.getItem('ym-sports-notification-logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return this.logs;
    }
  }

  static clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('ym-sports-notification-logs');
      this.info('SYSTEM', '🗑️ Logs limpos pelo usuário');
    } catch (e) {
      console.warn('Erro ao limpar logs:', e);
    }
  }

  // Salvar logs críticos permanentemente
  static saveCriticalLog(message: string, data?: any) {
    const criticalLog = {
      timestamp: new Date().toLocaleString('pt-BR'),
      message,
      data
    };
    
    try {
      const existingCritical = localStorage.getItem('ym-sports-critical-logs');
      const criticalLogs = existingCritical ? JSON.parse(existingCritical) : [];
      
      criticalLogs.unshift(criticalLog);
      
      // Manter apenas os últimos 50 logs críticos
      if (criticalLogs.length > 50) {
        criticalLogs.splice(50);
      }
      
      localStorage.setItem('ym-sports-critical-logs', JSON.stringify(criticalLogs));
    } catch (e) {
      console.warn('Erro ao salvar log crítico:', e);
    }
  }

  // Recuperar logs críticos
  static getCriticalLogs() {
    try {
      const stored = localStorage.getItem('ym-sports-critical-logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  static exportLogs() {
    const logs = this.getLogs();
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()} [${log.source}] ${log.message}${log.data ? ' | Data: ' + JSON.stringify(log.data) : ''}`
    ).join('\n');
    
    return logText;
  }

  // Verificar estado das notificações
  static async checkNotificationStatus() {
    this.info('SYSTEM', '🔍 Verificando estado das notificações...');
    
    // Verificar suporte
    const hasNotification = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    this.info('SYSTEM', `Suporte Notification API: ${hasNotification}`);
    this.info('SYSTEM', `Suporte Service Worker: ${hasServiceWorker}`);
    
    if (hasNotification) {
      const permission = Notification.permission;
      this.info('SYSTEM', `Permissão atual: ${permission}`);
      
      if (permission === 'granted') {
        this.success('SYSTEM', '✅ Permissão concedida para notificações');
      } else if (permission === 'denied') {
        this.error('SYSTEM', '❌ Permissão negada para notificações');
      } else {
        this.warn('SYSTEM', '⚠️ Permissão pendente para notificações');
      }
    }
    
    if (hasServiceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready;
        this.success('SYSTEM', '✅ Service Worker ativo', {
          scope: registration.scope,
          state: registration.active?.state
        });
      } catch (error) {
        this.error('SYSTEM', '❌ Erro no Service Worker', error);
      }
    }
    
    // Verificar se está em HTTPS
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    this.info('SYSTEM', `Conexão segura (HTTPS): ${isSecure}`);
    
    // Verificar se está em foco
    const isVisible = !document.hidden;
    this.info('SYSTEM', `Página visível: ${isVisible}`);
    
    return {
      hasNotification,
      hasServiceWorker,
      permission: hasNotification ? Notification.permission : 'not-supported',
      isSecure,
      isVisible
    };
  }
}

// Logs automáticos de eventos importantes
if (typeof window !== 'undefined') {
  // Log quando a página perde/ganha foco
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      NotificationLogger.warn('PAGE', '👁️ Página saiu de foco (background)');
    } else {
      NotificationLogger.info('PAGE', '👁️ Página voltou ao foco (foreground)');
    }
  });
  
  // Log quando a janela perde/ganha foco
  window.addEventListener('blur', () => {
    NotificationLogger.warn('WINDOW', '🪟 Janela perdeu foco');
  });
  
  window.addEventListener('focus', () => {
    NotificationLogger.info('WINDOW', '🪟 Janela ganhou foco');
  });
  
  // Log de erros não capturados
  window.addEventListener('error', (event) => {
    NotificationLogger.error('GLOBAL', '💥 Erro não capturado', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    });
  });
}
