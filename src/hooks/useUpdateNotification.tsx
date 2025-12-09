import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useUpdateNotification = () => {
  const { toast } = useToast();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker não suportado');
      return;
    }

    // Verificar atualizações a cada 5 minutos
    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          console.log('🔄 Verificando atualizações...');
          await reg.update();
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      }
    };

    // Verificar imediatamente
    checkForUpdates();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    // Listener para novas versões do SW
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🆕 Nova versão do app detectada!');
      
      // Apenas mostrar notificação, sem reload automático
      toast({
        title: '🆕 Nova versão disponível!',
        description: 'Recarregue a página para atualizar.',
        duration: 5000,
      });
    });

    // Detectar Service Worker aguardando
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      if (reg.waiting) {
        console.log('🔄 Nova versão aguardando ativação...');
        setUpdateAvailable(true);
        
        toast({
          title: '🔄 Atualização disponível!',
          description: 'Clique para atualizar o app.',
          action: (
            <button
              onClick={() => {
                if (reg.waiting) {
                  reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Atualizar Agora
            </button>
          ),
          duration: 10000,
        });
      }

      // Listener para detectar novas versões instalando
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        console.log('🔄 Nova versão encontrada, instalando...');

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('🔄 Estado do SW mudou para:', newWorker.state);

            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ Nova versão instalada!');
              setUpdateAvailable(true);

              toast({
                title: '🆕 Nova versão instalada!',
                description: 'Clique para atualizar o app.',
                action: (
                  <button
                    onClick={() => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                  >
                    Atualizar Agora
                  </button>
                ),
                duration: 10000,
              });
            }
          });
        }
      });
    });

    return () => {
      clearInterval(interval);
    };
  }, [toast]);

  const updateNow = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    updateAvailable,
    updateNow,
  };
};

