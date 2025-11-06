import { useState } from 'react';

export const useNotificationsManager = () => {
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  
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
