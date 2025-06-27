import React from "react";
import { Alert } from "./Alert";
import { useAlert } from "../contexts/AlertContext";

export const AlertContainer: React.FC = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          id={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={removeAlert}
          autoClose={alert.autoClose}
          duration={alert.duration}
        />
      ))}
    </div>
  );
};
