/**
 * AI Cache Service - YM Sports
 * 
 * Cacheia respostas da OpenAI para economizar custos e melhorar performance.
 * 
 * Economia esperada: 30-50% nos custos da OpenAI
 * Performance: Respostas instantâneas para prompts similares
 */

import { supabase } from '@/lib/supabase';

interface CacheEntry {
  id?: string;
  prompt_hash: string;
  prompt_type: 'training' | 'nutrition';
  user_params: any;
  response: any;
  created_at?: string;
  hit_count?: number;
}

/**
 * Gera hash do prompt baseado nos parâmetros do usuário
 */
function generateHash(type: string, params: any): string {
  const sortedParams = JSON.stringify(params, Object.keys(params).sort());
  const hashInput = `${type}:${sortedParams}`;
  
  // Simple hash function (pode usar crypto.subtle.digest para hash real)
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Normaliza parâmetros para aumentar taxa de cache hit
 */
function normalizeParams(params: any): any {
  const normalized = { ...params };
  
  // Arredondar peso e altura para faixas (aumenta cache hit)
  if (normalized.weight) {
    normalized.weight = Math.round(normalized.weight / 5) * 5; // Arredonda para múltiplo de 5
  }
  if (normalized.height) {
    normalized.height = Math.round(normalized.height / 5) * 5;
  }
  if (normalized.age) {
    normalized.age = Math.round(normalized.age / 2) * 2; // Arredonda para múltiplo de 2
  }
  
  // Remover campos que não afetam o resultado
  delete normalized.userId;
  delete normalized.timestamp;
  
  return normalized;
}

/**
 * Busca resposta no cache
 */
export async function getCachedResponse(
  type: 'training' | 'nutrition',
  params: any
): Promise<any | null> {
  try {
    const normalizedParams = normalizeParams(params);
    const hash = generateHash(type, normalizedParams);
    
    const { data, error } = await supabase
      .from('ai_cache')
      .select('*')
      .eq('prompt_hash', hash)
      .eq('prompt_type', type)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Incrementar contador de hits
    await supabase
      .from('ai_cache')
      .update({ hit_count: (data.hit_count || 0) + 1 })
      .eq('id', data.id);
    
    console.log(`✅ Cache HIT para ${type} (hash: ${hash})`);
    return data.response;
    
  } catch (error) {
    console.error('Erro ao buscar cache:', error);
    return null;
  }
}

/**
 * Salva resposta no cache
 */
export async function setCachedResponse(
  type: 'training' | 'nutrition',
  params: any,
  response: any
): Promise<void> {
  try {
    const normalizedParams = normalizeParams(params);
    const hash = generateHash(type, normalizedParams);
    
    const cacheEntry: CacheEntry = {
      prompt_hash: hash,
      prompt_type: type,
      user_params: normalizedParams,
      response: response,
      hit_count: 0
    };
    
    // Upsert (inserir ou atualizar)
    const { error } = await supabase
      .from('ai_cache')
      .upsert(cacheEntry, { 
        onConflict: 'prompt_hash',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Erro ao salvar cache:', error);
    } else {
      console.log(`💾 Cache MISS - salvando resposta (hash: ${hash})`);
    }
    
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
}

/**
 * Limpa cache antigo (mais de 30 dias)
 */
export async function cleanOldCache(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error } = await supabase
      .from('ai_cache')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    if (error) {
      console.error('Erro ao limpar cache:', error);
    }
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

/**
 * Estatísticas do cache
 */
export async function getCacheStats(): Promise<{
  total_entries: number;
  total_hits: number;
  hit_rate: number;
}> {
  try {
    const { data, error } = await supabase
      .from('ai_cache')
      .select('hit_count');
    
    if (error || !data) {
      return { total_entries: 0, total_hits: 0, hit_rate: 0 };
    }
    
    const totalEntries = data.length;
    const totalHits = data.reduce((sum, entry) => sum + (entry.hit_count || 0), 0);
    const hitRate = totalEntries > 0 ? (totalHits / totalEntries) * 100 : 0;
    
    return {
      total_entries: totalEntries,
      total_hits: totalHits,
      hit_rate: Math.round(hitRate * 100) / 100
    };
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total_entries: 0, total_hits: 0, hit_rate: 0 };
  }
}
