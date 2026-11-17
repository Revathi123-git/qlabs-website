
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { PackageCard } from '@/components/packages/PackageCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/lib/supabase';
import type { HealthPackage } from '@/types';

interface PackageRow {
  id: string;
  package_name: string;
  description: string | null;
  price: number;
  display_order: number;
  image_path: string | null;
}

interface PackageItemRow {
  package_id: string;
  test_id: string | null;
  display_name: string;
  display_order: number;
}

interface TestRow {
  id: string;
  name: string;
}

function getPackageImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;

  // Support an already complete image URL.
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  // Resolve a Supabase Storage path.
  const { data } = supabase.storage
    .from('catalogue-images')
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

export function PackagesPage() {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPackages() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch active packages.
        const { data: packageData, error: packageError } = await supabase
          .from('test_packages')
          .select(
            'id, package_name, description, price, display_order, image_path',
          )
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (packageError) throw packageError;

        if (cancelled) return;

        const packageRows = (packageData ?? []) as PackageRow[];

        // No active packages.
        if (packageRows.length === 0) {
          setPackages([]);
          setIsLoading(false);
          return;
        }

        const packageIds = packageRows.map((pkg) => pkg.id);

        // 2. Fetch contents belonging to these packages.
        const { data: itemData, error: itemError } = await supabase
          .from('package_items')
          .select('package_id, test_id, display_name, display_order')
          .in('package_id', packageIds)
          .order('display_order', { ascending: true });

        if (itemError) throw itemError;

        if (cancelled) return;

        const packageItems = (itemData ?? []) as PackageItemRow[];

        // 3. Fetch linked individual test information.
        // Grouped/custom items have test_id = null and need no test lookup.
        const testIds = [
          ...new Set(
            packageItems
              .map((item) => item.test_id)
              .filter((id): id is string => Boolean(id)),
          ),
        ];

        let testRows: TestRow[] = [];

        if (testIds.length > 0) {
          const { data: testData, error: testError } = await supabase
            .from('tests')
            .select('id, name')
            .in('id', testIds);

          if (testError) throw testError;

          testRows = (testData ?? []) as TestRow[];
        }

        if (cancelled) return;

        // 4. Create a lookup for linked tests.
        const testsById = new Map(
          testRows.map((test) => [test.id, test]),
        );

        // 5. Group package contents by package ID.
        const itemsByPackage = new Map<string, string[]>();

        for (const item of packageItems) {
          let displayName: string;

          if (item.test_id) {
            // Individual test: use the linked test's actual name.
            const linkedTest = testsById.get(item.test_id);

            displayName = linkedTest?.name || item.display_name;
          } else {
            // Grouped/custom entry: use display_name directly.
            displayName = item.display_name;
          }

          const existingItems =
            itemsByPackage.get(item.package_id) ?? [];

          existingItems.push(displayName);
          itemsByPackage.set(item.package_id, existingItems);
        }

        // 6. Convert database records into the existing HealthPackage type.
        const mappedPackages: HealthPackage[] = packageRows.map((pkg) => {
          const highlights = itemsByPackage.get(pkg.id) ?? [];

          return {
            id: pkg.id,
            title: pkg.package_name,
            description:
              pkg.description ?? 'A curated group of diagnostic tests.',
            testCount: highlights.length,
            price: Number(pkg.price),
            highlights,
            imagePath: getPackageImageUrl(pkg.image_path),
          };
        });

        if (cancelled) return;

        setPackages(mappedPackages);
      } catch (err) {
        console.error('Supabase packages loading error:', err);

        if (!cancelled) {
          setError(
            'We could not load health packages. Please try again shortly.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
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
          <div
            className="py-20 text-center text-sm text-muted"
            role="status"
          >
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
          /* Active Supabase packages */
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
