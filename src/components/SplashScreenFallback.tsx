import React, { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreenFallback({ onComplete }: SplashScreenProps) {
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
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Botão Skip */}
      <button
        onClick={handleSkip}
        className={`absolute top-8 right-8 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-yellow-500/30 hover:bg-yellow-500/20 transition-all duration-300 ${
          showVideo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Pular
      </button>

      {/* Logo Inicial */}
      {!showVideo && (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-32 h-32 mb-6 relative">
            <img 
              src="/icons/logo.png" 
              alt="YM Sports" 
              className="w-full h-full object-contain animate-pulse"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 text-center animate-slide-up">
            YM Sports
          </h1>
          
          <p className="text-yellow-500 text-lg font-medium text-center animate-slide-up-delay">
            Seu App de Fitness
          </p>

          {/* Loading dots */}
          <div className="flex space-x-2 mt-8 animate-fade-in-delay">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vídeo de Introdução */}
      {showVideo && (
        <div className="w-full h-full flex items-center justify-center relative animate-fade-in">
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
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.3s both;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.6s ease-out 0.5s both;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.5s ease-out 1s both;
        }
      `}</style>
    </div>
  );
}
