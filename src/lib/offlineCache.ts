/**
 * Utilitário de cache offline para YM Sports.
 * Salva dados no localStorage com TTL configurável por chave.
 *
 * Chaves usadas:
 *   ym_cache_profile_{userId}   → perfil do usuário
 *   ym_cache_events_{userId}    → eventos do calendário
 *   ym_cache_trainings_{userId} → treinos salvos
 */

interface CacheEntry<T> {
  data: T;
  saved_at: number; // ms
}

const TTL: Record<string, number> = {
  profile:   7  * 24 * 60 * 60 * 1000, // 7 dias
  events:    24 * 60 * 60 * 1000,       // 24 horas
  trainings: 48 * 60 * 60 * 1000,       // 48 horas
};

function key(type: string, userId: string): string {
  return `ym_cache_${type}_${userId}`;
}

export function saveCache<T>(type: string, userId: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, saved_at: Date.now() };
    localStorage.setItem(key(type, userId), JSON.stringify(entry));
  } catch {
    // localStorage cheio ou indisponível — ignorar silenciosamente
  }
}

export function loadCache<T>(type: string, userId: string): T | null {
  try {
    const raw = localStorage.getItem(key(type, userId));
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const ttl = TTL[type] ?? 24 * 60 * 60 * 1000;
    const age = Date.now() - entry.saved_at;

    if (age > ttl) {
      localStorage.removeItem(key(type, userId));
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function clearCache(type: string, userId: string): void {
  try { localStorage.removeItem(key(type, userId)); } catch { /* */ }
}

export function clearAllUserCache(userId: string): void {
  ['profile', 'events', 'trainings'].forEach(t => clearCache(t, userId));
}
