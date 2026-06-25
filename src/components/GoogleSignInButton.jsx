import { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GIS_SRC = 'https://accounts.google.com/gsi/client';

// Load the Google Identity Services script exactly once across the app.
let gisPromise = null;
function loadGis() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('GIS failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('GIS failed to load'));
    document.head.appendChild(s);
  });
  return gisPromise;
}

/**
 * Renders Google's official "Sign in with Google" button.
 * Calls onCredential(idToken) when the user picks an account.
 */
export default function GoogleSignInButton({ onCredential, onError, text = 'continue_with' }) {
  const holderRef = useRef(null);
  const cbRef = useRef(onCredential);
  cbRef.current = onCredential;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) {
      setFailed(true);
      return undefined;
    }

    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !holderRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => {
            if (resp?.credential) cbRef.current?.(resp.credential);
            else onError?.('No credential returned from Google.');
          },
        });

        const width = Math.min(
          Math.max(holderRef.current.offsetWidth || 320, 200),
          400
        );
        holderRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(holderRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text, // 'continue_with' | 'signin_with' | 'signup_with'
          shape: 'pill',
          logo_alignment: 'center',
          width,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [text, onError]);

  if (!CLIENT_ID) {
    return (
      <p className="text-center text-xs text-ink/45">
        Set <code className="code">VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
      </p>
    );
  }

  if (failed) {
    return (
      <p className="text-center text-xs text-ink/45">
        Couldn’t load Google sign-in. Check your connection and try again.
      </p>
    );
  }

  // GIS injects its own button here; center it within the card.
  return <div ref={holderRef} className="flex justify-center" />;
}
