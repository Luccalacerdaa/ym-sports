# 💰 Custos do GitHub Actions

## 🆓 **Resumo Rápido:**

**Plano Grátis (Free):**
- ✅ **2.000 minutos/mês** de execução
- ✅ **500 MB** de armazenamento
- ✅ Repositórios públicos: **ILIMITADO**
- ✅ Renovação: **TODO MÊS**

**Para este projeto:**
- 📊 Uso estimado: **~100-150 minutos/mês**
- 💵 Custo: **$0.00** (dentro do limite grátis)
- ✅ **Você NÃO vai pagar nada!**

---

## 📊 **Cálculo Detalhado**

### **Nossos Workflows:**

#### **1. Notificações Diárias**
```
Frequência: 7 vezes por dia
Duração: ~30 segundos cada
Cálculo: 7 × 30s = 3.5 minutos/dia
Mensal: 3.5 × 30 = 105 minutos/mês
```

#### **2. Notificações de Eventos**
```
Frequência: A cada 5 minutos (24h por dia)
Execuções: 12 por hora × 24 horas = 288 por dia
Duração: ~10 segundos cada (na maioria das vezes)
Cálculo: 288 × 10s = 2.880 segundos = 48 minutos/dia
Mensal: 48 × 30 = 1.440 minutos/mês
```

**⚠️ ATENÇÃO:** Isso seria muito se **sempre** rodasse 10s, mas:
- Se não há eventos → termina em **2-3 segundos**
- Só leva 10s quando **há eventos** para notificar
- Na prática: **~15-20 minutos/dia** = **450-600 minutos/mês**

### **Total Realista:**
```
Notificações diárias:  105 min/mês
Notificações eventos:  500 min/mês (estimativa conservadora)
──────────────────────────────────
TOTAL:                 605 min/mês ✅
```

---

## 📉 **Otimização do Workflow de Eventos**

### **Problema:**
Rodar a cada 5 minutos pode consumir muito.

### **Solução 1: Aumentar intervalo** (Recomendado)
```yaml
# Em vez de a cada 5 minutos:
- cron: '*/5 * * * *'

# Mudar para a cada 15 minutos:
- cron: '*/15 * * * *'
```

**Economia:**
- De 288 execuções/dia → para 96 execuções/dia
- Reduz de ~500 min/mês → para ~160 min/mês
- **Total: ~265 min/mês** (87% de economia!)

**Impacto:**
- Notificação pode atrasar até 15 minutos
- Ainda é muito rápido para eventos
- Exemplo: Evento às 18:00 → notifica entre 17:30-17:45

### **Solução 2: Horário comercial**
```yaml
# Rodar apenas durante o dia (7h-22h BRT)
- cron: '*/10 10-1 * * *'  # 07:00-22:00 BRT
```

**Economia adicional:**
- Ignora madrugada (menos eventos acontecem)
- Reduz ainda mais o uso

---

## 💵 **E se ultrapassar 2.000 minutos?**

### **Custos após o limite:**

**GitHub cobra por minuto extra:**
- Linux (nosso caso): **$0.008 por minuto**
- Ou seja: **$0.80 por 100 minutos**

**Exemplo:**
```
Uso: 2.500 minutos
Grátis: 2.000 minutos
Pago: 500 minutos
Custo: 500 × $0.008 = $4.00
```

### **Limite de segurança:**

Você pode configurar um **limite de gastos**:

1. GitHub → Settings → Billing
2. Spending limits
3. Set to: **$0** (bloqueia se acabar os 2.000 min)
4. Ou: **$5** (permite pequeno excesso)

---

## 📊 **Monitorar Uso**

### **Ver uso atual:**

1. GitHub → Settings
2. **Billing and plans**
3. **Usage this month**

Você verá algo como:
```
Actions minutes:
Used: 234 / 2,000 minutes
Remaining: 1,766 minutes
```

### **Alertas:**

Configure para receber email quando:
- Usar 75% (1.500 min)
- Usar 90% (1.800 min)

---

## 🎯 **Configuração Recomendada**

### **Para economizar e manter eficiente:**

