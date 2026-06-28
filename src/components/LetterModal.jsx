import { useEffect, useState } from 'react';
import Spinner from './Spinner.jsx';

// Shows an AI-drafted civic complaint letter with copy + email actions.
// `letter` is { subject, body, department }; pass loading/error for states.
export default function LetterModal({ open, letter, loading, error, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open) return null;

  const fullText = letter ? `${letter.subject}\n\n${letter.body}` : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const mailto = letter
    ? `mailto:?subject=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(
        letter.body
      )}`
    : '#';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col animate-scale-in rounded-2xl border border-white/10 bg-surface-2 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <div className="code text-[10px] uppercase tracking-widest text-civic">
              AI complaint letter
            </div>
            <h2 className="mt-0.5 font-display text-lg font-semibold text-ink">
              Send this to the authority
            </h2>
            {letter?.department ? (
              <p className="mt-0.5 text-xs text-ink/55">To: {letter.department}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="btn-ghost px-2 py-1 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Spinner label="Gemini is drafting your letter…" />
            </div>
          ) : error ? (
            <p className="rounded-md bg-signal/10 px-3 py-2 text-sm text-signal">
              Couldn’t draft the letter. Please try again.
            </p>
          ) : letter ? (
            <>
              <p className="mb-2 text-sm font-semibold text-ink">{letter.subject}</p>
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink/80">
                {letter.body}
              </pre>
            </>
          ) : null}
        </div>

        {letter && !loading && !error ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 p-4">
            <button type="button" onClick={copy} className="btn-ghost px-4 py-2 text-sm">
              {copied ? '✓ Copied' : 'Copy text'}
            </button>
            <a href={mailto} className="btn-civic px-4 py-2 text-sm">
              Open in email
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
