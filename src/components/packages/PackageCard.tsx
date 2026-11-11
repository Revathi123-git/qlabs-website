
import { ArrowRight, Check } from 'lucide-react';
import { useBooking } from '@/context/booking-context';
import type { HealthPackage } from '@/types';

export function PackageCard({ pkg }: { pkg: HealthPackage }) {
  const { openBooking } = useBooking();

  return (
    <article className="card relative flex flex-col rounded-3xl p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-teal-200 hover:shadow-lift">

      <h3 className="text-xl font-bold text-brand-blue-700">
        {pkg.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted">
        {pkg.description}
      </p>

      <div className="mt-4">
        <span className="inline-flex rounded-full bg-brand-teal-50 px-3 py-1 text-xs font-semibold text-brand-teal-700">
          {pkg.testCount} tests included
        </span>
      </div>

      <ul className="mt-6 space-y-3">
        {pkg.highlights.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex items-start gap-2.5 text-sm text-ink"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal-50 text-brand-teal-600">
              <Check size={12} strokeWidth={3} />
            </span>

            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-brand-blue-700">
            ₹{pkg.price.toLocaleString('en-IN')}
          </span>
        </div>

        <p className="mt-1 text-xs font-semibold text-brand-green-600">
          {pkg.testCount} diagnostic tests in this package
        </p>

        <button
          onClick={() => openBooking(pkg.id)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue-700 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-blue-800"
        >
          Book package
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
