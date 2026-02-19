import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Beef, Salad, Cookie, Milk, Leaf } from 'lucide-react';

interface NutritionLoadingAnimationProps {
  phase: 'saving' | 'generating';
}

export function NutritionLoadingAnimation({ phase }: NutritionLoadingAnimationProps) {
  const phaseTexts = {
    saving: 'Salvando suas preferências...',
    generating: 'IA criando seu plano nutricional...'
  };

  // Alimentos que aparecem no prato
  const foods = [
    { icon: <div className="w-10 h-10 rounded-full bg-yellow-400" />, delay: 0, position: { top: '35%', left: '35%' } }, // Arroz
    { icon: <div className="w-8 h-8 rounded-full bg-amber-700" />, delay: 1, position: { top: '35%', right: '35%' } }, // Feijão
    { icon: <Beef className="w-10 h-10 text-red-400" />, delay: 2, position: { bottom: '35%', left: '35%' } }, // Carne
    { icon: <Salad className="w-10 h-10 text-green-400" />, delay: 3, position: { bottom: '35%', right: '35%' } }, // Salada
  ];

  // Partículas flutuantes ao redor
  const particles = [
    { icon: <Leaf className="w-5 h-5 text-green-400" />, angle: 0 },
    { icon: <Apple className="w-4 h-4 text-red-400" />, angle: 45 },
    { icon: <Salad className="w-5 h-5 text-green-500" />, angle: 90 },
    { icon: <Cookie className="w-4 h-4 text-yellow-400" />, angle: 135 },
    { icon: <Milk className="w-5 h-5 text-blue-200" />, angle: 180 },
    { icon: <Beef className="w-4 h-4 text-red-300" />, angle: 225 },
    { icon: <Leaf className="w-5 h-5 text-green-300" />, angle: 270 },
    { icon: <Apple className="w-4 h-4 text-green-400" />, angle: 315 },
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
        {/* Container do prato */}
        <div className="relative flex items-center justify-center">
          {/* Prato circular */}
          <motion.div
            className="relative w-64 h-64 rounded-full border-8 border-white/20 bg-white/5"
            animate={{
              boxShadow: [
                '0 0 40px rgba(34, 197, 94, 0.3)',
                '0 0 80px rgba(34, 197, 94, 0.6)',
                '0 0 40px rgba(34, 197, 94, 0.3)',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            {/* Alimentos aparecendo dentro do prato */}
            {foods.map((food, index) => (
              <motion.div
                key={`food-${index}`}
                className="absolute"
                style={food.position}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: food.delay, 
                  duration: 0.5,
                  type: "spring",
                  bounce: 0.5
                }}
              >
                {food.icon}
              </motion.div>
            ))}
          </motion.div>

          {/* Partículas orbitando ao redor do prato */}
          {particles.map((particle, index) => {
            const radius = 180;
            const angle = particle.angle;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={`particle-${index}`}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, x, 0],
                  y: [0, y, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              >
                {particle.icon}
              </motion.div>
            );
          })}

          {/* Brilho verde pulsante no centro quando todos os alimentos aparecem */}
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-green-400/10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              delay: 5, // Começa após todos os alimentos aparecerem
            }}
          />
        </div>

        {/* Texto e fase */}
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
            className="text-green-400 text-xl font-semibold mb-6"
          >
            {phaseTexts[phase]}
          </motion.p>

          {/* Barra de progresso animada */}
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-500"
                initial={{ width: '0%' }}
                animate={{ 
                  width: '100%',
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  width: { duration: 15, ease: "linear" },
                  backgroundPosition: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear"
                  }
                }}
                style={{
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                  backgroundSize: '200% 100%'
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
              <Leaf className="w-6 h-6 text-green-400/50" />
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
              <Apple className="w-6 h-6 text-red-400/50" />
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
              <Salad className="w-6 h-6 text-green-500/50" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
