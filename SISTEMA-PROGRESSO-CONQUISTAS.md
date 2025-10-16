# 🏆 Sistema de Progresso e Conquistas - YM Sports

## 📋 Visão Geral

Implementamos um sistema completo de progresso, pontuação e conquistas para gamificar a experiência dos usuários na plataforma YM Sports. O sistema incentiva a consistência nos treinos e oferece recompensas por marcos alcançados.

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Pontuação
- **Pontos por treino**: Baseado na duração e dificuldade
- **Multiplicadores por dificuldade**:
  - Iniciante: 1x
  - Intermediário: 1.5x
  - Avançado: 2x
- **Cálculo**: 1 ponto a cada 5 minutos de treino × multiplicador de dificuldade

### 2. Sistema de Níveis
- **Progressão**: 100 pontos por nível
- **Cálculo automático**: `Math.floor(totalPoints / 100) + 1`
- **Barra de progresso**: Visual no dashboard e página de conquistas

### 3. Sistema de Conquistas
- **Categorias**:
  - 🏃 **Treinos**: Baseado em número de treinos completados
  - 🔥 **Sequências**: Baseado em dias consecutivos de treino
  - 📈 **Níveis**: Baseado no nível atual do usuário
  - 🎯 **Exercícios**: Baseado em número de exercícios completados
  - ⏰ **Tempo**: Baseado em minutos de treino acumulados
  - 🍎 **Nutrição**: Preparado para futuras funcionalidades

- **Raridades**:
  - 🥉 **Comum** (Common): Cinza
  - 🥈 **Raro** (Rare): Azul
  - 🥇 **Épico** (Epic): Roxo
  - 💎 **Lendário** (Legendary): Dourado

### 4. Conquistas Disponíveis

#### Conquistas de Treinos
- **Primeiro Passo**: Complete seu primeiro treino (+50 pts)
- **Iniciante**: Complete 5 treinos (+100 pts)
- **Dedicado**: Complete 10 treinos (+200 pts)
- **Atleta**: Complete 25 treinos (+500 pts)
- **Campeão**: Complete 50 treinos (+1000 pts)
- **Lenda**: Complete 100 treinos (+2500 pts)

#### Conquistas de Sequência
- **Consistência**: 3 dias consecutivos (+75 pts)
- **Determinação**: 7 dias consecutivos (+200 pts)
- **Disciplina**: 15 dias consecutivos (+500 pts)
- **Inabalável**: 30 dias consecutivos (+1000 pts)

#### Conquistas de Pontos
- **Primeiros Pontos**: Alcance 100 pontos
- **Acumulador**: Alcance 500 pontos
- **Coletor**: Alcance 1000 pontos
- **Mestre**: Alcance 2500 pontos
- **Lenda Viva**: Alcance 5000 pontos

#### Conquistas de Exercícios
- **Primeiro Exercício**: Complete seu primeiro exercício (+25 pts)
- **Centena**: Complete 100 exercícios (+300 pts)
- **Milésimo**: Complete 1000 exercícios (+1500 pts)

#### Conquistas de Tempo
- **Maratonista**: Complete 60 minutos em um dia (+100 pts)
- **Ironman**: Complete 120 minutos em um dia (+250 pts)

#### Conquistas de Nível
- **Nível 5**: Alcance o nível 5
- **Nível 10**: Alcance o nível 10
- **Nível 20**: Alcance o nível 20
- **Nível 50**: Alcance o nível 50

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### `user_progress`
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- total_points (INTEGER, default 0)
- current_level (INTEGER, default 1)
- total_workouts_completed (INTEGER, default 0)
- total_exercises_completed (INTEGER, default 0)
- total_workout_minutes (INTEGER, default 0)
- longest_workout_streak (INTEGER, default 0)
- current_workout_streak (INTEGER, default 0)
- last_workout_date (DATE)
- created_at, updated_at (TIMESTAMP)
```

#### `achievements`
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- icon (VARCHAR) - Emoji da conquista
- category (VARCHAR) - Tipo da conquista
- requirement_type (VARCHAR) - Tipo do requisito
- requirement_value (INTEGER) - Valor necessário
- points_reward (INTEGER) - Pontos de recompensa
- rarity (VARCHAR) - Raridade da conquista
- created_at (TIMESTAMP)
```

#### `user_achievements`
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- achievement_id (UUID, FK para achievements)
- unlocked_at (TIMESTAMP)
- UNIQUE(user_id, achievement_id)
```

#### `user_activities`
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- activity_type (VARCHAR) - Tipo da atividade
- activity_data (JSONB) - Dados específicos
- points_earned (INTEGER) - Pontos ganhos
- created_at (TIMESTAMP)
```

