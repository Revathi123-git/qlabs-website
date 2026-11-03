import { ArrowUpRight, Clock3, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BRANCHES, SITE_CONTACT } from '@/data/mock-data';
import { toTelHref } from '@/lib/phone';

const MAP_PINS = [{ label: 'Q Labs Shaikpet', top: '48%', left: '50%' }];

export function LocationsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Find us"
        title="Care, close to home."
        description="Visit our Q Labs centre in Shaikpet or book home collection across Hyderabad. Our team is here seven days a week."
      />

      <section className="mx-auto grid max-w-[1240px] gap-8 px-5 py-14 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
        <div className="relative min-h-[460px] overflow-hidden rounded-3xl border border-brand-teal-100 bg-gradient-to-br from-brand-teal-50 via-white to-brand-blue-50" role="img" aria-label="Map showing the Q Labs centre in Shaikpet, Hyderabad">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(to right, #D5E8EF 1px, transparent 1px), linear-gradient(to bottom, #D5E8EF 1px, transparent 1px)', backgroundSize: '48px 48px' }} aria-hidden="true" />
          {MAP_PINS.map((pin) => (
            <div key={pin.label} className="absolute -translate-x-1/2 -translate-y-full" style={{ top: pin.top, left: pin.left }}>
              <div className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-blue-700 shadow-card">
                <MapPin size={14} className="text-brand-teal-500" />
                {pin.label}
              </div>
              <div className="mx-auto h-3 w-3 rounded-full border-2 border-white bg-brand-teal-500 shadow-md" />
            </div>
          ))}
          <p className="absolute bottom-5 left-5 rounded-xl bg-white/90 px-4 py-2.5 text-xs font-semibold text-muted backdrop-blur">
            Interactive map coming soon
          </p>
        </div>

        <div className="space-y-4">
          {BRANCHES.map((branch, index) => (
            <article key={branch.name} className={`card p-6 ${index === 0 ? 'border-brand-teal-200 ring-4 ring-brand-teal-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-ink">{branch.name}</h2>
                  <p className="mt-1.5 flex items-start gap-2 text-sm text-muted">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-brand-teal-500" />
                    {branch.address}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <Clock3 size={15} className="shrink-0 text-brand-teal-500" />
                    {branch.hours}
                  </p>
                </div>
                <ArrowUpRight size={18} className="shrink-0 text-slate-300" aria-hidden="true" />
              </div>
            </article>
          ))}

          <div className="rounded-2xl bg-brand-blue-700 p-6 text-white">
            <p className="font-bold">Prefer home collection?</p>
            <p className="mt-1.5 text-sm leading-6 text-brand-blue-100">Our phlebotomists visit anywhere in Hyderabad. Call us to check availability.</p>
            <a href={toTelHref(SITE_CONTACT.phones[0])} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-blue-700 transition hover:bg-brand-teal-50">
              <Phone size={15} />
              {SITE_CONTACT.phones[0]}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
