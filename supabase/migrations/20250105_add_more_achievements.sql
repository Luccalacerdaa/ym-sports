-- =============================================
-- YM Sports - Adicionar Mais Conquistas Balanceadas
-- =============================================
-- Total: 24 conquistas atuais → 60+ conquistas após este script
-- Sistema de pontos balanceado para motivar usuários

-- Adicionar constraint UNIQUE na coluna name (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'achievements_name_key'
  ) THEN
    ALTER TABLE achievements ADD CONSTRAINT achievements_name_key UNIQUE (name);
  END IF;
END $$;

-- =============================================
-- 1. CONQUISTAS DE TREINOS (Workout)
-- =============================================

-- Iniciante
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, rarity)
VALUES 
  ('Primeira Jornada', 'Complete seu primeiro treino', '🎯', 'workout', 'workouts', 1, 50, 'common'),
  ('Trilha Iniciada', 'Complete 3 treinos', '🚶', 'workout', 'workouts', 3, 100, 'common'),
  ('Compromisso', 'Complete 5 treinos', '💪', 'workout', 'workouts', 5, 150, 'common'),
  ('Dedicação', 'Complete 10 treinos', '🏃', 'workout', 'workouts', 10, 250, 'common'),
  
  -- Intermediário
  ('Atleta Persistente', 'Complete 25 treinos', '⚡', 'workout', 'workouts', 25, 400, 'rare'),
  ('Força de Vontade', 'Complete 50 treinos', '💎', 'workout', 'workouts', 50, 600, 'rare'),
  ('Determinação Absoluta', 'Complete 75 treinos', '🔥', 'workout', 'workouts', 75, 800, 'rare'),
  ('Cem Treinos', 'Complete 100 treinos', '🏆', 'workout', 'workouts', 100, 1000, 'epic'),
  
  -- Avançado
  ('Campeão', 'Complete 150 treinos', '👑', 'workout', 'workouts', 150, 1500, 'epic'),
  ('Mestre do Treino', 'Complete 200 treinos', '🌟', 'workout', 'workouts', 200, 2000, 'epic'),
  ('Elite', 'Complete 300 treinos', '⭐', 'workout', 'workouts', 300, 3000, 'legendary'),
  ('Lenda Viva', 'Complete 500 treinos', '🔱', 'workout', 'workouts', 500, 5000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. CONQUISTAS DE SEQUÊNCIA (Streak)
-- =============================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, rarity)
VALUES 
  ('Começo Forte', 'Treine por 2 dias consecutivos', '🔥', 'streak', 'streak', 2, 100, 'common'),
  ('Ritmo Constante', 'Treine por 3 dias consecutivos', '⚡', 'streak', 'streak', 3, 150, 'common'),
  ('Semana Completa', 'Treine por 7 dias consecutivos', '📅', 'streak', 'streak', 7, 300, 'rare'),
  ('Duas Semanas', 'Treine por 14 dias consecutivos', '💪', 'streak', 'streak', 14, 500, 'rare'),
  ('Três Semanas', 'Treine por 21 dias consecutivos', '🚀', 'streak', 'streak', 21, 700, 'rare'),
  ('Mês Inteiro', 'Treine por 30 dias consecutivos', '🏅', 'streak', 'streak', 30, 1000, 'epic'),
  ('45 Dias', 'Treine por 45 dias consecutivos', '💎', 'streak', 'streak', 45, 1500, 'epic'),
  ('Dois Meses', 'Treine por 60 dias consecutivos', '⭐', 'streak', 'streak', 60, 2000, 'epic'),
  ('Trimestre', 'Treine por 90 dias consecutivos', '👑', 'streak', 'streak', 90, 3000, 'legendary'),
  ('Meio Ano', 'Treine por 180 dias consecutivos', '🔱', 'streak', 'streak', 180, 5000, 'legendary'),
  ('Um Ano', 'Treine por 365 dias consecutivos', '🌟', 'streak', 'streak', 365, 10000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 3. CONQUISTAS DE PONTOS (Points)
-- =============================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, rarity)
VALUES 
  ('Primeiro Passo', 'Ganhe 50 pontos', '🎯', 'level', 'points', 50, 25, 'common'),
  ('Progresso Visível', 'Ganhe 100 pontos', '📈', 'level', 'points', 100, 50, 'common'),
  ('Meio Caminho', 'Ganhe 250 pontos', '🚀', 'level', 'points', 250, 100, 'common'),
  ('Acumulador', 'Ganhe 500 pontos', '💰', 'level', 'points', 500, 150, 'rare'),
  ('Colecionador', 'Ganhe 1.000 pontos', '💎', 'level', 'points', 1000, 300, 'rare'),
  ('Milionário', 'Ganhe 2.500 pontos', '🏆', 'level', 'points', 2500, 500, 'rare'),
  ('Grande Conquistador', 'Ganhe 5.000 pontos', '👑', 'level', 'points', 5000, 800, 'epic'),
  ('Lenda de Pontos', 'Ganhe 10.000 pontos', '⭐', 'level', 'points', 10000, 1500, 'epic'),
  ('Mestre dos Pontos', 'Ganhe 25.000 pontos', '🌟', 'level', 'points', 25000, 3000, 'legendary'),
  ('Deus dos Pontos', 'Ganhe 50.000 pontos', '🔱', 'level', 'points', 50000, 5000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 4. CONQUISTAS DE NÍVEL (Level)
-- =============================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, rarity)
VALUES 
  ('Nível 3', 'Alcance o nível 3', '3️⃣', 'level', 'level', 3, 100, 'common'),
  ('Nível 5', 'Alcance o nível 5', '5️⃣', 'level', 'level', 5, 200, 'common'),
  ('Nível 10', 'Alcance o nível 10', '🔟', 'level', 'level', 10, 400, 'rare'),
  ('Nível 15', 'Alcance o nível 15', '🎖️', 'level', 'level', 15, 600, 'rare'),
  ('Nível 20', 'Alcance o nível 20', '🏅', 'level', 'level', 20, 800, 'epic'),
  ('Nível 30', 'Alcance o nível 30', '🎯', 'level', 'level', 30, 1200, 'epic'),
  ('Nível 40', 'Alcance o nível 40', '💫', 'level', 'level', 40, 1600, 'epic'),
  ('Nível 50', 'Alcance o nível 50', '👑', 'level', 'level', 50, 2500, 'legendary'),
  ('Nível 75', 'Alcance o nível 75', '⭐', 'level', 'level', 75, 4000, 'legendary'),
  ('Nível 100', 'Alcance o nível 100', '🔱', 'level', 'level', 100, 10000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 5. CONQUISTAS DE EXERCÍCIOS (Exercises)
-- =============================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, rarity)
VALUES 
  ('Primeiro Exercício', 'Complete 1 exercício', '💪', 'workout', 'exercises', 1, 25, 'common'),
  ('Dez Exercícios', 'Complete 10 exercícios', '🏃', 'workout', 'exercises', 10, 100, 'common'),
  ('Vinte e Cinco', 'Complete 25 exercícios', '⚡', 'workout', 'exercises', 25, 150, 'common'),
  ('Cinquenta', 'Complete 50 exercícios', '💎', 'workout', 'exercises', 50, 250, 'rare'),
  ('Centena', 'Complete 100 exercícios', '🏆', 'workout', 'exercises', 100, 400, 'rare'),
  ('Duzentos', 'Complete 200 exercícios', '🔥', 'workout', 'exercises', 200, 600, 'rare'),
  ('Trezentos', 'Complete 300 exercícios', '🌟', 'workout', 'exercises', 300, 900, 'epic'),
  ('Quinhentos', 'Complete 500 exercícios', '👑', 'workout', 'exercises', 500, 1500, 'epic'),
  ('Mil Exercícios', 'Complete 1.000 exercícios', '⭐', 'workout', 'exercises', 1000, 3000, 'legendary'),
  ('Dois Mil', 'Complete 2.000 exercícios', '🔱', 'workout', 'exercises', 2000, 5000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 6. CONQUISTAS DE TEMPO (Workout Minutes)
-- =============================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, rarity)
VALUES 
  ('Quinze Minutos', 'Treine por 15 minutos no total', '⏱️', 'workout', 'workout_minutes', 15, 50, 'common'),
  ('Meia Hora', 'Treine por 30 minutos no total', '⏰', 'workout', 'workout_minutes', 30, 100, 'common'),
  ('Uma Hora', 'Treine por 60 minutos no total', '🕐', 'workout', 'workout_minutes', 60, 200, 'common'),
  ('Duas Horas', 'Treine por 120 minutos no total', '⏳', 'workout', 'workout_minutes', 120, 300, 'rare'),
  ('Cinco Horas', 'Treine por 300 minutos no total', '💪', 'workout', 'workout_minutes', 300, 500, 'rare'),
  ('Dez Horas', 'Treine por 600 minutos no total', '🔥', 'workout', 'workout_minutes', 600, 800, 'rare'),
  ('Maratonista', 'Treine por 1.000 minutos no total', '🏃', 'workout', 'workout_minutes', 1000, 1200, 'epic'),
  ('Ironman', 'Treine por 2.000 minutos no total', '💎', 'workout', 'workout_minutes', 2000, 2000, 'epic'),
  ('Ultra Resistência', 'Treine por 5.000 minutos no total', '👑', 'workout', 'workout_minutes', 5000, 4000, 'legendary'),
  ('Cem Horas', 'Treine por 6.000 minutos no total', '⭐', 'workout', 'workout_minutes', 6000, 6000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- RESUMO DAS CONQUISTAS ADICIONADAS
-- =============================================
-- 
-- 🎯 TREINOS: 12 conquistas (600 → 20.600 pontos)
-- 🔥 SEQUÊNCIA: 11 conquistas (1.200 → 24.350 pontos)
-- 💰 PONTOS: 10 conquistas (850 → 11.475 pontos)
-- 📊 NÍVEL: 10 conquistas (1.000 → 21.500 pontos)
-- 💪 EXERCÍCIOS: 10 conquistas (600 → 11.425 pontos)
-- ⏱️ TEMPO: 10 conquistas (700 → 14.950 pontos)
-- 
-- TOTAL: 63 NOVAS conquistas
-- PONTOS TOTAIS POSSÍVEIS: ~104.300 pontos
-- 
-- Distribuição de raridade:
-- - Common (comum): 24 conquistas
-- - Rare (raro): 21 conquistas
-- - Epic (épico): 12 conquistas
-- - Legendary (lendário): 6 conquistas
-- 
-- =============================================

