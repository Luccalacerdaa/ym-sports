import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export const useAutoNotificationPermission = () => {
  const { user } = useAuth();
  const { isSupported, permission, subscribe } = usePushNotifications();
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  useEffect(() => {
    if (!user || !isSupported || hasAskedPermission) return;

    // Verificar se já perguntamos antes para este usuário
    const hasAskedBefore = localStorage.getItem(`notification_permission_asked_${user.id}`);
    
    if (hasAskedBefore) {
      setHasAskedPermission(true);
      return;
    }

    // Aguardar um pouco para não ser intrusivo logo na entrada
    const timer = setTimeout(async () => {
      try {
        // Se a permissão ainda não foi concedida, perguntar
        if (permission === 'default') {
          const result = await Notification.requestPermission();
          
          if (result === 'granted') {
            toast.success('🔔 Notificações ativadas! Você receberá lembretes sobre treinos e refeições.');
            
            // Tentar se inscrever para push notifications
            try {
              await subscribe();
            } catch (error) {
              console.warn('Erro ao se inscrever para push notifications:', error);
            }
          } else if (result === 'denied') {
            toast.error('❌ Notificações desativadas. Você pode ativá-las nas configurações do navegador.');
          }
          
          // Marcar que já perguntamos para este usuário
          localStorage.setItem(`notification_permission_asked_${user.id}`, 'true');
          setHasAskedPermission(true);
        } else if (permission === 'granted') {
          // Se já tem permissão, tentar se inscrever silenciosamente
          try {
            await subscribe();
          } catch (error) {
            console.warn('Erro ao se inscrever para push notifications:', error);
          }
          setHasAskedPermission(true);
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão de notificação:', error);
        setHasAskedPermission(true);
      }
    }, 3000); // Aguardar 3 segundos após o login

    return () => clearTimeout(timer);
  }, [user, isSupported, permission, subscribe, hasAskedPermission]);

  return {
    hasAskedPermission,
    isSupported,
    permission
  };
};
