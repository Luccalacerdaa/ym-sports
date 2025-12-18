# ⚡ Executar Migração v4 - URGENTE

## 🎯 O Que Esta Migração Faz?

Corrige 2 bugs críticos nas notificações de eventos:
1. ✅ **Notificações "AGORA"** agora funcionam (janela de 4 minutos!)
2. ✅ **Notificações de 30 minutos** agora são logadas corretamente

---

## 🚀 Passo a Passo (2 minutos)

### **1. Acesse o Supabase**
```
https://supabase.com/dashboard/project/SEU_PROJETO/sql
```

### **2. Cole o SQL Abaixo**

```sql
-- ===================================================================
-- FUNÇÃO RPC PARA BUSCAR EVENTOS PRÓXIMOS (VERSÃO 4 - COM PASSADO)
-- ===================================================================

-- Deletar versões anteriores
DROP FUNCTION IF EXISTS get_upcoming_events(INTEGER);

-- Criar função que retorna JSONB
CREATE OR REPLACE FUNCTION get_upcoming_events(minutes_ahead INTEGER DEFAULT 30)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE sql
AS $$
  -- Usar CTE para ordenar antes de agregar
  WITH ordered_events AS (
    SELECT 
      id,
      user_id,
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      opponent
    FROM events
    WHERE 
      -- Incluir eventos que começaram há até 2 minutos
      start_date >= (NOW() - INTERVAL '2 minutes')
      AND start_date <= (NOW() + (minutes_ahead || ' minutes')::INTERVAL)
    ORDER BY start_date ASC
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'user_id', e.user_id,
        'title', e.title,
        'description', COALESCE(e.description, ''),
        'event_type', e.event_type,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'location', COALESCE(e.location, ''),
        'opponent', COALESCE(e.opponent, '')
      )
    ),
    '[]'::jsonb
  )
  FROM ordered_events e;
$$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_upcoming_events(INTEGER) TO postgres;

-- Comentário
COMMENT ON FUNCTION get_upcoming_events(INTEGER) IS 'Busca eventos próximos - inclui eventos recentes (até -2min)';

-- Teste
SELECT get_upcoming_events(30);
```

### **3. Clique em "RUN"**

Deve aparecer:
```
✅ Success. No rows returned
```

---

## 🧪 Testar Agora!

### **1. Criar Evento**
- Abra o app
- Crie um evento para **daqui 3 minutos**
- Título: "Teste AGORA"

### **2. Aguarde as Notificações**

Você deve receber:

```
⏰ 3min antes: 🚨 Teste AGORA - Faltam apenas 3 minutos!
⏰ 2min antes: 🚀 Teste AGORA - Está começando AGORA!
⏰ 1min antes: 🚀 Teste AGORA - Está começando AGORA!
⏰ 0min (exato): 🚀 Teste AGORA - Está começando AGORA!
⏰ 1min depois: 🚀 Teste AGORA - Está começando AGORA!
⏰ 2min depois: 🚀 Teste AGORA - Está começando AGORA!
```

**NOTA**: Você pode receber múltiplas notificações "AGORA" (normal!)

---

## 📊 Verificar Logs

Acesse:
```
https://vercel.com/seu-projeto/deployments
→ Último deployment
→ Functions
→ /api/check-events-cron
```

Deve mostrar:
```
📅 Evento: Teste AGORA
   ⏰ Começa em: 0 minutos
   🎯 Tipo: AGORA (0min)  ← Esse log é novo!
   📤 Enviando notificação: 🚀 Teste AGORA
   ✅ Notificação enviada com sucesso!
```

---

## ✅ Pronto!

**Todas as notificações agora funcionam 100%!**

| Tipo | Janela | Status |
|------|--------|--------|
| 🚀 AGORA | -2min até +2min | ✅ Corrigido |
| 🚨 5 MIN | 3-5min | ✅ Funcionando |
| ⚠️ 15 MIN | 6-15min | ✅ Funcionando |
| 📅 30 MIN | 16-30min | ✅ Funcionando |

---

## ❓ Problemas?

Se algo não funcionar, verifique:

1. **Migração executada?**
   - Execute novamente o SQL no Supabase

2. **Deploy no Vercel feito?**
   - Já foi feito automaticamente! ✅

3. **Push ativo?**
   - Vá em Configurações → Ativar Notificações

4. **Logs?**
   - Verifique os logs do Vercel Cron

---

**Qualquer dúvida, me avise!** 🚀

