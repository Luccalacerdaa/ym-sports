import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
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

    // Mostrar logo primeiro, depois vídeo
    const logoTimer = setTimeout(() => {
      setShowVideo(true);
    }, 1500);

    return () => clearTimeout(logoTimer);
  }, [onComplete]);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      // Tentar reproduzir o vídeo
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.log('Autoplay bloqueado, continuando sem vídeo');
          // Se autoplay falhar, continuar após 3 segundos
          setTimeout(() => {
            handleComplete();
          }, 3000);
        }
      };

      if (videoLoaded) {
        playVideo();
      }
    }
  }, [showVideo, videoLoaded]);

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

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleComplete();
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
          {/* Botão Skip */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: showVideo ? 1 : 0 }}
            onClick={handleSkip}
            className="absolute top-8 right-8 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
          >
            Pular
          </motion.button>

          {/* Logo Inicial */}
          <AnimatePresence>
            {!showVideo && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <div className="w-32 h-32 mb-6 relative">
                  <img 
                    src="/icons/logo.png" 
                    alt="YM Sports" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full animate-pulse" />
                </div>
                
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl font-bold text-white mb-2 text-center"
                >
                  YM Sports
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-yellow-500 text-lg font-medium text-center"
                >
                  Seu App de Fitness
                </motion.p>

                {/* Loading dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="flex space-x-2 mt-8"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-3 h-3 bg-yellow-500 rounded-full"
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vídeo de Introdução */}
          <AnimatePresence>
            {showVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full flex items-center justify-center relative"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoLoaded(true)}
                  onEnded={handleVideoEnd}
                  onError={handleVideoError}
                  poster="/icons/logo.png"
                >
                  <source src="/intro-video.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeo HTML5.
                </video>

                {/* Overlay com logo durante carregamento */}
                {!videoLoaded && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mb-4 mx-auto">
                        <img 
                          src="/icons/logo.png" 
                          alt="YM Sports" 
                          className="w-full h-full object-contain animate-pulse"
                        />
                      </div>
                      <p className="text-white text-lg">Carregando...</p>
                    </div>
                  </div>
                )}

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
