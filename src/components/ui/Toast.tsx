'use client';

import { useEffect } from "react";
import { Icon } from "./Icon";
import { es } from "../../lib/i18n/es";

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border border-danger/30 bg-card px-4 py-3 shadow-[var(--shadow-md)]">
      <Icon.alert width={18} height={18} className="text-danger" />
      <span className="text-sm text-foreground">{message}</span>
      <button onClick={onDismiss} aria-label={es.common.toast.dismiss} className="text-muted-foreground hover:text-foreground">
        <Icon.x width={16} height={16} />
      </button>
    </div>
  );
}
