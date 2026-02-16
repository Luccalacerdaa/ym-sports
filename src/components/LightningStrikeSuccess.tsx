import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check } from 'lucide-react';

interface LightningStrikeSuccessProps {
  message: string;
  onComplete: () => void;
}

export function LightningStrikeSuccess({ message, onComplete }: LightningStrikeSuccessProps) {
  const [stage, setStage] = useState<'lightning' | 'explosion' | 'success'>('lightning');

  // Gerar partículas em círculo
  const particles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i * 360) / 30;
    return {
      x: Math.cos((angle * Math.PI) / 180),
      y: Math.sin((angle * Math.PI) / 180),
    };
  });

  // Partículas elétricas flutuantes
  const floatingParticles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    delay: Math.random() * 0.5,
  }));

  useEffect(() => {
    // Etapa 1: Raio (0.5s)
    const lightningTimer = setTimeout(() => {
      setStage('explosion');
    }, 500);

    // Etapa 2: Explosão (0.3s)
    const explosionTimer = setTimeout(() => {
      setStage('success');
    }, 800);

    // Etapa 3: Mensagem de sucesso (2s) + fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(lightningTimer);
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
        {/* Etapa 1: Raio diagonal */}
        {stage === 'lightning' && (
          <>
            {/* Raio principal */}
            <motion.div
              className="absolute w-2 h-full origin-top-left"
              style={{
                background: 'linear-gradient(180deg, transparent, #FCD34D 20%, #FBBF24, #FCD34D 80%, transparent)',
                boxShadow: '0 0 40px #FCD34D, 0 0 80px #FBBF24',
                transform: 'rotate(45deg)',
                left: '-20%',
                top: '-50%',
              }}
              initial={{ y: -2000, opacity: 0 }}
              animate={{ y: 0, opacity: [0, 1, 0.8] }}
              transition={{ duration: 0.5, ease: "easeIn" }}
            />

            {/* Raio secundário (mais fino) */}
            <motion.div
              className="absolute w-1 h-full origin-top-left"
              style={{
                background: 'linear-gradient(180deg, transparent, #FCD34D 20%, #FBBF24, #FCD34D 80%, transparent)',
                boxShadow: '0 0 20px #FCD34D',
                transform: 'rotate(48deg)',
                left: '-18%',
                top: '-50%',
              }}
              initial={{ y: -2000, opacity: 0 }}
              animate={{ y: 0, opacity: [0, 0.8, 0.6] }}
              transition={{ duration: 0.5, ease: "easeIn", delay: 0.05 }}
            />

            {/* Brilho de impacto no topo */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-yellow-400"
              style={{
                boxShadow: '0 0 100px 50px rgba(252, 211, 77, 0.8)',
                left: '-10%',
                top: '-10%',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.3 }}
            />
          </>
        )}

        {/* Etapa 2: Explosão no centro */}
        {(stage === 'explosion' || stage === 'success') && (
          <div className="relative flex items-center justify-center">
            {/* Flash branco */}
            {stage === 'explosion' && (
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Partículas explodindo */}
            {particles.map((particle, i) => (
              <motion.div
                key={`explosion-${i}`}
                className="absolute w-3 h-3 rounded-full bg-yellow-400"
                style={{
                  boxShadow: '0 0 10px #FCD34D',
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: particle.x * 200,
                  y: particle.y * 200,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}

            {/* Ondas de choque */}
            {[0, 0.15, 0.3].map((delay, i) => (
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
            transition={{ delay: 0.3, duration: 0.5, type: "spring", bounce: 0.4 }}
          >
            {/* Ícone combinado: Raio + Check */}
            <div className="relative mb-6">
              {/* Círculo amarelo brilhante */}
              <motion.div
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center relative"
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(252, 211, 77, 0.8)',
                    '0 0 80px rgba(252, 211, 77, 1)',
                    '0 0 40px rgba(252, 211, 77, 0.8)',
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                {/* Raio de fundo */}
                <motion.div
                  className="absolute"
                  initial={{ rotate: -15, opacity: 0.3 }}
                  animate={{ rotate: -15, opacity: [0.3, 0.5, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Zap className="w-16 h-16 text-yellow-200" />
                </motion.div>

                {/* Check na frente */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                >
                  <Check className="w-20 h-20 text-black relative z-10 stroke-[3]" />
                </motion.div>
              </motion.div>

              {/* Partículas elétricas flutuando */}
              {floatingParticles.map((p) => (
                <motion.div
                  key={`float-${p.id}`}
                  className="absolute w-2 h-2 rounded-full bg-yellow-400"
                  style={{
                    left: '50%',
                    top: '50%',
                    boxShadow: '0 0 10px #FCD34D',
                  }}
                  animate={{
                    x: [0, p.x, 0],
                    y: [0, p.y, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: p.delay,
                  }}
                />
              ))}
            </div>

            {/* Mensagem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-10"
            >
              <h2 className="text-3xl font-bold text-yellow-400 mb-2 drop-shadow-[0_0_20px_rgba(252,211,77,0.8)]">
                Treinos Criados!
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
