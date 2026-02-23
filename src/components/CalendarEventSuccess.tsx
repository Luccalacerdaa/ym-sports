import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Star, Bell } from 'lucide-react';

interface CalendarEventSuccessProps {
  eventTitle: string;
  eventType: 'game' | 'training' | 'personal' | 'other';
  onComplete: () => void;
}

const typeConfig = {
  game: {
    label: 'Jogo agendado!',
    color: 'from-yellow-400 via-yellow-500 to-orange-500',
    glow: 'rgba(251, 191, 36, 1)',
    glowSoft: 'rgba(251, 191, 36, 0.8)',
    ringColor: 'border-yellow-400',
    particleColor: '#FBBF24',
  },
  training: {
    label: 'Treino agendado!',
    color: 'from-blue-400 via-blue-500 to-blue-600',
    glow: 'rgba(59, 130, 246, 1)',
    glowSoft: 'rgba(59, 130, 246, 0.8)',
    ringColor: 'border-blue-400',
    particleColor: '#3B82F6',
  },
  personal: {
    label: 'Evento pessoal criado!',
    color: 'from-pink-400 via-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 1)',
    glowSoft: 'rgba(236, 72, 153, 0.8)',
    ringColor: 'border-pink-400',
    particleColor: '#EC4899',
  },
  other: {
    label: 'Evento criado!',
    color: 'from-purple-400 via-purple-500 to-purple-600',
    glow: 'rgba(168, 85, 247, 1)',
    glowSoft: 'rgba(168, 85, 247, 0.8)',
    ringColor: 'border-purple-400',
    particleColor: '#A855F7',
  },
};

export function CalendarEventSuccess({ eventTitle, eventType, onComplete }: CalendarEventSuccessProps) {
  const [stage, setStage] = useState<'burst' | 'icon' | 'success'>('burst');
  const config = typeConfig[eventType] || typeConfig.other;

  // Partículas de explosão
  const burstParticles = Array.from({ length: 28 }, (_, i) => {
    const angle = (i * 360) / 28;
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180),
      y: Math.sin((angle * Math.PI) / 180),
    };
  });

  // Anéis pulsantes
  const rings = [
    { delay: 0, size: 80 },
    { delay: 0.25, size: 130 },
    { delay: 0.5, size: 180 },
  ];

  // Estrelas flutuantes
  const stars = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: (Math.random() - 0.5) * 280,
    delay: Math.random() * 0.6,
    size: Math.random() * 8 + 8,
  }));

  // Mini calendários flutuantes
  const floatingIcons = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 320,
    y: (Math.random() - 0.5) * 320,
    delay: Math.random() * 0.8,
  }));

  useEffect(() => {
    const t1 = setTimeout(() => setStage('icon'), 700);
    const t2 = setTimeout(() => setStage('success'), 1400);
    const t3 = setTimeout(() => onComplete(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center overflow-hidden"
      >
        {/* Estágio 1 — Burst */}
        {stage === 'burst' && (
          <div className="relative">
            {/* Flash central */}
            <motion.div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br ${config.color}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.6, 2.2], opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ boxShadow: `0 0 80px 40px ${config.glowSoft}` }}
            />

            {/* Anéis irradiando */}
            {rings.map((ring) => (
              <motion.div
                key={ring.delay}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 ${config.ringColor}`}
                initial={{ width: ring.size * 0.3, height: ring.size * 0.3, opacity: 0.9 }}
                animate={{ width: ring.size * 4, height: ring.size * 4, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: ring.delay }}
              />
            ))}

            {/* Partículas explodindo */}
            {burstParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                style={{ backgroundColor: config.particleColor }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x * 200, y: p.y * 200, opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}

        {/* Estágio 2 — Ícone aparecendo */}
        {stage === 'icon' && (
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
          >
            <motion.div
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center relative`}
              animate={{ boxShadow: [`0 0 40px ${config.glowSoft}`, `0 0 80px ${config.glow}`, `0 0 40px ${config.glowSoft}`] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <Calendar className="w-16 h-16 text-white relative z-10" strokeWidth={2} />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: `${config.particleColor}30` }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.div>

            {/* Bell badge */}
            <motion.div
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', bounce: 0.6 }}
            >
              <Bell className="w-6 h-6" style={{ color: config.particleColor }} strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        )}

        {/* Estágio 3 — Mensagem de sucesso */}
        {stage === 'success' && (
          <motion.div
            className="relative text-center px-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: 'spring', bounce: 0.4 }}
          >
            {/* Ícone central */}
            <div className="relative mb-6">
              <motion.div
                className={`w-36 h-36 mx-auto rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center relative`}
                animate={{ boxShadow: [`0 0 40px ${config.glowSoft}`, `0 0 80px ${config.glow}`, `0 0 40px ${config.glowSoft}`] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Calendar className="w-20 h-20 text-white relative z-10" strokeWidth={2} />

                {/* Pulso de fundo */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                >
                  <div
                    className="w-32 h-32 rounded-full"
                    style={{ backgroundColor: `${config.particleColor}30` }}
                  />
                </motion.div>
              </motion.div>

              {/* Estrelas flutuando */}
              {stars.map((s) => (
                <motion.div
                  key={`star-${s.id}`}
                  className="absolute"
                  style={{ left: '50%', top: '50%' }}
                  animate={{
                    x: [0, s.x, 0],
                    y: [0, s.y, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: s.delay }}
                >
                  <Star
                    style={{ width: s.size, height: s.size, color: config.particleColor, fill: config.particleColor }}
                  />
                </motion.div>
              ))}

              {/* Mini calendários flutuando */}
              {floatingIcons.map((ic) => (
                <motion.div
                  key={`cal-${ic.id}`}
                  className="absolute"
                  style={{ left: '50%', top: '50%' }}
                  animate={{
                    x: [0, ic.x, 0],
                    y: [0, ic.y, 0],
                    opacity: [0, 0.7, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: ic.delay }}
                >
                  <Calendar className="w-5 h-5" style={{ color: config.particleColor }} />
                </motion.div>
              ))}
            </div>

            {/* Mensagem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <h2
                className="text-3xl font-bold mb-2"
                style={{
                  color: config.particleColor,
                  textShadow: `0 0 20px ${config.glowSoft}`,
                }}
              >
                {config.label}
              </h2>

              <p className="text-lg text-white/80 mb-1 font-medium">
                {eventTitle}
              </p>

              <p className="text-gray-400 text-sm">
                Você receberá um lembrete antes do evento
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
