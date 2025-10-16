# 🤖 Configuração da API da OpenAI

## ✅ **INTEGRAÇÃO REAL DA OPENAI IMPLEMENTADA!**

### 🔑 **Como Configurar a API Key**

Para usar o sistema de treinos com IA, você precisa configurar sua API key da OpenAI.

#### **1. Obter API Key da OpenAI:**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em **"Create new secret key"**
4. Copie a API key gerada

#### **2. Configurar no Projeto:**

**Opção A - Arquivo .env.local (Recomendado):**
```bash
# Crie o arquivo .env.local na raiz do projeto
touch .env.local
```

Adicione no arquivo `.env.local`:
```env
VITE_OPENAI_API_KEY=sk-sua-api-key-aqui
```

**Opção B - Variáveis de Ambiente do Sistema:**
```bash
export VITE_OPENAI_API_KEY=sk-sua-api-key-aqui
```

**Opção C - Para Desenvolvimento (Temporário):**
Você pode editar diretamente o arquivo `src/hooks/useAITraining.ts` e substituir:
```typescript
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
```

Por:
```typescript
const apiKey = "sk-sua-api-key-aqui";
```

⚠️ **ATENÇÃO:** Nunca commite a API key no código!

#### **3. Reiniciar o Servidor:**
Após configurar a API key, reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

---

## 🧠 **Como Funciona a IA**

### **Prompt Personalizado:**
A IA recebe um prompt completo com:
- **Perfil do usuário:** Nome, idade, altura, peso, posição
- **Objetivos:** Melhorar condicionamento, ganhar massa, etc.
- **Dias disponíveis:** Segunda, quarta, sexta, etc.
- **Duração:** Tempo por sessão de treino
- **Dificuldade:** Iniciante, intermediário, avançado
- **Equipamentos:** Peso corporal, halteres, etc.
- **Foco:** Força, cardio, flexibilidade, etc.

### **Resposta Estruturada:**
A IA retorna um JSON com:
- **Plano semanal** organizado por dias
- **Exercícios específicos** para cada treino
- **Séries e repetições** adequadas ao nível
- **Duração estimada** de cada exercício
- **Grupos musculares** trabalhados

---

## 🎯 **Exemplo de Uso**

### **1. Configurar API Key:**
```env
VITE_OPENAI_API_KEY=sk-proj-abc123def456...
```

### **2. Gerar Treinos:**
1. Vá para **Dashboard → Treinos**
2. Clique em **"Gerar com IA"**
3. Preencha o formulário:
   - **Objetivos:** Melhorar condicionamento, Aumentar força
   - **Dias:** Segunda, Quarta, Sexta
   - **Duração:** 60 minutos
   - **Dificuldade:** Intermediário
   - **Equipamentos:** Peso corporal, Halteres
   - **Foco:** Força, Específico para futebol
4. Clique em **"Gerar Plano"**

### **3. Resultado:**
A IA gerará treinos personalizados baseados no seu perfil e objetivos!

---

## 🔧 **Configurações Técnicas**

### **Modelo Usado:**
- **GPT-3.5-turbo** - Modelo rápido e eficiente
- **Temperature:** 0.7 - Balance entre criatividade e consistência
- **Max Tokens:** 2000 - Limite de resposta

### **Tratamento de Erros:**
- ✅ **API key não configurada**
- ✅ **Cota esgotada**
- ✅ **API key inválida**
- ✅ **Resposta inválida**
- ✅ **Erro de conexão**

### **Segurança:**
- ✅ **API key no lado cliente** (apenas para desenvolvimento)
- ✅ **Validação de entrada**
- ✅ **Tratamento de erros**
- ✅ **Parse seguro do JSON**

---

## 💰 **Custos da API**

### **GPT-3.5-turbo:**
- **Input:** $0.0015 por 1K tokens
- **Output:** $0.002 por 1K tokens
- **Estimativa por treino:** ~$0.01-0.05

### **Exemplo de Custo:**
- **100 treinos gerados:** ~$1-5
- **Uso moderado:** ~$5-10/mês

---

## 🚀 **Testando a Integração**

### **1. Verificar Configuração:**
```javascript
// No console do navegador
console.log(import.meta.env.VITE_OPENAI_API_KEY);
```

### **2. Testar Geração:**
1. Configure a API key
2. Vá para **Treinos**
3. Clique em **"Gerar com IA"**
4. Preencha o formulário
5. Clique em **"Gerar Plano"**

### **3. Verificar Logs:**
Abra o console do navegador para ver:
- ✅ **Prompt enviado**
- ✅ **Resposta da IA**
- ✅ **Treinos criados**

---

## 🎊 **RESULTADO FINAL**

### ✅ **Integração Completa:**
- **API real da OpenAI** configurada
- **Prompt personalizado** baseado no perfil
- **Resposta estruturada** em JSON
- **Tratamento de erros** robusto
- **Interface intuitiva** para configuração

### ✅ **Funcionalidades:**
- **Geração automática** de treinos
- **Personalização baseada** no perfil
- **Objetivos específicos** do usuário
- **Dias flexíveis** da semana
- **Equipamentos disponíveis**

**🚀 AGORA PODE USAR IA REAL PARA GERAR TREINOS PERSONALIZADOS!**

1. **Configure a API key** da OpenAI
2. **Gere treinos** personalizados com IA
3. **Veja os resultados** no dashboard
4. **Acompanhe seu progresso** semanal

**O sistema está 100% funcional com IA real! 🎉**
