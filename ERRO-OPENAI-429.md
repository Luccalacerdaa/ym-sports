# ❌ ERRO 429 - OpenAI Cota Esgotada

## 🔴 Problema

```
429 You exceeded your current quota, please check your plan and billing details.
```

Sua chave da API da OpenAI atingiu o limite de uso.

---

## 📊 O que isso significa?

A API da OpenAI cobra por uso:
- **Gratuito:** $5 de crédito inicial (expira em 3 meses)
- **Pay-as-you-go:** Precisa adicionar crédito na conta

---

## ✅ SOLUÇÕES

### **Opção 1: Adicionar Crédito (Recomendado)**

1. Acesse: https://platform.openai.com/account/billing
2. Clique em "Add payment method"
3. Adicione um cartão
4. Adicione crédito (ex: $10)

**Custo aproximado por treino gerado:**
- 1 treino semanal (7 dias) = ~$0.10-0.20
- Com $10, você gera ~50-100 planos de treino completos

---

### **Opção 2: Criar Nova Chave (Temporário)**

Se você tem outra conta OpenAI:

1. Acesse: https://platform.openai.com/api-keys
2. Crie uma nova chave
3. Copie a chave
4. Me envie para atualizar no `.env`

---

### **Opção 3: Usar Treinos Pré-definidos (Sem IA)**

Posso criar um sistema de treinos pré-definidos que não usa IA:

**Vantagens:**
✅ Funciona imediatamente
✅ Sem custo
✅ Rápido

**Desvantagens:**
❌ Treinos não são personalizados
❌ Menos flexibilidade

---

## 🔧 COMO ATUALIZAR A CHAVE

Se você adicionar crédito ou criar nova chave:

### **1. Localmente:**

Edite o arquivo `.env.local`:

```env
VITE_OPENAI_API_KEY=sua-nova-chave-aqui
```

### **2. Na Vercel (Produção):**

1. Acesse: https://vercel.com/rota-rep/ym-sports/settings/environment-variables
2. Edite `VITE_OPENAI_API_KEY`
3. Cole a nova chave
4. Redeploy o projeto

---

## 💡 RECOMENDAÇÃO

**Melhor solução:** Adicionar crédito na conta OpenAI

- Custo baixo (~$10-20/mês para uso normal)
- Treinos personalizados por IA
- Melhor experiência do usuário

---

## 📞 ME DIGA:

Qual opção você prefere?

1. ✅ Vou adicionar crédito na OpenAI
2. ✅ Tenho outra chave para usar
3. ✅ Quero sistema de treinos pré-definidos (sem IA)

