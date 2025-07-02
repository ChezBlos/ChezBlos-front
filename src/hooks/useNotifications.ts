import { useToast } from "../contexts/ToastContext";

export const useNotifications = () => {
  let addToast: any = null;

  try {
    const toastContext = useToast();
    addToast = toastContext.addToast;
  } catch {
    // ToastContext pas disponible, utiliser console
    addToast = (toast: any) => {
      logger.debug(`[${toast.type.toUpperCase()}]: ${toast.message}`);
    };
  }

  const showSuccess = (message: string) => {
    addToast({ type: "success", message });
  };

  const showError = (message: string) => {
    addToast({ type: "error", message });
  };

  const showWarning = (message: string) => {
    addToast({ type: "warning", message });
  };

  const showInfo = (message: string) => {
    addToast({ type: "info", message });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
