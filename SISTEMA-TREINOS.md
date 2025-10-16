# 🏋️ Sistema de Treinos com IA - YM Sports Hub

## ✅ **SISTEMA COMPLETAMENTE IMPLEMENTADO!**

### 🧠 **IA Integrada para Treinos Personalizados**

O sistema utiliza inteligência artificial para gerar treinos personalizados baseados no perfil completo do atleta, incluindo dados físicos, posição no campo e objetivos específicos.

---

## 🎯 **Funcionalidades Principais**

### **1. Geração de Treinos com IA**
- ✅ **Prompt personalizado** baseado no perfil do usuário
- ✅ **Considera dados físicos:** idade, altura, peso, posição
- ✅ **Objetivos específicos:** força, cardio, agilidade, etc.
- ✅ **Dias disponíveis** para treino
- ✅ **Equipamentos disponíveis**
- ✅ **Nível de dificuldade** ajustável

### **2. Interface Intuitiva**
- ✅ **Formulário inteligente** para configurar treinos
- ✅ **Checkboxes organizados** por categoria
- ✅ **Visualização em tempo real** dos treinos gerados
- ✅ **Plano semanal** visual e interativo

### **3. Dashboard Integrado**
- ✅ **Treino de hoje** destacado
- ✅ **Resumo dos exercícios** com séries e repetições
- ✅ **Nível de dificuldade** com badges coloridos
- ✅ **Duração estimada** do treino

---

## 🏗️ **Estrutura do Banco de Dados**

### **Tabela `trainings`:**
```sql
- id (UUID) - ID único do treino
- user_id (UUID) - ID do usuário
- title (TEXT) - Nome do treino
- description (TEXT) - Descrição do treino
- day_of_week (TEXT) - Dia da semana
- exercises (JSONB) - Array de exercícios
- duration_minutes (INTEGER) - Duração em minutos
- difficulty_level (TEXT) - Nível: beginner, intermediate, advanced
- muscle_groups (TEXT[]) - Grupos musculares trabalhados
- is_ai_generated (BOOLEAN) - Se foi gerado por IA
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Estrutura dos Exercícios (JSONB):**
```json
{
  "name": "Nome do exercício",
  "sets": 3,
  "reps": "12-15",
  "weight": "Peso corporal",
  "rest_time": "60 segundos",
  "notes": "Observações técnicas"
}
```

---

## 🧠 **Sistema de IA**

### **Prompt Personalizado:**
O sistema gera um prompt específico para cada usuário incluindo:

```
PERFIL DO ATLETA:
- Nome: Lucca Lacerda
- Idade: 25 anos
- Altura: 175 cm
- Peso: 70 kg
- Posição: Atacante
- Time Atual: Flamengo
- Experiência: 2 times anteriores
- Localização: Rio de Janeiro, RJ

