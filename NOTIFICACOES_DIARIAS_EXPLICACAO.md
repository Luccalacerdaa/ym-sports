# 📅 Notificações Diárias - Como Funciona

## 🎯 **Resumo Rápido:**

**Você NÃO precisa fazer nada!** O workflow roda automaticamente nos horários programados todos os dias! ✅

---

## 🤔 **Sua Dúvida:**

> "Preciso deixar somente essa de test ou tenho que dar run nas outras? Ou essa de test já envia as notificações do dia todo?"

---

## ✅ **RESPOSTA:**

### **"Test" = Apenas para TESTAR**

Quando você clica em **"Run workflow"** e escolhe tipo **`test`**:
- ✅ Envia UMA notificação de teste
- ✅ Apenas para você verificar se está funcionando
- ❌ **NÃO envia** as notificações do dia todo

**É só para verificar se o sistema está OK!**

---

### **Notificações Diárias = AUTOMÁTICAS**

As notificações diárias funcionam assim:

```yaml
07:00 BRT - GitHub Actions roda automaticamente → Envia "Bom dia"
09:00 BRT - GitHub Actions roda automaticamente → Envia "Hidratação"
11:30 BRT - GitHub Actions roda automaticamente → Envia "Treino manhã"
14:00 BRT - GitHub Actions roda automaticamente → Envia "Hidratação"
17:00 BRT - GitHub Actions roda automaticamente → Envia "Treino tarde"
19:00 BRT - GitHub Actions roda automaticamente → Envia "Hidratação"
21:00 BRT - GitHub Actions roda automaticamente → Envia "Boa noite"
```

**Você NÃO precisa fazer NADA!** É tudo automático! 🤖

---

## 📊 **Como Ver se Está Funcionando:**

### **Opção 1: Aguardar os horários**

Simplesmente espere:
- Amanhã às 07:00 → Deve chegar "Bom dia"
- Amanhã às 09:00 → Deve chegar "Hidratação"
- E assim por diante...

### **Opção 2: Ver histórico**

1. GitHub Actions → **Notificações Diárias Automáticas**
2. Ver execuções passadas
3. Você verá execuções automáticas nos horários (em UTC, 3h na frente)

Exemplo:
```
10:00 UTC (07:00 BRT) - success ✅
12:00 UTC (09:00 BRT) - success ✅
14:30 UTC (11:30 BRT) - success ✅
```

### **Opção 3: Testar manualmente**

Se quiser testar AGORA (sem esperar):
1. GitHub Actions → **Notificações Diárias Automáticas**
2. **Run workflow**
3. Tipo: `test`
4. Run

Isso envia UMA notificação de teste imediatamente.

---

## 🔄 **Workflows Automáticos:**

Você tem **2 workflows** rodando automaticamente:

### **1. Notificações Diárias Automáticas** 📅
```
Quando roda: 7x por dia (horários fixos)
O que faz: Envia notificações motivacionais/lembretes
Para quem: TODOS os usuários
Você precisa fazer algo: NÃO ❌
```

### **2. Notificações de Eventos (Calendário)** 📆
```
Quando roda: A cada 5-15 minutos (24/7)
O que faz: Verifica eventos próximos e notifica
Para quem: Usuário que criou o evento
Você precisa fazer algo: NÃO ❌
```

---

## 🧪 **Quando Usar "Run Workflow" Manual:**

### **Use para TESTAR:**

✅ **Quando usar:**
- Acabou de configurar e quer testar
- Mudou alguma coisa e quer validar
- Quer ver se notificações estão chegando
- Debug de problemas

❌ **NÃO precisa usar:**
- Todos os dias
- Para enviar notificações normais
- Em horários específicos

---

## 📊 **Tipos de Execução:**

### **Manual (você clica):**
```
GitHub Actions → Run workflow → Tipo: test
↓
Envia 1 notificação de teste AGORA
↓
Aparece: "Manually run by Luccalacerdaa"
```

