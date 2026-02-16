import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Sparkles } from 'lucide-react';

export function PortfolioSaveLoadingAnimation() {
  // Criar 5 anéis com delays escalonados
  const rings = [
    { delay: 0, size: 80 },
    { delay: 0.4, size: 120 },
    { delay: 0.8, size: 160 },
    { delay: 1.2, size: 200 },
    { delay: 1.6, size: 240 }
  ];

  // Partículas orbitando
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 8,
    delay: i * 0.1,
  }));

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
              <User className="w-10 h-10 text-white" strokeWidth={2.5} />
            </motion.div>

            {/* Pulso interno */}
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-300/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            />
          </motion.div>

          {/* Partículas orbitando */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "linear",
                delay: p.delay,
              }}
              style={{
                width: 140,
                height: 140,
              }}
            >
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: p.delay,
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Texto e barra de progresso */}
        <motion.div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Texto animado */}
          <motion.p
            className="text-xl font-semibold mb-6 text-yellow-200"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            Salvando alterações...
          </motion.p>

          {/* Barra de progresso */}
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              style={{
                width: '50%',
              }}
            />
          </div>
        </motion.div>

        {/* Ícones decorativos flutuantes */}
        <motion.div
          className="absolute top-1/4 left-1/4"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            delay: 0.5,
          }}
        >
          <FileText className="w-8 h-8 text-yellow-400/40" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 right-1/4"
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            delay: 1,
          }}
        >
          <User className="w-8 h-8 text-yellow-400/40" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
