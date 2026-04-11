'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Check, AlertTriangle, Info, X as CloseIcon, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const now = Date.now();
    setToasts(prev => [...prev, { id, type, message, createdAt: now }]);

    // Auto-remove após TOAST_DURATION
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
            index={index}
            totalToasts={toasts.length}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
  index: number;
  totalToasts: number;
}

function ToastItem({ toast, onClose, index, totalToasts }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const [isLeaving, setIsLeaving] = useState(false);

  // Calcular tempo restante para a barra de progresso
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300); // Aguardar animação de saída
  };

  const icons = {
    success: Check,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: 'text-green-400',
      progress: 'bg-green-500',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'text-red-400',
      progress: 'bg-red-500',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-400',
      progress: 'bg-blue-500',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: 'text-yellow-400',
      progress: 'bg-yellow-500',
    },
  };

  const Icon = icons[toast.type];
  const color = colors[toast.type];

  // Calcular offset para stacking
  const stackOffset = Math.min(index, 2) * -2; // Máximo de 3 toasts visíveis empilhados

  return (
    <div
      className={`relative min-w-[320px] max-w-md overflow-hidden rounded-lg border p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 ${color.bg} ${color.border} ${
        isLeaving ? 'animate-[slideOut_0.3s_ease-in_forwards]' : 'animate-[slideIn_0.3s_ease-out]'
      }`}
      style={{
        transform: `translateY(${stackOffset}px)`,
        opacity: isLeaving ? 0 : 1,
        zIndex: totalToasts - index,
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 rounded-full p-1 ${color.bg}`}>
          <Icon className={`h-5 w-5 ${color.icon}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${color.text}`}>{toast.message}</p>
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 rounded p-1 text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:text-foreground hover:rotate-90 hover:scale-110"
          title="Fechar"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Barra de Progresso */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/10">
        <div
          className={`h-full ${color.progress} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Efeito de brilho */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 hover:translate-x-full" />
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
