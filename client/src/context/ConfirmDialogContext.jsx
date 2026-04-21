import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ConfirmDialogContext = createContext(null);

export const ConfirmDialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const resolveDialog = useCallback((value) => {
    setDialog((current) => {
      current?.resolve?.(value);
      return null;
    });
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        title: options.title || "Confirm action",
        description: options.description || "",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        tone: options.tone || "default",
        resolve,
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      confirm,
    }),
    [confirm]
  );

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {dialog ? (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-[#1f1712]/58 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-stone-200 bg-[rgba(255,250,244,0.98)] p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">Please confirm</p>
            <h3 className="mt-3 font-display text-4xl leading-none text-stone-900">{dialog.title}</h3>
            {dialog.description ? <p className="mt-4 text-sm leading-6 text-stone-600">{dialog.description}</p> : null}

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => resolveDialog(false)} className="btn-secondary flex-1">
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => resolveDialog(true)}
                className={dialog.tone === "danger" ? "flex-1 rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700" : "btn-primary flex-1"}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }

  return context;
};
