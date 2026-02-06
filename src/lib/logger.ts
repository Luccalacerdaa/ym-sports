/**
 * Sistema de logging seguro
 * Remove logs sensíveis em produção
 */

const isDevelopment = import.meta.env.DEV;
const ENABLE_LOGS = import.meta.env.VITE_ENABLE_LOGS === 'true' || isDevelopment;

/**
 * Lista de palavras sensíveis que devem ser filtradas
 */
const SENSITIVE_KEYWORDS = [
  'password',
  'token',
  'key',
  'secret',
  'supabase',
  'apikey',
  'auth',
  'Bearer',
  'jwt',
  'session',
  'credential'
];

/**
 * Sanitiza dados sensíveis antes de logar
 */
const sanitizeData = (data: any): any => {
  if (typeof data === 'string') {
    // Não logar strings que parecem tokens ou keys
    if (data.length > 50 && !data.includes(' ')) {
      return '[REDACTED]';
    }
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {};
    
    for (const key in data) {
      // Verificar se a chave contém palavra sensível
      const isSensitive = SENSITIVE_KEYWORDS.some(keyword => 
        key.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    
    return sanitized;
  }

  return data;
};

/**
 * Logger seguro que não expõe dados sensíveis
 */
export const logger = {
  log: (...args: any[]) => {
    if (!ENABLE_LOGS) return;
    console.log(...args.map(sanitizeData));
  },
  
  error: (...args: any[]) => {
    if (!ENABLE_LOGS) return;
    console.error(...args.map(sanitizeData));
  },
  
  warn: (...args: any[]) => {
    if (!ENABLE_LOGS) return;
    console.warn(...args.map(sanitizeData));
  },
  
  info: (...args: any[]) => {
    if (!ENABLE_LOGS) return;
    console.info(...args.map(sanitizeData));
  },
  
  debug: (...args: any[]) => {
    if (!ENABLE_LOGS || !isDevelopment) return;
    console.debug(...args.map(sanitizeData));
  }
};

/**
 * Desabilitar console.log globalmente em produção
 */
export const disableConsoleLogs = () => {
  if (!isDevelopment && !ENABLE_LOGS) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Manter error e warn para debugging crítico
  }
};
