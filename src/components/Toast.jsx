import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-55 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/50',
      text: 'text-emerald-800 dark:text-emerald-450',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-55 dark:bg-red-950/25 border-red-200 dark:border-red-900/50',
      text: 'text-red-800 dark:text-red-450',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-55 dark:bg-blue-950/25 border-blue-200 dark:border-blue-900/50',
      text: 'text-blue-800 dark:text-blue-450',
      icon: Info
    }
  };

  const config = typeConfig[type] || typeConfig.success;
  const Icon = config.icon;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 border rounded-2xl shadow-xl animate-bounce-in glass ${config.bg} ${config.text} max-w-sm`}
      style={{
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="text-sm font-semibold pr-2 leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition shrink-0 ml-auto"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
