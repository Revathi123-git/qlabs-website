
import { ArrowRight, Clock3, FlaskConical, Droplets } from 'lucide-react';
import { useBooking } from '@/context/booking-context';
import type { LabTest } from '@/types';

export function TestCard({ test }: { test: LabTest }) {
  const { openBooking } = useBooking();

  return (
    <article className="group card flex flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-teal-200 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal-50 text-brand-teal-500 transition group-hover:bg-brand-teal-500 group-hover:text-white">
          <FlaskConical size={20} />
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal-50 px-3 py-1.5 text-[11px] font-semibold text-brand-teal-700">
          <FlaskConical size={13} />
          {test.category}
        </span>
      </div>

      <h3 className="mt-5 text-base font-bold leading-snug text-ink">
        {test.name}
      </h3>

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
