import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';

interface PortfolioSaveSuccessProps {
  onComplete: () => void;
}

export function PortfolioSaveSuccess({ onComplete }: PortfolioSaveSuccessProps) {
  const [stage, setStage] = useState<'explosion' | 'icon' | 'success'>('explosion');

  // Gerar partículas em círculo para explosão
  const explosionParticles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i * 360) / 30;
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180),
      y: Math.sin((angle * Math.PI) / 180),
    };
  });

  // Partículas flutuantes para o estágio final
  const floatingParticles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    delay: Math.random() * 0.5,
  }));

  useEffect(() => {
    // Etapa 1: Explosão (0.6s)
    const explosionTimer = setTimeout(() => {
      setStage('icon');
    }, 600);

    // Etapa 2: Ícone (0.8s)
    const iconTimer = setTimeout(() => {
      setStage('success');
    }, 1400);

    // Etapa 3: Mensagem de sucesso (2s) + fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(explosionTimer);
      clearTimeout(iconTimer);
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
        {/* Etapa 1: Explosão inicial */}
        {stage === 'explosion' && (
          <div className="relative">
            {/* Flash central */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-yellow-400"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 2], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                boxShadow: '0 0 100px 50px rgba(252, 211, 77, 0.8)',
              }}
            />

            {/* Partículas explodindo */}
            {explosionParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-yellow-400"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: particle.x * 200,
                  y: particle.y * 200,
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}

            {/* Ondas de choque */}
            {[0, 0.2, 0.4].map((delay) => (
              <motion.div
                key={delay}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-yellow-400"
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{ width: 400, height: 400, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay }}
              />
            ))}
          </div>
        )}

        {/* Etapa 2: Ícone aparecendo */}
        {stage === 'icon' && (
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
          >
            {/* Ícone de check com brilho */}
            <motion.div
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 40px rgba(252, 211, 77, 0.8)',
                  '0 0 80px rgba(252, 211, 77, 1)',
                  '0 0 40px rgba(252, 211, 77, 0.8)',
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />

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
                <div className="w-28 h-28 rounded-full bg-yellow-300/40" />
              </motion.div>
            </motion.div>

            {/* Partículas orbitando */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 360) / 6;
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((angle * Math.PI) / 180) * 100, 0],
                    y: [0, Math.sin((angle * Math.PI) / 180) * 100, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              );
            })}
          </motion.div>
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
                <CheckCircle className="w-20 h-20 text-white relative z-10" strokeWidth={2} />

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

              {/* Partículas flutuando */}
              {floatingParticles.map((p) => (
                <motion.div
                  key={`particle-${p.id}`}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, p.x, 0],
                    y: [0, p.y, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: p.delay,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
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
                Portfólio Salvo!
              </h2>

              <p className="text-xl text-yellow-200/90 drop-shadow-[0_0_15px_rgba(252,211,77,0.5)]">
                Suas alterações foram salvas com sucesso
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
