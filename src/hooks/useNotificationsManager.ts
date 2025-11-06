import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications';

export const useNotificationsManager = () => {
  const { user } = useAuth();
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const { setupDefaultNotifications } = useScheduledNotifications();
  
  // Verificar se é a primeira vez que o usuário acessa o app
  useEffect(() => {
    if (user) {
      const hasSetupNotifications = localStorage.getItem(`notifications_setup_${user.id}`);
      
      if (!hasSetupNotifications) {
        // Configurar notificações padrão automaticamente na primeira vez
        setupDefaultNotifications().then(() => {
          localStorage.setItem(`notifications_setup_${user.id}`, 'true');
        });
      }
    }
  }, [user]);
  
  const openNotificationsDialog = () => {
    setIsNotificationsDialogOpen(true);
  };
  
  const closeNotificationsDialog = () => {
    setIsNotificationsDialogOpen(false);
  };
  
  return {
    isNotificationsDialogOpen,
    openNotificationsDialog,
    closeNotificationsDialog
  };
};
