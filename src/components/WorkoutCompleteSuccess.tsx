import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';

interface WorkoutCompleteSuccessProps {
  points: number;
  levelIncreased: boolean;
  newLevel?: number;
  onComplete: () => void;
}

export function WorkoutCompleteSuccess({ 
  points, 
  levelIncreased, 
  newLevel, 
  onComplete 
}: WorkoutCompleteSuccessProps) {
  const [stage, setStage] = useState<'rising' | 'explosion' | 'success'>('rising');

  // Partículas explodindo
  const particles = Array.from({ length: 25 }, (_, i) => {
    const angle = (i * 360) / 25;
    return {
      x: Math.cos((angle * Math.PI) / 180),
      y: Math.sin((angle * Math.PI) / 180),
    };
  });

  // Estrelas flutuantes
  const floatingStars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 0.5) * 400,
    delay: Math.random() * 0.5,
  }));

  useEffect(() => {
    // Etapa 1: Ícone sobe (0.4s)
    const risingTimer = setTimeout(() => {
      setStage('explosion');
    }, 400);

    // Etapa 2: Explosão (0.3s)
    const explosionTimer = setTimeout(() => {
      setStage('success');
    }, 700);

    // Etapa 3: Mensagem (2.5s) + fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(risingTimer);
      clearTimeout(explosionTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center overflow-hidden"
      >
        {/* Etapa 1: Ícone subindo */}
        {stage === 'rising' && (
          <>
            {/* Ícone principal */}
            <motion.div
              className="relative"
              initial={{ y: 800, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {levelIncreased ? (
                <Trophy className="w-32 h-32 text-yellow-400" strokeWidth={1.5} />
              ) : (
                <Award className="w-32 h-32 text-yellow-400" strokeWidth={1.5} />
              )}
            </motion.div>

            {/* Trail de partículas */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`trail-${i}`}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                style={{
                  left: '50%',
                  top: '60%',
                  boxShadow: '0 0 10px #FBBF24',
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: i * 40,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.04,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}

        {/* Etapa 2: Explosão */}
        {(stage === 'explosion' || stage === 'success') && (
          <div className="relative flex items-center justify-center">
            {/* Flash amarelo */}
            {stage === 'explosion' && (
              <motion.div
                className="absolute inset-0 bg-yellow-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Partículas explodindo amarelas */}
            {particles.map((particle, i) => (
              <motion.div
                key={`explosion-${i}`}
                className="absolute w-3 h-3 rounded-full bg-yellow-400"
                style={{
                  boxShadow: '0 0 10px #FBBF24',
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: particle.x * 220,
                  y: particle.y * 220,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}

            {/* Ondas de choque */}
            {[0, 0.1, 0.2].map((delay, i) => (
              <motion.div
                key={`shockwave-${i}`}
                className="absolute w-20 h-20 rounded-full border-4 border-yellow-400"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{
                  scale: 6,
                  opacity: 0,
                }}
                transition={{ duration: 1, ease: "easeOut", delay }}
              />
            ))}
          </div>
        )}

        {/* Etapa 3: Mensagem de sucesso */}
        {stage === 'success' && (
          <motion.div
            className="relative text-center px-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.4 }}
          >
            {/* Ícone central com brilho */}
            <div className="relative mb-6">
              <motion.div
                className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center relative"
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(251, 191, 36, 0.8)',
                    '0 0 80px rgba(251, 191, 36, 1)',
                    '0 0 40px rgba(251, 191, 36, 0.8)',
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                {/* Ícone */}
                {levelIncreased ? (
                  <Trophy className="w-20 h-20 text-white relative z-10" strokeWidth={2} />
                ) : (
                  <Award className="w-20 h-20 text-white relative z-10" strokeWidth={2} />
                )}

                {/* Pulso de fundo */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                >
                  <div className="w-32 h-32 rounded-full bg-yellow-300/40" />
                </motion.div>
              </motion.div>

              {/* Estrelas flutuando */}
              {floatingStars.map((s) => (
                <motion.div
                  key={`star-${s.id}`}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, s.x, 0],
                    y: [0, s.y, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: s.delay,
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                </motion.div>
              ))}
            </div>

            {/* Mensagem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10"
            >
              <h2 className="text-3xl font-bold text-yellow-400 mb-3 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                {levelIncreased ? '🎉 Level Up!' : 'Treino Completado!'}
              </h2>
              
              {levelIncreased && newLevel && (
                <p className="text-2xl text-yellow-300 mb-2 drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]">
                  Você subiu para o nível {newLevel}!
                </p>
              )}

              {/* Pontos ganhos */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", bounce: 0.5 }}
              >
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  +{points} pontos
                </span>
              </motion.div>

              <p className="text-lg text-yellow-200/80">
                Pontos adicionados ao ranking!
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
