import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Dumbbell, Target } from 'lucide-react';

interface TrainingLoadingAnimationProps {
  phase: 'deleting' | 'generating' | 'saving';
  progress?: number;
}

export function TrainingLoadingAnimation({ phase, progress }: TrainingLoadingAnimationProps) {
  const phaseTexts = {
    deleting: 'Removendo treinos antigos...',
    generating: 'IA gerando seus treinos personalizados...',
    saving: 'Salvando treinos...'
  };

  // Criar 5 anéis com delays escalonados
  const rings = [
    { delay: 0, size: 80 },
    { delay: 0.4, size: 120 },
    { delay: 0.8, size: 160 },
    { delay: 1.2, size: 200 },
    { delay: 1.6, size: 240 }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        {/* Container dos anéis */}
        <div className="relative flex items-center justify-center">
          {/* Anéis pulsantes */}
          {rings.map((ring, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full border-4 border-yellow-400"
              style={{
                width: ring.size,
                height: ring.size,
              }}
              animate={{
                scale: [1, 2.5, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeOut",
                delay: ring.delay,
              }}
            />
          ))}

          {/* Centro brilhante */}
          <motion.div
            className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center"
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
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
              }}
            >
              <Zap className="w-10 h-10 text-black" />
            </motion.div>
          </motion.div>

          {/* Partículas flutuantes ao redor */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            const radius = 150;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, x, 0],
                  y: [0, y, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            );
          })}
        </div>

        {/* Texto e progresso */}
        <motion.div
          className="absolute bottom-32 left-0 right-0 text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-yellow-400 text-xl font-semibold mb-6"
          >
            {phaseTexts[phase]}
          </motion.p>

          {/* Barra de progresso animada */}
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500"
                initial={{ width: '0%' }}
                animate={{ 
                  width: progress ? `${progress}%` : '100%',
                }}
                transition={progress ? { duration: 0.5 } : {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                style={{
                  boxShadow: '0 0 20px rgba(252, 211, 77, 0.6)',
                }}
              />
            </div>
          </div>

          {/* Ícones decorativos flutuantes */}
          <div className="flex justify-center gap-8 mt-8">
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <Dumbbell className="w-6 h-6 text-yellow-400/50" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                delay: 0.3,
              }}
            >
              <Target className="w-6 h-6 text-yellow-400/50" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                delay: 0.6,
              }}
            >
              <Zap className="w-6 h-6 text-yellow-400/50" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