```yaml
# .github/workflows/calendar-notifications.yml
on:
  schedule:
    # A cada 15 minutos (em vez de 5)
    - cron: '*/15 * * * *'
```

**Resultado:**
```
Notificações diárias:  105 min/mês
Notificações eventos:  160 min/mês (15min interval)
──────────────────────────────────
TOTAL:                 265 min/mês ✅

Economia mensal:       87% vs 2.000 min
Custo mensal:          $0.00
```

---

## 🔢 **Cenários de Uso**

### **Cenário 1: Conservador (Recomendado)**
```
Intervalo eventos: 15 minutos
Uso mensal: ~265 minutos
Custo: $0.00
Eficiência: ⭐⭐⭐⭐⭐
```

### **Cenário 2: Balanceado**
```
Intervalo eventos: 10 minutos
Uso mensal: ~400 minutos
Custo: $0.00
Eficiência: ⭐⭐⭐⭐
```

### **Cenário 3: Agressivo (Atual)**
```
Intervalo eventos: 5 minutos
Uso mensal: ~605 minutos
Custo: $0.00
Eficiência: ⭐⭐⭐
```

### **Cenário 4: Se tiver muitos usuários**
```
Intervalo eventos: 5 minutos
Usuários: 100+
Uso mensal: ~1.200 minutos
Custo: $0.00 (ainda dentro do limite!)
Eficiência: ⭐⭐
```

---

## 💡 **Dicas de Economia**

### **1. Otimizar duração de cada workflow**
```yaml
# Má prática:
- name: Step
  run: |
    sleep 10  # Desperdiça tempo
    
# Boa prática:
- name: Step
  run: |
    # Fazer tudo rápido e sair
```

### **2. Usar cache quando possível**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### **3. Cancelar workflows duplicados**
```yaml
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: true
```

### **4. Rodar apenas quando necessário**
```yaml
# Não rodar em madrugada se não precisa
- cron: '0 10-22 * * *'  # Apenas 10h-22h UTC
```

---

## 📈 **Crescimento do Projeto**

### **Com 10 usuários:**
- Uso: ~265 min/mês
- Custo: $0.00

### **Com 100 usuários:**
- Uso: ~400 min/mês (workflows são para todos)
- Custo: $0.00

### **Com 1.000 usuários:**
- Uso: ~800 min/mês
- Custo: $0.00

### **Com 10.000 usuários:**
- Uso: ~1.800 min/mês
- Custo: $0.00
- ⚠️ Próximo do limite, considerar:
  - Aumentar intervalo (15→20 min)
  - Ou migrar para serviço dedicado

---

## 🔄 **Alternativas (se crescer muito)**

### **Se ultrapassar limite grátis:**

**Opção 1: GitHub Pro**
- Custo: $4/mês
- Inclui: **3.000 minutos/mês**

**Opção 2: GitHub Team**
- Custo: $4/usuário/mês
- Inclui: **3.000 minutos/mês**

**Opção 3: Serviço próprio**
- Cron job em servidor próprio
- Heroku, Railway, Render (todos têm plano grátis)
- Vercel Cron (grátis no Hobby plan)

**Opção 4: Supabase Functions**
- Usar Functions do Supabase
- Também tem plano grátis generoso

---

## ✅ **Conclusão**

### **Para este projeto:**

📊 **Uso Atual (Otimizado):**
```
~265 minutos/mês (com intervalo 15min em eventos)
```

💰 **Custo:**
```
$0.00/mês (muito dentro do limite grátis!)
```

🔄 **Renovação:**
```
TODO MÊS - limite reseta dia 1º
```

⚠️ **Limite de Segurança:**
```
Configure para $0 para não ter surpresas
```

📈 **Escalabilidade:**
```
Suporta até ~10.000 usuários no plano grátis!
```

---

## 🎉 **Resumo Final**

✅ **Você NÃO vai pagar nada**
✅ **2.000 minutos/mês = MUITO para este projeto**
✅ **Renovação mensal automática**
✅ **Pode configurar limite de $0**
✅ **Escalável até milhares de usuários**

**Use sem medo!** O GitHub Actions é **generoso** para projetos como o seu! 🚀

