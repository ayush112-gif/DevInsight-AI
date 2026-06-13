import type { Toast } from "../hooks/useToast";

interface Props {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

const icons: Record<string, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  loading: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  ),
};

const styles: Record<string, string> = {
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  error:   "border-rose-400/30    bg-rose-400/10    text-rose-400",
  loading: "border-cyan-400/30    bg-cyan-400/10    text-cyan-400",
};

export function ToastContainer({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm animate-in slide-in-from-right-4 duration-300 ${styles[t.type]}`}
          style={{ minWidth: 240, maxWidth: 360 }}
        >
          <span className="shrink-0">{icons[t.type]}</span>
          <span className="flex-1 text-zinc-200">{t.message}</span>
          {t.type !== "loading" && (
            <button
              onClick={() => onRemove(t.id)}
              className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}