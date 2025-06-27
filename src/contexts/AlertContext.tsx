import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AlertData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  autoClose?: boolean;
}

interface AlertContextType {
  alerts: AlertData[];
  showAlert: (
    type: AlertData["type"],
    message: string,
    options?: { duration?: number; autoClose?: boolean }
  ) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const showAlert = (
    type: AlertData["type"],
    message: string,
    options?: { duration?: number; autoClose?: boolean }
  ) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: AlertData = {
      id,
      type,
      message,
      duration: options?.duration ?? 5000,
      autoClose: options?.autoClose ?? true,
    };

    setAlerts((prev) => [...prev, newAlert]);

    // Auto-remove after duration
    if (newAlert.autoClose) {
      setTimeout(() => {
        removeAlert(id);
      }, newAlert.duration);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider
      value={{ alerts, showAlert, removeAlert, clearAllAlerts }}
    >
      {children}
    </AlertContext.Provider>
  );
};
