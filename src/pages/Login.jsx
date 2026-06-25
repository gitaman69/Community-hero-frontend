import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';
import AuthShell from './AuthShell.jsx';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not sign in. Check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async (credential) => {
    setError(null);
    setBusy(true);
    try {
      await loginWithGoogle(credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Google sign-in failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Pick up where your neighborhood left off.">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="block text-sm font-medium text-ink">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={onChange}
            className="field mt-1"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={onChange}
            className="field mt-1"
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p role="alert" className="rounded-md bg-signal/10 px-3 py-2 text-sm text-signal">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="btn-civic mt-1 disabled:opacity-60">
          {busy ? <Spinner size={16} label="Signing in…" /> : 'Sign in'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-ink/35">
        <span className="h-px flex-1 bg-haze" />
        or
        <span className="h-px flex-1 bg-haze" />
      </div>

      <GoogleSignInButton text="signin_with" onCredential={onGoogle} onError={setError} />

      <p className="mt-4 text-sm text-ink/60">
        New here?{' '}
        <Link to="/register" state={location.state} className="font-medium text-civic underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
