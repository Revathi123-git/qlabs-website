
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { PackageCard } from '@/components/packages/PackageCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/lib/supabase';
import type { HealthPackage } from '@/types';

export function PackagesPage() {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPackages() {
      setIsLoading(true);
      setError(null);

      const [packagesResult, itemsResult] = await Promise.all([
        supabase
          .from('test_packages')
          .select(
            'id, package_name, description, price, tests_included, display_order',
          )
          .eq('is_active', true)
          .order('display_order', { ascending: true }),

        supabase
          .from('package_items')
          .select('package_id, display_name, display_order')
          .order('display_order', { ascending: true }),
      ]);

      if (cancelled) return;

      if (packagesResult.error || itemsResult.error) {
        console.error('Supabase packages error:', {
          packages: packagesResult.error,
          items: itemsResult.error,
        });

        setError(
          'We could not load health packages. Please try again shortly.',
        );
        setIsLoading(false);
        return;
      }

      // Group package items by package ID
      const itemsByPackage = new Map<string, string[]>();

      for (const item of itemsResult.data ?? []) {
        const existing = itemsByPackage.get(item.package_id) ?? [];

        existing.push(item.display_name);

        itemsByPackage.set(item.package_id, existing);
      }

      // Convert Supabase records into the existing HealthPackage format
      const mappedPackages: HealthPackage[] = (
        packagesResult.data ?? []
      ).map((pkg) => {
        const highlights =
          itemsByPackage.get(pkg.id) ??
          pkg.tests_included ??
          [];

        return {
          id: pkg.id,
          title: pkg.package_name,
          description:
            pkg.description ?? 'A curated group of diagnostic tests.',
          testCount: highlights.length,
          price: Number(pkg.price),
          highlights,
        };
      });

      setPackages(mappedPackages);
      setIsLoading(false);
    }

    loadPackages();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <PageHeader
        eyebrow="Health packages"
        title="Thoughtful care, bundled for you."
        description="Our most-booked panels bring the right tests together at better value, with home collection included."
      />

      <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted" role="status">
            Loading health packages...
          </div>
        ) : error ? (
          /* Error state */
          <div
            className="card py-16 text-center text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        ) : packages.length > 0 ? (
          /* Supabase packages */
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="card py-16 text-center">
            <p className="font-bold text-ink">
              No health packages available
            </p>
            <p className="mt-2 text-sm text-muted">
              Please check back soon for our diagnostic packages.
            </p>
          </div>
        )}

        {/* Service benefits */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-line bg-white px-6 py-5 text-sm font-semibold text-ink">
          {[
            'Sample collection at home',
            'Reports in 24 to 48 hours',
            'Doctor-reviewed reference ranges',
          ].map((item) => (
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
