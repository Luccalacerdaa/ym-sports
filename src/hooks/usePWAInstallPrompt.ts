import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const usePWAInstallPrompt = () => {
  const { user } = useAuth();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listener para o evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir o prompt automático
      e.preventDefault();
      // Guardar o evento para usar depois
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (user) {
      // Verificar se deve mostrar o tooltip após login
      const shouldShowPrompt = checkShouldShowPrompt();
      if (shouldShowPrompt) {
        // Aguardar um pouco após o login para mostrar
        const timer = setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // 3 segundos após login

        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const checkShouldShowPrompt = (): boolean => {
    // Verificar se está no ambiente do navegador
    if (typeof window === 'undefined') return false;
    
    // Não mostrar se já foi dispensado
    const dismissed = localStorage.getItem('ym-sports-pwa-tooltip-dismissed');
    if (dismissed === 'true') {
      return false;
    }

    // Não mostrar se já está instalado
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        return false;
      }
    } catch (error) {
      console.warn('Erro ao verificar display-mode:', error);
    }

    // Não mostrar se já foi mostrado hoje
    const lastShown = localStorage.getItem('ym-sports-pwa-tooltip-last-shown');
    if (lastShown) {
      const lastShownDate = new Date(lastShown);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastShownDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Mostrar apenas uma vez por dia
      if (diffDays < 1) {
        return false;
      }
    }

    // Verificar se é um dispositivo móvel ou desktop que suporta PWA
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    return isMobile || isChrome || isSafari;
  };

  const handlePromptShown = () => {
    // Marcar que foi mostrado hoje
    localStorage.setItem('ym-sports-pwa-tooltip-last-shown', new Date().toISOString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Mostrar o prompt nativo (Android/Chrome)
      deferredPrompt.prompt();
      
      // Aguardar a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA instalado via prompt nativo');
      } else {
        console.log('PWA não instalado via prompt nativo');
      }
      
      // Limpar o prompt
      setDeferredPrompt(null);
    }
    
    setShowInstallPrompt(false);
    handlePromptShown();
  };

  const handlePromptDismiss = () => {
    setShowInstallPrompt(false);
    handlePromptShown();
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('ym-sports-pwa-tooltip-dismissed', 'true');
    setShowInstallPrompt(false);
  };

  // Função para mostrar o prompt manualmente (pode ser chamada de configurações)
  const showInstallPromptManually = () => {
    setShowInstallPrompt(true);
  };

  // Verificar se o PWA está instalado
  const isPWAInstalled = () => {
    try {
      return typeof window !== 'undefined' && 
             window.matchMedia && 
             window.matchMedia('(display-mode: standalone)').matches;
    } catch (error) {
      console.warn('Erro ao verificar se PWA está instalado:', error);
      return false;
    }
  };

  // Verificar se o dispositivo suporta instalação
  const canInstallPWA = () => {
    return deferredPrompt !== null || 
           /iPhone|iPad|iPod/.test(navigator.userAgent) ||
           /Android/.test(navigator.userAgent);
  };

  return {
    showInstallPrompt,
    deferredPrompt,
    isPWAInstalled: isPWAInstalled(),
    canInstallPWA: canInstallPWA(),
    handleInstallClick,
    handlePromptDismiss,
    handleDontShowAgain,
    showInstallPromptManually
  };
};
