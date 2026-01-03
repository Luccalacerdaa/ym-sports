# 🔧 Correção do Sistema de Ranking e Localização

## 📅 Data: 03/01/2025

## 🐛 Problemas Identificados

### 1. Erro 400 - "value too long for type character varying(2)"

**Problema:** 
- Ao atualizar localização, o campo `state` (VARCHAR(2)) estava recebendo nomes completos como "Minas Gerais" em vez de siglas como "MG"
- Causava erro de banco de dados e impedia atualização de localização

**Solução:**
- ✅ Adicionada validação no `updateUserLocation` para garantir que `state` tenha exatamente 2 caracteres
- ✅ Validação de estado válido no mapeamento `STATE_TO_REGION`
- ✅ Mensagens de erro claras e específicas
- ✅ Logs detalhados para debug

```typescript
// Validar que state é uma sigla de 2 caracteres
if (!state || state.length !== 2) {
  return { success: false, error: 'Estado deve ser uma sigla de 2 caracteres (ex: SP, RJ, MG)' };
}

// Mapear estado para região
const region = STATE_TO_REGION[state];
if (!region) {
  return { success: false, error: 'Estado inválido' };
}
```

### 2. Ranking não Atualizava ao Mudar de Estado

**Problema:**
- Usuário mudava de "MG" para "CE", mas continuava no ranking antigo
- Função `updateUserLocation` não retornava status de sucesso/erro corretamente
- Chamada da função estava passando objeto em vez de parâmetros separados

**Solução:**
- ✅ `updateUserLocation` agora retorna `{ success: boolean, error?: string, location?: {...} }`
- ✅ Corrigida chamada em `Ranking.tsx` para passar parâmetros corretos:
  ```typescript
  const result = await updateUserLocation(
    locationForm.state,           // string de 2 caracteres
    locationForm.city_approximate || '', 
    locationForm.postal_code_prefix || ''
  );
  ```
- ✅ Tratamento de erro melhorado com verificação de `result?.success`
- ✅ Recálculo de rankings após atualização bem-sucedida

### 3. Ranking Local Baseado em Estado (Não em GPS)

**Problema:**
- Ranking "local" mostrava todos os usuários do mesmo estado
- Em estados grandes como SP, MG, isso não representa "proximidade real"
- Usuário tinha que ficar atualizando manualmente a localização

**Solução:** 🌍 **RANKING LOCAL POR GPS COM RAIO DE 100KM**

#### Implementação:

1. **Função de Cálculo de Distância (Haversine)**
```typescript
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

2. **Busca Automática por GPS**
- Quando o usuário acessa o ranking "Local", o sistema:
  1. Verifica se o usuário tem GPS (latitude/longitude)
  2. Busca todos os usuários com GPS ativo
  3. Calcula distância entre o usuário atual e cada usuário
  4. Filtra apenas usuários dentro de 100km
  5. Ordena por pontos
  6. Exibe ranking local real

3. **Logs Detalhados**
```
🌍 Buscando ranking local por GPS (raio de 100km)...
📍 Usuário abc-123: 45.32km de distância
📍 Usuário def-456: 78.19km de distância
📍 Usuário ghi-789: 120.45km de distância (fora do raio)
👥 Encontrados 15 usuários próximos (raio de 100km)
✅ Ranking local por GPS configurado: 15 atletas
```

4. **Fallback Inteligente**
- Se o usuário não tem GPS ativo → mostra ranking por estado
- Se não há usuários próximos (raio de 100km) → mostra ranking por estado
- Mensagens claras no console para debug

## 📊 Benefícios das Mudanças

### Para os Usuários:
✅ **Ranking Local Real:** Competição justa com atletas realmente próximos  
✅ **Atualização Automática:** GPS atualiza automaticamente ao acessar ranking local  
✅ **Sem Erro 400:** Sistema valida dados antes de salvar  
✅ **Feedback Claro:** Mensagens de erro e sucesso específicas  

### Para Desenvolvimento:
✅ **Logs Detalhados:** Fácil identificar onde está o problema  
✅ **Validação de Dados:** Previne erros de banco de dados  
✅ **Código Limpo:** Funções retornam status claro de sucesso/erro  
✅ **Performance:** Busca apenas usuários com GPS para cálculo de distância  

## 🔄 Fluxo do Sistema Atualizado

### Atualização Manual de Localização:
```
1. Usuário seleciona estado (ex: "CE")
   ↓
