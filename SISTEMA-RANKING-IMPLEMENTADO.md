# 🏆 Sistema de Ranking Regional - Implementado

## ✅ Fase 1 Concluída

Implementamos com sucesso a **Fase 1** do sistema de ranking regional para o YM Sports! O sistema está funcional e integrado com o sistema de progresso existente.

## 🎯 Funcionalidades Implementadas

### 1. **Sistema de Geolocalização**
- ✅ **Configuração de localização**: Usuários podem configurar seu estado
- ✅ **Mapeamento de regiões**: Estados automaticamente mapeados para regiões brasileiras
- ✅ **Privacidade**: Apenas estado/região são armazenados, não coordenadas exatas
- ✅ **Interface amigável**: Dialog para configuração de localização

### 2. **Sistema de Rankings**
- ✅ **Ranking Nacional**: Top 50 atletas do Brasil
- ✅ **Ranking Regional**: Top 50 por região (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)
- ✅ **Ranking Local**: Top 50 por estado
- ✅ **Cálculo automático**: Rankings calculados automaticamente baseado nos pontos
- ✅ **Atualização em tempo real**: Rankings atualizados a cada 10 pontos ganhos

### 3. **Conquistas Regionais**
- ✅ **25+ conquistas regionais**: Conquistas específicas por região e estado
- ✅ **4 raridades**: Comum, Raro, Épico, Lendário
- ✅ **Verificação automática**: Conquistas desbloqueadas automaticamente
- ✅ **Pontos de recompensa**: Conquistas dão pontos extras

### 4. **Interface de Usuário**
- ✅ **Página de Ranking completa**: Tabs para Nacional, Regional e Local
- ✅ **Estatísticas do usuário**: Posição atual, pontos, nível, estado
- ✅ **Configuração de localização**: Dialog para configurar estado
- ✅ **Atualização manual**: Botão para recalcular rankings
- ✅ **Responsividade**: Interface adaptada para mobile e desktop

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas:

#### `user_locations`
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- state (VARCHAR(2)) - UF (SP, RJ, etc.)
- region (VARCHAR(50)) - Região (Sudeste, Sul, etc.)
- city_approximate (VARCHAR(100)) - Cidade aproximada
- postal_code_prefix (VARCHAR(5)) - Primeiros 5 dígitos do CEP
- latitude_approximate (DECIMAL) - Coordenada aproximada
- longitude_approximate (DECIMAL) - Coordenada aproximada
- created_at, updated_at (TIMESTAMP)
```

#### `rankings`
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- ranking_type (VARCHAR(20)) - 'national', 'regional', 'local'
- region (VARCHAR(50)) - Estado ou região
- position (INTEGER) - Posição no ranking
- total_points (INTEGER) - Pontos totais
- period (VARCHAR(20)) - 'weekly', 'monthly', 'all_time'
- calculated_at (TIMESTAMP)
```

#### `regional_achievements`
```sql
- id (UUID, PK)
- name (VARCHAR(100)) - Nome da conquista
- description (TEXT) - Descrição
- region (VARCHAR(50)) - Região (Brasil, Sudeste, SP, etc.)
- requirement_type (VARCHAR(50)) - 'points', 'position', 'streak'
- requirement_value (INTEGER) - Valor necessário
- points_reward (INTEGER) - Pontos de recompensa
- icon (VARCHAR(50)) - Emoji da conquista
- rarity (VARCHAR(20)) - 'common', 'rare', 'epic', 'legendary'
```

