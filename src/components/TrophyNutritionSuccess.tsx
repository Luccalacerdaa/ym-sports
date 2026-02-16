import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

interface TrophyNutritionSuccessProps {
  message: string;
  onComplete: () => void;
}

export function TrophyNutritionSuccess({ message, onComplete }: TrophyNutritionSuccessProps) {
  const [stage, setStage] = useState<'trophy' | 'explosion' | 'success'>('trophy');

  // Gerar partículas em círculo
  const particles = Array.from({ length: 28 }, (_, i) => {
    const angle = (i * 360) / 28;
    return {
      x: Math.cos((angle * Math.PI) / 180),
      y: Math.sin((angle * Math.PI) / 180),
    };
  });

  // Confetes caindo
  const confetti = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * window.innerWidth,
    delay: Math.random() * 0.5,
  }));

  // Estrelas flutuantes
  const floatingStars = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    delay: Math.random() * 0.5,
  }));

  useEffect(() => {
    // Etapa 1: Troféu sobe (0.5s)
    const trophyTimer = setTimeout(() => {
      setStage('explosion');
    }, 500);

    // Etapa 2: Explosão (0.3s)
    const explosionTimer = setTimeout(() => {
      setStage('success');
    }, 800);

    // Etapa 3: Mensagem de sucesso (2.5s) + fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(trophyTimer);
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
        {/* Etapa 1: Troféu subindo */}
        {stage === 'trophy' && (
          <>
            {/* Troféu principal */}
            <motion.div
              className="relative"
              initial={{ y: 1000, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="relative">
                <Trophy className="w-40 h-40 text-green-500" strokeWidth={1.5} />
                {/* Brilho dourado no troféu */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                  }}
                >
                  <Trophy className="w-40 h-40 text-yellow-300" strokeWidth={1.5} />
                </motion.div>
              </div>
            </motion.div>

            {/* Trail de partículas verdes */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`trail-${i}`}
                className="absolute w-3 h-3 rounded-full bg-green-400"
                style={{
                  left: '50%',
                  top: '70%',
                  boxShadow: '0 0 10px #4ADE80',
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: i * 50,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}

        {/* Etapa 2: Explosão no centro */}
        {(stage === 'explosion' || stage === 'success') && (
          <div className="relative flex items-center justify-center">
            {/* Flash verde */}
            {stage === 'explosion' && (
              <motion.div
                className="absolute inset-0 bg-green-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Partículas explodindo verdes e douradas */}
            {particles.map((particle, i) => (
              <motion.div
                key={`explosion-${i}`}
                className={`absolute w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-green-400' : 'bg-yellow-300'}`}
                style={{
                  boxShadow: i % 2 === 0 ? '0 0 10px #4ADE80' : '0 0 10px #FCD34D',
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: particle.x * 250,
                  y: particle.y * 250,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            ))}

            {/* Ondas de choque verdes */}
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div
                key={`shockwave-${i}`}
                className="absolute w-20 h-20 rounded-full border-4 border-green-400"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{
                  scale: 7,
                  opacity: 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut", delay }}
              />
            ))}
          </div>
        )}

        {/* Confetes caindo */}
        {(stage === 'explosion' || stage === 'success') && (
          <>
            {confetti.map((c) => (
              <motion.div
                key={`confetti-${c.id}`}
                className="absolute w-2 h-4 rounded"
                style={{
                  backgroundColor: c.id % 3 === 0 ? '#22C55E' : c.id % 3 === 1 ? '#4ADE80' : '#FCD34D',
                  left: `${50 + (c.x / window.innerWidth) * 100}%`,
                }}
                initial={{ y: -100, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 720,
                }}
                transition={{ duration: 3, delay: c.delay, ease: "linear" }}
              />
            ))}
          </>
        )}

        {/* Etapa 3: Mensagem de sucesso */}
        {stage === 'success' && (
          <motion.div
            className="relative text-center px-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", bounce: 0.4 }}
          >
            {/* Troféu no centro com brilho */}
            <div className="relative mb-6">
              <motion.div
                className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-green-400 via-green-500 to-yellow-400 flex items-center justify-center relative"
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(34, 197, 94, 0.8)',
                    '0 0 80px rgba(34, 197, 94, 1)',
                    '0 0 40px rgba(34, 197, 94, 0.8)',
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                {/* Troféu */}
                <Trophy className="w-20 h-20 text-white relative z-10" strokeWidth={2} />

                {/* Brilho dourado pulsante atrás */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                >
                  <div className="w-32 h-32 rounded-full bg-yellow-300/30" />
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
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: s.delay,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>

            {/* Mensagem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-10"
            >
              <h2 className="text-3xl font-bold text-green-400 mb-2 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
                Plano Nutricional Criado!
              </h2>
              <p className="text-xl text-yellow-300/90 drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]">
                {message}
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