### **Automática (GitHub Actions):**
```
07:00 BRT → GitHub Actions roda sozinho
↓
Envia notificação para todos
↓
Aparece: "Schedule" (ícone de relógio)
```

---

## 💡 **Exemplos Práticos:**

### **Cenário 1: Acabei de configurar**
```
Você: "Quero testar se funciona"
Ação: Run workflow → test
Resultado: 1 notificação de teste chega
Conclusão: Sistema OK! ✅
```

### **Cenário 2: Dia normal**
```
Você: *Não faz nada*
07:00 → GitHub Actions envia "Bom dia"
09:00 → GitHub Actions envia "Hidratação"
11:30 → GitHub Actions envia "Treino"
... etc
Você: Recebe todas automaticamente ✅
```

### **Cenário 3: Criou evento**
```
Você: Cria evento no calendário para 15:00
14:30 → GitHub Actions detecta (faltam 30min)
14:30 → Você recebe notificação
Você: *Não precisa fazer nada* ✅
```

---

## ⏰ **Horários UTC vs BRT:**

**GitHub Actions usa UTC** (horário de Londres), mas converte para BRT:

| Horário BRT | Horário UTC | Notificação |
|-------------|-------------|-------------|
| 07:00 | 10:00 | 💪 Bom dia |
| 09:00 | 12:00 | 💧 Hidratação |
| 11:30 | 14:30 | 🏋️ Treino manhã |
| 14:00 | 17:00 | 💧 Hidratação |
| 17:00 | 20:00 | 🏃‍♂️ Treino tarde |
| 19:00 | 22:00 | 💧 Hidratação |
| 21:00 | 00:00 | 🌙 Boa noite |

**Você recebe no horário BRT correto!** ✅

---

## 📈 **Monitorar Execuções:**

### **Ver execuções automáticas:**

1. GitHub Actions
2. **Notificações Diárias Automáticas**
3. Filtrar por: **Schedule**
4. Ver histórico:
   ```
   10:00 UTC - success - 8s
   12:00 UTC - success - 7s
   14:30 UTC - success - 9s
   ```

### **Ver se teve erro:**

Se algo der errado, vai aparecer:
```
❌ failed (vermelho)
```

Mas isso é raro! Normalmente tudo funciona automaticamente. ✅

---

## 🎯 **Resumo Final:**

| Pergunta | Resposta |
|----------|----------|
| **Preciso rodar manual?** | ❌ NÃO - É automático |
| **Test envia o dia todo?** | ❌ NÃO - Só 1 notificação |
| **Quando testar?** | ✅ Só para verificar se funciona |
| **Notificações chegam sozinhas?** | ✅ SIM - Automaticamente |
| **Preciso fazer algo?** | ❌ NÃO - Só aguardar |

---

## ✅ **Checklist de Funcionamento:**

Para ter certeza que está tudo OK:

- [x] Secrets configurados (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)
- [x] Teste manual funcionou (enviou notificação)
- [x] Push ativo em `/dashboard/settings`
- [x] Permissões concedidas
- [ ] Aguardar notificação automática (próximo horário)
- [ ] Verificar se chegou ✅

---

## 💡 **Dica:**

Se quiser verificar se está funcionando **SEM esperar até amanhã**, você pode:

1. **Ver histórico de execuções** no GitHub Actions
2. **Testar manualmente** com Run workflow → test
3. **Criar um evento de teste** daqui 15 min e ver se notificação chega

Mas não precisa ficar rodando manual todo dia! **É tudo automático!** 🚀

---

## 🎉 **Está Pronto!**

**Sistema 100% funcional e automático:**

✅ Notificações diárias → Automáticas (7x/dia)  
✅ Notificações de eventos → Automáticas (a cada 5-15min)  
✅ Funciona com app fechado → GitHub Actions  
✅ Custo → $0/mês  
✅ Você precisa fazer → NADA! 🎯  

**Aproveite o sistema automático!** 🚀

