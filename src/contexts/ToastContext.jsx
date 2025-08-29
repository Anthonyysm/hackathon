import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from '../Components/NotificationToast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showAppToast = useCallback((message, type = 'info', duration = 5000) => {
    setToast({ message, type, duration, id: Date.now() });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showAppToast }}>
      {children}
      {toast && (
        <NotificationToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleCloseToast}
          isVisible={!!toast}
        />
      )}
    </ToastContext.Provider>
  );
};