2. Sistema valida: length === 2? ✅
   ↓
3. Sistema mapeia região: STATE_TO_REGION["CE"] = "Nordeste"
   ↓
4. Salva no banco: { state: "CE", region: "Nordeste", ... }
   ↓
5. Aguarda 1s para sincronização
   ↓
6. Recalcula rankings (nacional, regional, local)
   ↓
7. Atualiza posição do usuário
   ↓
8. Exibe toast: "✅ Rankings atualizados com sua nova localização!"
```

### Ranking Local por GPS:
```
1. Usuário acessa aba "Local"
   ↓
2. Sistema detecta: tem GPS? (lat/lng)
   ↓
3. Busca user_locations com GPS ativo
   ↓
4. Para cada usuário:
   - Calcula distância em km
   - Se <= 100km → adiciona à lista
   ↓
5. Busca progresso (pontos) dos usuários próximos
   ↓
6. Ordena por pontos (decrescente)
   ↓
7. Exibe ranking: #1, #2, #3...
```

## 🧪 Como Testar

### Teste 1: Validação de Estado
```typescript
// ❌ Deve falhar:
await updateUserLocation("Minas Gerais", "BH", "30000")
// Esperado: { success: false, error: "Estado deve ser uma sigla de 2 caracteres" }

// ✅ Deve funcionar:
await updateUserLocation("MG", "BH", "30000")
// Esperado: { success: true, location: { state: "MG", region: "Sudeste", ... } }
```

### Teste 2: Mudança de Estado
```typescript
1. Usuário em "MG" (Sudeste)
2. Mudar para "CE" (Nordeste)
3. Verificar:
   - Toast de sucesso aparece? ✅
   - Ranking regional muda de "Sudeste" para "Nordeste"? ✅
   - Rankings são recalculados? ✅
```

### Teste 3: Ranking Local GPS
```typescript
1. Garantir que usuário tem GPS ativo
2. Acessar aba "Local"
3. Abrir console e verificar:
   - "🌍 Buscando ranking local por GPS (raio de 100km)..."
   - Lista de distâncias para cada usuário
   - "👥 Encontrados X usuários próximos"
4. Verificar que apenas usuários próximos aparecem
```

## 📝 Arquivos Modificados

- **`src/hooks/useRanking.ts`**
  - Adicionada função `calculateDistance()`
  - Modificada `updateUserLocation()` com validação
  - Modificada `fetchRankings()` para buscar por GPS quando type='local'
  - Logs detalhados adicionados

- **`src/pages/Ranking.tsx`**
  - Corrigida chamada de `updateUserLocation()` com parâmetros corretos
  - Melhorado tratamento de erro com `result?.success`
  - Logs adicionados para debug

## 🚀 Próximos Passos Sugeridos

1. **Notificação de Mudança de Ranking Local**
   - "🎯 Você está competindo com 15 atletas próximos!"

2. **Configuração de Raio**
   - Permitir usuário escolher: 50km, 100km, 200km

3. **Mapa Visual**
   - Mostrar usuários próximos em um mapa (Mapbox)

4. **Atualização Periódica de GPS**
   - Recalcular localização a cada 24h automaticamente

5. **Conquistas de Proximidade**
   - "Campeão do Bairro" (1º no raio de 5km)
   - "Rei da Cidade" (1º no raio de 50km)

## ✅ Status: Implementado e Testado

- [x] Erro 400 corrigido
- [x] Validação de estado implementada
- [x] Ranking atualiza ao mudar de estado
- [x] Ranking local por GPS (100km)
- [x] Logs detalhados
- [x] Tratamento de erros
- [x] Fallback para ranking por estado
- [x] Commit e push realizados

---

**Desenvolvido em:** 03/01/2025  
**Commit:** `53d1c75 - fix: corrigir erro 400 e implementar ranking local por GPS`

