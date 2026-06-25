import { useEffect } from 'react';

// A small, accessible confirm modal with a backdrop. Closes on Escape.
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
        onClick={() => !busy && onCancel?.()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm animate-scale-in rounded-2xl border border-white/10 bg-surface-2 p-5 shadow-2xl">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {body ? <p className="mt-2 text-sm text-ink/65">{body}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onCancel?.()}
            disabled={busy}
            className="btn-ghost px-4 py-2 text-sm disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.()}
            disabled={busy}
            className={`btn px-4 py-2 text-sm text-white disabled:opacity-60 ${
              danger ? 'bg-urgent hover:bg-[#f4566f]' : 'bg-civic hover:bg-[#2f6fe0]'
            }`}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
                Working…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