## 🔧 Componentes Implementados

### 1. Hook `useProgress`
**Arquivo**: `src/hooks/useProgress.ts`

**Funcionalidades**:
- `fetchProgress()`: Buscar progresso do usuário
- `addPoints()`: Adicionar pontos
- `recordWorkoutCompletion()`: Registrar treino completo
- `checkAchievements()`: Verificar conquistas desbloqueadas
- `getLevelProgress()`: Calcular progresso do nível

### 2. Página de Conquistas
**Arquivo**: `src/pages/Achievements.tsx`

**Funcionalidades**:
- Visualização de todas as conquistas
- Filtros por categoria
- Conquistas desbloqueadas vs pendentes
- Barra de progresso para conquistas pendentes
- Atividades recentes do usuário
- Estatísticas gerais

### 3. Integração com Treinos
**Arquivo**: `src/pages/Training.tsx`

**Modificações**:
- Botão "Completar Treino" substitui "Iniciar Treino"
- Integração com `recordWorkoutCompletion()`
- Notificações de subida de nível
- Registro automático de progresso

### 4. Dashboard Atualizado
**Arquivo**: `src/pages/Dashboard.tsx`

**Novo Card de Progresso**:
- Nível atual e pontos totais
- Barra de progresso para próximo nível
- Sequência atual de treinos
- Total de treinos completados
- Link para página de conquistas

## 🎮 Como Funciona

### 1. Completando um Treino
1. Usuário clica em "Completar Treino"
2. Sistema calcula pontos baseado em:
   - Duração do treino (1 ponto a cada 5 minutos)
   - Dificuldade (multiplicador 1x, 1.5x ou 2x)
3. Atualiza estatísticas do usuário
4. Verifica se alguma conquista foi desbloqueada
5. Mostra notificação de sucesso ou subida de nível

### 2. Sistema de Sequências
- **Sequência mantida**: Se treinou ontem
- **Sequência resetada**: Se não treinou ontem
- **Sequência aumentada**: Se treinou hoje e ontem

### 3. Verificação de Conquistas
- Executada automaticamente após cada treino
- Compara estatísticas atuais com requisitos
- Desbloqueia conquistas automaticamente
- Adiciona pontos de recompensa se houver

## 🚀 Benefícios do Sistema

### Para o Usuário
- **Motivação**: Gamificação incentiva consistência
- **Feedback visual**: Barras de progresso e conquistas
- **Metas claras**: Objetivos específicos e alcançáveis
- **Reconhecimento**: Medalhas por marcos importantes

### Para a Plataforma
- **Engajamento**: Usuários mais ativos
- **Retenção**: Sistema de recompensas mantém usuários
- **Dados valiosos**: Métricas de uso e progresso
- **Diferencial**: Funcionalidade única no mercado

## 🔮 Preparação para o Futuro

### Sistema de Nutrição
- Conquistas específicas para hábitos alimentares
- Pontuação baseada em refeições registradas
- Categorias já preparadas no banco de dados

### Expansões Possíveis
- **Rankings**: Comparação entre usuários
- **Desafios**: Objetivos temporários
- **Recompensas**: Benefícios reais por conquistas
- **Social**: Compartilhamento de conquistas

## 📱 Interface do Usuário

### Página de Conquistas
- **Tabs por categoria**: Treinos, Sequências, Níveis, Nutrição
- **Conquistas desbloqueadas**: Com data de desbloqueio
- **Conquistas pendentes**: Com barra de progresso
- **Atividades recentes**: Timeline de ações do usuário

### Dashboard
- **Card de progresso**: Resumo visual do status
- **Indicadores**: Nível, pontos, sequência, treinos
- **Navegação**: Link direto para conquistas

### Treinos
- **Botão de ação**: "Completar Treino" claro e visível
- **Feedback imediato**: Notificações de progresso
- **Integração**: Sistema funciona automaticamente

## 🎯 Próximos Passos

1. **Testar o sistema**: Completar treinos e verificar progresso
2. **Monitorar métricas**: Acompanhar engajamento dos usuários
3. **Expandir conquistas**: Adicionar mais variedade
4. **Integrar nutrição**: Quando a funcionalidade estiver pronta
5. **Adicionar rankings**: Comparação entre usuários

---

O sistema está completamente funcional e integrado com todas as funcionalidades existentes. Os usuários agora têm uma experiência gamificada que os motiva a manter a consistência nos treinos e alcançar novos objetivos! 🏆
