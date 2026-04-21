import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    icon: CheckCircle2,
    panel: "border-emerald-200 bg-emerald-50 text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
  },
  error: {
    icon: CircleAlert,
    panel: "border-rose-200 bg-rose-50 text-rose-900",
    badge: "bg-rose-100 text-rose-700",
  },
  info: {
    icon: Info,
    panel: "border-brand-100 bg-white text-stone-900",
    badge: "bg-brand-50 text-brand-700",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ title, message, tone = "info", duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          message,
          tone,
        },
      ]);

      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      dismissToast,
    }),
    [dismissToast, pushToast, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const style = toastStyles[toast.tone] || toastStyles.info;
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-[24px] border px-4 py-4 shadow-[0_24px_60px_rgba(73,37,9,0.12)] ${style.panel}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${style.badge}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message ? <p className="mt-1 text-sm leading-6 text-stone-600">{toast.message}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 text-stone-400 transition hover:bg-white/70 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
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