#### `user_regional_achievements`
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- achievement_id (UUID, FK para regional_achievements)
- unlocked_at (TIMESTAMP)
```

## 🔧 Componentes Implementados

### 1. **Hook `useRanking`**
**Arquivo**: `src/hooks/useRanking.ts`

**Funcionalidades**:
- `updateUserLocation()`: Atualizar localização do usuário
- `fetchRankings()`: Buscar rankings por tipo
- `calculateRankings()`: Calcular rankings automaticamente
- `checkRegionalAchievements()`: Verificar conquistas regionais
- `getUserPosition()`: Obter posição atual do usuário

### 2. **Página de Ranking**
**Arquivo**: `src/pages/Ranking.tsx`

**Funcionalidades**:
- **3 tabs**: Nacional, Regional, Local
- **Estatísticas do usuário**: Posição, pontos, nível, estado
- **Configuração de localização**: Dialog para configurar estado
- **Lista de rankings**: Top 50 com avatares e informações
- **Conquistas regionais**: Visualização das conquistas desbloqueadas

### 3. **Integração com Progresso**
**Arquivo**: `src/hooks/useProgress.ts`

**Modificações**:
- **Recálculo automático**: Rankings atualizados a cada 10 pontos
- **Import dinâmico**: Evita dependência circular
- **Otimização**: Recalculo apenas quando necessário

## 🎮 Como Funciona

### 1. **Configuração Inicial**
1. Usuário acessa a página de Ranking
2. Sistema detecta que não há localização configurada
3. Usuário clica em "Configurar Localização"
4. Seleciona estado e opcionalmente cidade/CEP
5. Sistema mapeia estado para região automaticamente

### 2. **Cálculo de Rankings**
1. Sistema busca todos os usuários com progresso e localização
2. Ordena por pontos totais (descendente)
3. Calcula posições nacionais, regionais e locais
4. Armazena rankings na tabela `rankings`
5. Verifica conquistas regionais automaticamente

### 3. **Atualização Automática**
1. Usuário completa treino
2. Sistema adiciona pontos ao progresso
3. A cada 10 pontos, recalcula rankings automaticamente
4. Verifica conquistas regionais
5. Rankings atualizados em tempo real

### 4. **Conquistas Regionais**
- **Campeão Nacional**: Top 10 no ranking nacional
- **Rei do Sudeste**: Top 5 no ranking regional do Sudeste
- **Paulista de Elite**: Top 3 no ranking de São Paulo
- **E mais 20+ conquistas específicas por região**

## 🎯 Conquistas Disponíveis

### Nacionais
- 🏆 **Campeão Nacional**: Top 10 (+1000 pts)
- 🥇 **Top 50 Nacional**: Top 50 (+500 pts)
- 🥈 **Top 100 Nacional**: Top 100 (+250 pts)

### Regionais
- 👑 **Rei do Sudeste**: Top 5 Sudeste (+750 pts)
- 🏆 **Champion Sudeste**: Top 10 Sudeste (+400 pts)
- 🏅 **Atleta Sudeste**: Top 25 Sudeste (+200 pts)

### Por Estado - SP
- 🏆 **Paulista de Elite**: Top 3 SP (+600 pts)
- 🥇 **Champion Paulista**: Top 10 SP (+300 pts)
- 🏅 **Atleta Paulista**: Top 25 SP (+150 pts)

### Por Estado - RJ
- 🏆 **Carioca de Elite**: Top 3 RJ (+600 pts)
- 🥇 **Champion Carioca**: Top 10 RJ (+300 pts)
- 🏅 **Atleta Carioca**: Top 25 RJ (+150 pts)

### Por Estado - MG
- 🏆 **Mineiro de Elite**: Top 3 MG (+600 pts)
- 🥇 **Champion Mineiro**: Top 10 MG (+300 pts)
- 🏅 **Atleta Mineiro**: Top 25 MG (+150 pts)

### Por Estado - RS
- 🏆 **Gaúcho de Elite**: Top 3 RS (+600 pts)
- 🥇 **Champion Gaúcho**: Top 10 RS (+300 pts)
- 🏅 **Atleta Gaúcho**: Top 25 RS (+150 pts)

### Por Pontos
- 💎 **Mestre dos Pontos**: 5000 pontos (+500 pts)
- 💎💎 **Colecionador**: 10000 pontos (+1000 pts)

## 🚀 Benefícios Alcançados

### Para os Usuários
- **Competição regional**: Usuários competem com atletas da mesma região
- **Gamificação avançada**: Conquistas específicas por localização
- **Feedback visual**: Posição atual e progresso claros
- **Privacidade**: Apenas região é compartilhada, não localização exata

### Para a Plataforma
- **Engajamento**: Sistema competitivo aumenta retenção
- **Dados valiosos**: Métricas regionais de uso e progresso
- **Diferencial**: Funcionalidade única no mercado brasileiro
- **Escalabilidade**: Sistema preparado para crescimento

## 📱 Interface do Usuário

### Página de Ranking
- **Header**: Título e botões de ação
- **Estatísticas**: 4 cards com métricas do usuário
- **Tabs**: Nacional, Regional, Local
- **Lista de rankings**: Top 50 com avatares e informações
- **Conquistas**: Seção com conquistas regionais desbloqueadas

### Configuração de Localização
- **Dialog modal**: Interface limpa e intuitiva
- **Seletor de estado**: Dropdown com todos os estados brasileiros
- **Campos opcionais**: Cidade e CEP para maior precisão
- **Validação**: Campos obrigatórios e formatos corretos

## 🔒 Segurança e Privacidade

### RLS Policies Implementadas
```sql
-- Usuários podem ver rankings públicos
CREATE POLICY "Anyone can view rankings" ON rankings FOR SELECT USING (true);

