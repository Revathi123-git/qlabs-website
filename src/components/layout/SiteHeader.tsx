import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Menu, Phone, X } from 'lucide-react';
import { useBooking } from '@/context/booking-context';
import { SITE_CONTACT } from '@/data/mock-data';
import { toTelHref } from '@/lib/phone';

const NAV_ITEMS = [
  { label: 'Tests', to: '/tests' },
  { label: 'Packages', to: '/packages' },
  { label: 'About', to: '/about' },
  { label: 'Locations', to: '/locations' },
  { label: 'Reports', to: '/reports' },
  { label: 'Contact', to: '/contact' },
];

export function SiteHeader() {
  const { openBooking } = useBooking();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-5 py-3 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Q Labs Diagnostics home">
          <img src="/logo.webp" alt="Q Labs Diagnostics" className="h-11 w-auto object-contain" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-teal-50 text-brand-teal-600' : 'text-muted hover:text-brand-blue-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a href={toTelHref(SITE_CONTACT.phones[0])} className="hidden items-center gap-2 text-sm font-semibold text-ink transition hover:text-brand-teal-600 xl:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal-50 text-brand-teal-500">
              <Phone size={15} />
            </span>
            {SITE_CONTACT.phones[0]}
          </a>
          <button onClick={() => openBooking()} className="btn-primary !px-5 !py-3">
            Book a test
            <ArrowRight size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-xl p-2 text-brand-blue-700 hover:bg-brand-blue-50 lg:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-line bg-white px-5 pb-6 pt-3 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive ? 'bg-brand-teal-50 text-brand-teal-600' : 'text-ink hover:bg-canvas'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              openBooking();
            }}
            className="btn-primary mt-4 w-full"
          >
            Book a test
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </header>
  );
}
