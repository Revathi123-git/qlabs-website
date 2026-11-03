import { ArrowRight, Check } from 'lucide-react';
import { useBooking } from '@/context/booking-context';
import type { HealthPackage } from '@/types';

const FEATURED_PACKAGE_ID = 'full-body';

export function PackageCard({ pkg }: { pkg: HealthPackage }) {
  const { openBooking } = useBooking();
  const isFeatured = pkg.id === FEATURED_PACKAGE_ID;
  const savings = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  return (
    <article className={`relative flex flex-col rounded-3xl p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${isFeatured ? 'bg-brand-blue-700 text-white shadow-lift' : 'card'}`}>
      {isFeatured && (
        <span className="absolute right-6 top-6 rounded-full bg-brand-green-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most booked</span>
      )}
      <h3 className={`text-xl font-bold ${isFeatured ? 'text-white' : 'text-brand-blue-700'}`}>{pkg.title}</h3>
      <p className={`mt-2 text-sm leading-6 ${isFeatured ? 'text-brand-blue-100' : 'text-muted'}`}>{pkg.description}</p>

      <ul className="mt-6 space-y-3">
        {pkg.highlights.map((item) => (
          <li key={item} className={`flex items-start gap-2.5 text-sm ${isFeatured ? 'text-white' : 'text-ink'}`}>
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isFeatured ? 'bg-brand-green-500' : 'bg-brand-teal-50 text-brand-teal-600'}`}>
              <Check size={12} strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <div className="flex items-end gap-3">
          <span className={`text-3xl font-bold ${isFeatured ? 'text-white' : 'text-brand-blue-700'}`}>₹{pkg.price.toLocaleString('en-IN')}</span>
          <span className={`pb-1 text-sm line-through ${isFeatured ? 'text-brand-blue-200' : 'text-slate-400'}`}>₹{pkg.originalPrice.toLocaleString('en-IN')}</span>
        </div>
        <p className={`mt-1 text-xs font-semibold ${isFeatured ? 'text-brand-green-200' : 'text-brand-green-600'}`}>
          Save {savings}% · {pkg.testCount} tests
        </p>
        <button
          onClick={() => openBooking(pkg.id)}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition ${
            isFeatured ? 'bg-white text-brand-blue-700 hover:bg-brand-teal-50' : 'bg-brand-blue-700 text-white hover:bg-brand-blue-800'
          }`}
        >
          Book package
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
