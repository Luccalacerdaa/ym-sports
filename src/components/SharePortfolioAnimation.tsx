import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check, Send } from 'lucide-react';

interface SharePortfolioAnimationProps {
  platform: 'link' | 'whatsapp' | 'email';
  onComplete: () => void;
}

export function SharePortfolioAnimation({ platform, onComplete }: SharePortfolioAnimationProps) {
  const [stage, setStage] = useState<'waves' | 'explosion' | 'success'>('waves');

  // Mensagens customizadas por plataforma
  const messages = {
    link: 'Link copiado!',
    whatsapp: 'Abrindo WhatsApp...',
    email: 'Abrindo email...',
  };

  // Cores por plataforma
  const colors = {
    link: { primary: 'rgb(34, 197, 94)', secondary: 'rgb(22, 163, 74)' }, // green
    whatsapp: { primary: 'rgb(34, 197, 94)', secondary: 'rgb(22, 163, 74)' }, // green
    email: { primary: 'rgb(252, 211, 77)', secondary: 'rgb(251, 191, 36)' }, // yellow
  };

  const currentColor = colors[platform];

  // Ondas concêntricas
  const waves = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
  }));

  // Partículas de explosão
  const explosionParticles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180),
      y: Math.sin((angle * Math.PI) / 180),
    };
  });

  // Partículas flutuantes
  const floatingParticles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    delay: Math.random() * 0.5,
  }));

  useEffect(() => {
    // Etapa 1: Ondas (0.8s)
    const wavesTimer = setTimeout(() => {
      setStage('explosion');
    }, 800);

    // Etapa 2: Explosão (0.7s)
    const explosionTimer = setTimeout(() => {
      setStage('success');
    }, 1500);

    // Etapa 3: Mensagem de sucesso (2s) + fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(wavesTimer);
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
        {/* Etapa 1: Ondas de compartilhamento */}
        {stage === 'waves' && (
          <div className="relative">
            {/* Ícone central pulsante */}
            <motion.div
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.secondary})`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  `0 0 40px ${currentColor.primary}80`,
                  `0 0 80px ${currentColor.primary}`,
                  `0 0 40px ${currentColor.primary}80`,
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <Share2 className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>

            {/* Ondas concêntricas expandindo */}
            {waves.map((wave) => (
              <motion.div
                key={wave.id}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
                style={{
                  borderColor: currentColor.primary,
                }}
                initial={{ width: 100, height: 100, opacity: 0.8 }}
                animate={{
                  width: 500,
                  height: 500,
                  opacity: 0,
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                  delay: wave.delay,
                }}
              />
            ))}

            {/* Partículas saindo */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: currentColor.primary,
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * 150,
                    y: Math.sin((angle * Math.PI) / 180) * 150,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: i * 0.05,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Etapa 2: Explosão central */}
        {stage === 'explosion' && (
          <div className="relative">
            {/* Flash central */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
              style={{
                backgroundColor: currentColor.primary,
                boxShadow: `0 0 100px 50px ${currentColor.primary}80`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 2], opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            {/* Partículas explodindo */}
            {explosionParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                style={{
                  backgroundColor: currentColor.primary,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: particle.x * 180,
                  y: particle.y * 180,
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ))}

            {/* Ondas de choque */}
            {[0, 0.2].map((delay) => (
              <motion.div
                key={delay}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                  borderColor: currentColor.primary,
                }}
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{ width: 400, height: 400, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay }}
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
                className="w-36 h-36 mx-auto rounded-full flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.secondary})`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 40px ${currentColor.primary}80`,
                    `0 0 80px ${currentColor.primary}`,
                    `0 0 40px ${currentColor.primary}80`,
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                {/* Ícone combinado */}
                <div className="relative">
                  <Share2 className="w-16 h-16 text-white relative z-10" strokeWidth={2} />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <Check className="w-6 h-6" style={{ color: currentColor.primary }} strokeWidth={3} />
                    </div>
                  </motion.div>
                </div>

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
                  <div
                    className="w-32 h-32 rounded-full"
                    style={{
                      backgroundColor: `${currentColor.primary}40`,
                    }}
                  />
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
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: p.delay,
                  }}
                >
                  <Send
                    className="w-4 h-4"
                    style={{ color: currentColor.primary }}
                  />
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
              <h2
                className="text-3xl font-bold mb-3"
                style={{
                  color: currentColor.primary,
                  textShadow: `0 0 20px ${currentColor.primary}80`,
                }}
              >
                {messages[platform]}
              </h2>

              {platform === 'link' && (
                <p className="text-xl text-gray-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  Cole e compartilhe onde quiser
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
