import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detectar se é dispositivo móvel
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  useEffect(() => {
    // Se não for mobile, pular o splash
    if (!isMobile()) {
      onComplete();
      return;
    }

    // Mostrar vídeo imediatamente (sem logo primeiro)
    setShowVideo(true);
  }, [onComplete]);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      // Tentar reproduzir o vídeo
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.log('Autoplay bloqueado, mas vídeo ainda será exibido');
          // Se autoplay falhar, ainda assim fechar após 6 segundos
          setTimeout(() => {
            handleComplete();
          }, 6000);
        }
      };

      // Pequeno delay para garantir que o vídeo carregou
      setTimeout(playVideo, 100);
    }
  }, [showVideo]);

  const handleVideoEnd = () => {
    handleComplete();
  };

  const handleVideoError = () => {
    console.log('Erro ao carregar vídeo, continuando...');
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 500); // Tempo para animação de saída
  };


  if (!isMobile()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          style={{ touchAction: 'none' }}
        >


          {/* Vídeo de Introdução */}
          <AnimatePresence>
            {showVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center relative"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  autoPlay
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnd}
                  onError={handleVideoError}
                >
                  <source src="/intro-video.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeo HTML5.
                </video>


                {/* Gradient overlay nas bordas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30 pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
