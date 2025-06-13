import React from "react";
import Toast, { ToastType } from "./toast";

interface ToastState {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastState[];
  onToastClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onToastClose,
}) => {
  return (
    <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`pointer-events-auto transition-transform duration-200 ease-out`}
          data-index={index}
        >
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => onToastClose(toast.id)}
            isVisible={true}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