SOLICITAÇÃO DE TREINO PERSONALIZADO:
- Objetivos: Melhorar condicionamento, Aumentar força
- Dias disponíveis: Segunda, Quarta, Sexta
- Duração por sessão: 60 minutos
- Nível de dificuldade: Intermediário
- Equipamentos disponíveis: Peso corporal, Halteres
- Foco do treino: Força, Específico para futebol
```

### **Resposta Estruturada:**
A IA retorna um JSON estruturado com:
- **Plano semanal** organizado por dias
- **Exercícios específicos** para cada treino
- **Séries e repetições** adequadas ao nível
- **Duração estimada** de cada exercício
- **Grupos musculares** trabalhados

---

## 🎨 **Interface do Usuário**

### **Página de Treinos:**
1. **Header com botão "Gerar com IA"**
2. **Treino de hoje destacado** (se existir)
3. **Plano semanal** em cards visuais
4. **Estatísticas** de treinos

### **Modal de Geração:**
1. **Objetivos** - Checkboxes múltiplos
2. **Dias disponíveis** - Seleção por dia da semana
3. **Duração e dificuldade** - Inputs numéricos
4. **Foco do treino** - Checkboxes específicos
5. **Equipamentos** - Seleção múltipla

### **Cards de Treino:**
- **Título e descrição** do treino
- **Badge de dificuldade** colorido
- **Duração e número de exercícios**
- **Botão para iniciar** treino
- **Opção de deletar** treino

---

## 🔧 **Hooks Criados**

### **`useTrainings`:**
```typescript
const {
  trainings,           // Lista de treinos
  loading,            // Estado de carregamento
  error,              // Erros
  createTraining,     // Criar treino
  updateTraining,     // Atualizar treino
  deleteTraining,     // Deletar treino
  getTodaysTraining,  // Treino de hoje
  getWeeklyTrainings  // Treinos da semana
} = useTrainings();
```

### **`useAITraining`:**
```typescript
const {
  generateTrainingPlan, // Gerar plano com IA
  loading,             // Estado de carregamento
  error                // Erros
} = useAITraining();
```

---

## 🎯 **Como Usar o Sistema**

### **1. Gerar Treinos com IA:**
1. Vá para **Dashboard → Treinos**
2. Clique em **"Gerar com IA"**
3. Preencha o formulário:
   - **Objetivos:** Melhorar condicionamento, Ganhar massa muscular, etc.
   - **Dias disponíveis:** Selecione os dias da semana
   - **Duração:** Tempo por sessão (15-180 min)
   - **Dificuldade:** Iniciante, Intermediário, Avançado
   - **Foco:** Força, Cardio, Flexibilidade, etc.
   - **Equipamentos:** Peso corporal, Halteres, etc.
4. Clique em **"Gerar Plano"**
5. ✅ **Treinos são criados automaticamente**

### **2. Visualizar Treinos:**
1. **Treino de hoje** aparece destacado no topo
2. **Plano semanal** mostra todos os dias
3. **Cards visuais** com informações resumidas
4. **Estatísticas** na parte inferior

### **3. Dashboard Integrado:**
1. **Treino de hoje** aparece no dashboard
2. **Resumo dos exercícios** com séries/repetições
3. **Nível de dificuldade** com badge colorido
4. **Link direto** para página de treinos

---

## 🎨 **Design e UX**

### **Cores e Badges:**
- **Iniciante:** Verde (`bg-green-100 text-green-800`)
- **Intermediário:** Amarelo (`bg-yellow-100 text-yellow-800`)
- **Avançado:** Vermelho (`bg-red-100 text-red-800`)

### **Ícones:**
- **Treino geral:** `Dumbbell`
- **IA:** `Sparkles`
- **Duração:** `Clock`
- **Exercícios:** `Target`
- **Play:** `PlayCircle`

### **Animações:**
- **Hover effects** nos cards
- **Loading states** durante geração
- **Transitions** suaves
- **Fade-in** animations

---

## 📊 **Exemplo de Treino Gerado**

```json
{
  "monday": {
    "title": "Treino de Força",
    "description": "Treino intermediário focado em Força, Específico para futebol",
    "duration_minutes": 60,
    "difficulty_level": "intermediate",
    "muscle_groups": ["legs", "core"],
    "exercises": [
      {
        "name": "Agachamento",
        "sets": 3,
        "reps": "12-15",
        "weight": "Peso corporal",
        "rest_time": "60 segundos",
        "notes": "Manter coluna reta, descer até 90 graus"
      },
      {
        "name": "Lunges",
        "sets": 3,
        "reps": "10 cada perna",
        "weight": "Peso corporal",
        "rest_time": "45 segundos",
        "notes": "Alternar pernas, manter equilíbrio"
      }
    ]
  }
}
```

---

## 🚀 **Funcionalidades Avançadas**

### **Personalização Inteligente:**
- ✅ **Baseado no perfil** físico do usuário
- ✅ **Considera posição** no campo
- ✅ **Adapta intensidade** à idade e condicionamento
- ✅ **Foca em objetivos** específicos

### **Flexibilidade:**
- ✅ **Múltiplos objetivos** por treino
- ✅ **Dias flexíveis** da semana
- ✅ **Duração ajustável** por sessão
- ✅ **Equipamentos variados**

### **Integração:**
- ✅ **Dashboard conectado** aos treinos
- ✅ **Calendário integrado** com eventos
- ✅ **Perfil completo** utilizado pela IA
- ✅ **Interface unificada**

---

## 🎉 **RESULTADO FINAL**

### ✅ **Sistema Completo:**
- **IA integrada** para treinos personalizados
- **Interface intuitiva** e visual
- **Dashboard conectado** aos treinos
- **Banco de dados** estruturado
- **Hooks organizados** e reutilizáveis

### ✅ **Funcionalidades:**
- **Geração automática** de treinos
- **Personalização baseada** no perfil
- **Visualização semanal** dos treinos
- **Integração completa** com o sistema

### ✅ **Experiência do Usuário:**
- **Formulário inteligente** para configuração
- **Cards visuais** para treinos
- **Badges coloridos** para dificuldade
- **Navegação fluida** entre páginas

---

## 🎊 **SISTEMA DE TREINOS COMPLETO!**

Agora você pode:
- ✅ **Gerar treinos personalizados** com IA
- ✅ **Configurar objetivos** específicos
- ✅ **Ver treino de hoje** no dashboard
- ✅ **Planejar semana** completa de treinos
- ✅ **Acompanhar progresso** e estatísticas

**O sistema está 100% funcional e pronto para uso! 🚀**
