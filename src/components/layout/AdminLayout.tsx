
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Outlet } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Restore the existing login session and listen for login/logout changes.
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setError(error.message);
      }

      setSession(data.session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setCheckingSession(false);
      setError('');
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Verify that the signed-in user is registered in admin_users.
  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      if (!session) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);

      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setIsAdmin(false);
        setError(`Unable to verify administrator access: ${error.message}`);
      } else {
        setIsAdmin(Boolean(data));
      }

      setCheckingAdmin(false);
    }

    verifyAdmin();

    return () => {
      active = false;
    };
  }, [session]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  async function handleLogout() {
    setError('');

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
    }
  }

  if (checkingSession || (session && checkingAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFB]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#079C83]" />
          <p className="mt-4 text-sm text-[#64748B]">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  // Login screen for users who are not signed in.
  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6FAFB] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm sm:p-9">
          <Link
            to="/"
            className="text-sm font-medium text-[#079C83] hover:underline"
          >
            ← Back to website
          </Link>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#079C83]">
              Q Labs Diagnostics
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[#064568]">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              Sign in with your authorized administrator account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-[#17324D]"
              >
                Email address
              </label>

              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none transition focus:border-[#079C83] focus:ring-2 focus:ring-[#079C83]/15"
                placeholder="Enter admin email"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-[#17324D]"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none transition focus:border-[#079C83] focus:ring-2 focus:ring-[#079C83]/15"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#064568] px-4 py-3 font-semibold text-white transition hover:bg-[#079C83] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in to Admin'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#64748B]">
            Authorized Q Labs administrators only.
          </p>
        </div>
      </main>
    );
  }

  // A signed-in user who is not in admin_users must not see the dashboard.
  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6FAFB] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#064568]">
            Administrator access required
          </h1>

          <p className="mt-3 text-sm text-[#64748B]">
            This account is signed in, but it is not authorized to access the
            Q Labs administration dashboard.
          </p>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-lg bg-[#064568] px-5 py-3 text-sm font-semibold text-white hover:bg-[#079C83]"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  // Protected admin layout.
  return (
    <div className="min-h-screen bg-[#F6FAFB]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link to="/admin" className="text-xl font-bold text-[#064568]">
              Q Labs <span className="text-[#079C83]">Admin</span>
            </Link>
            <p className="mt-1 text-xs text-[#64748B]">
              Diagnostics website management
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="max-w-[220px] truncate text-sm text-[#64748B]">
              {session.user.email}
            </span>
            <Link
  to="/admin/tests"
  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#17324D] hover:border-[#079C83] hover:text-[#079C83]"
>
  Manage Tests
</Link>

<Link
  to="/admin/packages"
  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#17324D] hover:border-[#079C83] hover:text-[#079C83]"
>
  Manage Packages
</Link>

            <Link
              to="/"
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#17324D] hover:border-[#079C83]"
            >
              View website
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-[#064568] px-3 py-2 text-sm font-medium text-white hover:bg-[#079C83]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
