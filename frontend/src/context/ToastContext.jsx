import { createContext, useContext, useState, useCallback } from "react";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXMark
} from "react-icons/hi2";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3500) => {
    setToasts((prev) => {
      // Bir xil xabarni qayta-qayta to'plamaslik (spamdan himoya)
      if (prev.some((t) => t.message === message)) {
        return prev;
      }
      const id = Date.now() + Math.random();
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, duration);
      // Ekranda maksimal 3 tagacha toast bo'ladi
      const updated = [...prev, { id, message, type }];
      return updated.slice(-3);
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => showToast(msg, "success", dur),
    error: (msg, dur) => showToast(msg, "error", dur),
    warning: (msg, dur) => showToast(msg, "warning", dur),
    info: (msg, dur) => showToast(msg, "info", dur),
  };

  const renderIcon = (type) => {
    switch (type) {
      case "success":
        return <HiCheckCircle className="toast-icon toast-icon-success" />;
      case "error":
        return <HiExclamationCircle className="toast-icon toast-icon-error" />;
      case "warning":
        return <HiExclamationTriangle className="toast-icon toast-icon-warning" />;
      default:
        return <HiInformationCircle className="toast-icon toast-icon-info" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            <div className="toast-content">
              {renderIcon(t.type)}
              <span className="toast-message">{t.message}</span>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(t.id)}
            >
              <HiXMark />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
