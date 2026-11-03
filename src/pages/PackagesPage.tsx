import { Check } from 'lucide-react';
import { PackageCard } from '@/components/packages/PackageCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { HEALTH_PACKAGES } from '@/data/mock-data';

export function PackagesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Health packages"
        title="Thoughtful care, bundled for you."
        description="Our most-booked panels bring the right tests together at better value, with home collection included."
      />
      <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {HEALTH_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-line bg-white px-6 py-5 text-sm font-semibold text-ink">
          {['Sample collection at home', 'Reports in 24 to 48 hours', 'Doctor-reviewed reference ranges'].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <Check size={16} className="text-brand-green-500" />
              {item}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
