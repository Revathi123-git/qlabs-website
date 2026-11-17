
import { ArrowRight, Clock3, FlaskConical, Droplets } from 'lucide-react';
import { useBooking } from '@/context/booking-context';
import type { LabTest } from '@/types';

export function TestCard({ test }: { test: LabTest }) {
  const { openBooking } = useBooking();

  return (
    <article className="group card flex flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-teal-200 hover:shadow-lift">

      {/* TEST IMAGE */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-brand-teal-50">
        {test.imagePath ? (
          <img
            src={test.imagePath}
            alt={test.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-teal-500">
            <FlaskConical size={42} />
          </div>
        )}

        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-brand-teal-700 shadow-sm">
          <FlaskConical size={13} />
          {test.category}
        </span>
      </div>

      {/* TEST NAME */}
      <h3 className="mt-5 text-base font-bold leading-snug text-ink">
        {test.name}
      </h3>

      {/* SHORT DESCRIPTION */}
      {test.shortDescription?.trim() && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {test.shortDescription}
        </p>
      )}

      {/* TEST DETAILS */}
      <dl className="mt-4 space-y-3 text-xs text-muted">

        <div className="flex items-center gap-2">
          <Droplets size={14} className="shrink-0 text-brand-teal-500" />
          <dt className="font-semibold text-ink">Sample:</dt>
          <dd>{test.sampleType || 'To be confirmed'}</dd>
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={14} className="shrink-0 text-brand-teal-500" />
          <dt className="sr-only">Turnaround</dt>
          <dd>Report in {test.turnaround.toLowerCase()}</dd>
        </div>

      </dl>

      {/* PRICE AND BOOKING */}
      <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
        <p className="text-2xl font-bold text-brand-blue-700">
          ₹{test.price.toLocaleString('en-IN')}
        </p>

        <button
          onClick={() => openBooking(test.id)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal-50 px-4 py-2 text-sm font-semibold text-brand-teal-700 transition hover:bg-brand-teal-500 hover:text-white"
        >
          Book
          <ArrowRight size={15} />
        </button>
      </div>

    </article>
  );
}
