import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" aria-label="Q Labs home">
            <img src="/logo.webp" alt="Q Labs Diagnostics" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-brand-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-teal-700">Admin</span>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand-teal-600">
              <ArrowLeft size={15} />
              Back to website
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