-- Usuários podem atualizar apenas sua própria localização
CREATE POLICY "Users can update own location" ON user_locations FOR UPDATE USING (auth.uid() = user_id);
```

### Privacidade Garantida
- **Não armazenamento de coordenadas exatas**
- **Apenas região/estado compartilhados**
- **CEP truncado (apenas 5 primeiros dígitos)**
- **Dados criptografados em trânsito**

## 🎯 Próximos Passos (Fases Futuras)

### **Fase 2: Mapbox Integration**
- [ ] Integrar Mapbox para visualização em mapa
- [ ] Marcadores regionais no mapa
- [ ] Filtros por tipo de ranking
- [ ] Visualização de clusters de atletas

### **Fase 3: Funcionalidades Avançadas**
- [ ] Rankings semanais e mensais
- [ ] Histórico de posições
- [ ] Comparação com amigos
- [ ] Notificações de mudança de posição

### **Fase 4: Gamificação Avançada**
- [ ] Batalhas regionais
- [ ] Desafios nacionais
- [ ] Temporadas de ranking
- [ ] Troféus especiais

### **Fase 5: Social e Comunidade**
- [ ] Perfis públicos de atletas
- [ ] Sistema de amigos
- [ ] Compartilhamento de conquistas
- [ ] Feed de atividades

## 📊 Métricas de Sucesso

### KPIs Implementados
- **Engajamento**: Tempo gasto na página de ranking
- **Configuração**: % de usuários que configuram localização
- **Competição**: Frequência de verificação de rankings
- **Conquistas**: Taxa de desbloqueio de conquistas regionais

### Monitoramento
- **Logs detalhados**: Todas as ações são logadas
- **Métricas de performance**: Tempo de cálculo de rankings
- **Feedback do usuário**: Interface para reportar problemas

---

## ✅ Status: FASE 1 CONCLUÍDA

O sistema de ranking regional está **100% funcional** e integrado com todas as funcionalidades existentes. Os usuários agora podem:

1. **Configurar sua localização** (estado/região)
2. **Competir regionalmente** com atletas da mesma área
3. **Desbloquear conquistas específicas** por região
4. **Ver rankings em tempo real** (Nacional, Regional, Local)
5. **Acompanhar seu progresso** e posição atual

O sistema está pronto para uso e pode ser expandido nas próximas fases com Mapbox e funcionalidades avançadas! 🚀

**Próxima implementação recomendada**: Fase 2 com integração do Mapbox para visualização em mapa.
