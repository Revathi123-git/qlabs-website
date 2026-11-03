import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SITE_CONTACT } from '@/data/mock-data';
import { toTelHref } from '@/lib/phone';

const EXPLORE_LINKS = [
  { label: 'Tests and prices', to: '/tests' },
  { label: 'Health packages', to: '/packages' },
  { label: 'About Q Labs', to: '/about' },
];

const SUPPORT_LINKS = [
  { label: 'Download reports', to: '/reports' },
  { label: 'Locations and hours', to: '/locations' },
  { label: 'Contact us', to: '/contact' },
  { label: 'Terms and conditions', to: '/terms' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-8">
        <div>
          <img src="/logo.webp" alt="Q Labs Diagnostics" className="h-12 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted">
            Making diagnostics simpler, more reliable, and closer to home in Hyderabad.
          </p>
        </div>

        <FooterColumn title="Explore" links={EXPLORE_LINKS} />
        <FooterColumn title="Support" links={SUPPORT_LINKS} />

        <div>
          <p className="footer-heading">Get in touch</p>
          <ul className="space-y-4 text-sm text-muted">
            <li className="flex gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-brand-teal-500" />
              <span>{SITE_CONTACT.address}</span>
            </li>
            {SITE_CONTACT.phones.map((phone) => (
              <li key={phone} className="flex gap-3">
                <Phone size={17} className="mt-0.5 shrink-0 text-brand-teal-500" />
                <a href={toTelHref(phone)} className="font-semibold text-ink hover:text-brand-teal-600">{phone}</a>
              </li>
            ))}
            <li className="flex gap-3">
              <Mail size={17} className="mt-0.5 shrink-0 text-brand-teal-500" />
              <a href={`mailto:${SITE_CONTACT.email}`} className="break-all font-semibold text-ink hover:text-brand-teal-600">{SITE_CONTACT.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © 2026 Q Labs Diagnostics, Shaikpet, Hyderabad. Carefully tested for better living.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="footer-heading">{title}</p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-sm text-muted transition hover:text-brand-teal-600">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
