
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  SearchX,
  Grid2X2,
  Droplets,
  RefreshCw,
  ShieldCheck,
  Apple,
  Pill,
  HeartPulse,
  Activity,
  Dna,
  FlaskConical,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { TestCard } from '@/components/tests/TestCard';
import { IMAGES } from '@/data/mock-data';
import { supabase } from '@/lib/supabase';
import type { LabTest } from '@/types';

export function TestsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [tests, setTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icons for each test category
  const categoryIcons: Record<string, typeof Grid2X2> = {
    All: Grid2X2,
    Blood: Droplets,
    Recovery: RefreshCw,
    Inflammation: ShieldCheck,
    Nutrition: Apple,
    'Additional Info & Vitamins': Pill,
    Heart: HeartPulse,
    Thyroid: Activity,
    Hormone: Dna,
    Gut: Activity,
    'Liver & Hepatic Tests': FlaskConical,
  };

  useEffect(() => {
    let cancelled = false;

    async function loadTests() {
      setIsLoading(true);
      setError(null);

      const [testsResult, categoriesResult, linksResult] = await Promise.all([
        supabase
          .from('tests')
          .select('id, name, selling_price, report_turnaround_hours, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),

        supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),

        supabase
          .from('test_categories')
          .select('test_id, category_id'),
      ]);

      if (cancelled) return;

      if (testsResult.error || categoriesResult.error || linksResult.error) {
        console.error('Supabase catalogue error:', {
          tests: testsResult.error,
          categories: categoriesResult.error,
          links: linksResult.error,
        });

        setError(
          'We could not load the test catalogue. Please try again shortly.',
        );
        setIsLoading(false);
        return;
      }

      const categoryNames = new Map<string, string>();

      for (const item of categoriesResult.data ?? []) {
        categoryNames.set(item.id, item.name);
      }

      const linksByTest = new Map<string, string[]>();

      for (const link of linksResult.data ?? []) {
        const name = categoryNames.get(link.category_id);

        if (!name) continue;

        const existing = linksByTest.get(link.test_id) ?? [];

        if (!existing.includes(name)) {
          existing.push(name);
        }

        linksByTest.set(link.test_id, existing);
      }

      const mappedTests: LabTest[] = (testsResult.data ?? []).map((test) => {
        const linkedCategories = linksByTest.get(test.id) ?? [];

        return {
          id: test.id,
          name: test.name,
          category: linkedCategories[0] ?? 'Other',
          categories: linkedCategories,
          price: Number(test.selling_price),
          prep: 'Preparation details available on enquiry',
          turnaround:
            test.report_turnaround_hours == null
              ? 'To be confirmed'
              : `${test.report_turnaround_hours} hours`,
        };
      });

      setTests(mappedTests);
      setIsLoading(false);
    }

    loadTests();

    return () => {
      cancelled = true;
    };
  }, []);

  // Build filter categories from Supabase data
  const testCategories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(tests.flatMap((test) => test.categories ?? [test.category])),
      ),
    ],
    [tests],
  );

  // Search and category filtering
  const filteredTests = useMemo(
    () =>
      tests.filter(
        (test) =>
          (category === 'All' ||
            (test.categories ?? [test.category]).includes(category)) &&
          test.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [tests, query, category],
  );

  return (
    <main>
      <PageHeader
        eyebrow="Test catalogue"
        title="Clear answers, transparent prices."
        description="Search individual tests with preparation guidance and turnaround times before you book."
        backgroundImage={IMAGES.testTubes}
      />

      <section className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
        <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by test name"
              aria-label="Search tests"
              className="input !border-transparent !bg-canvas !pl-11"
            />
          </div>

          {/* Category filter buttons with icons */}
          
{/* Category filter tiles with large icons */}
<div
  className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
  role="group"
  aria-label="Filter by category"
>
  {testCategories.map((item) => {
    const CategoryIcon = categoryIcons[item] ?? FlaskConical;
    const isSelected = category === item;

    return (
      <button
        key={item}
        onClick={() => setCategory(item)}
        aria-pressed={isSelected}
        className={`flex min-h-[115px] flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition duration-200 hover:-translate-y-1 hover:shadow-md ${
          isSelected
            ? 'border-brand-blue-700 bg-brand-blue-700 text-white shadow-md'
            : 'border-line bg-white text-brand-blue-700 hover:border-brand-teal-400 hover:bg-brand-teal-50'
        }`}
      >
        <CategoryIcon
          size={32}
          strokeWidth={1.8}
        />

        <span className="text-xs font-semibold leading-snug sm:text-sm">
          {item}
        </span>
      </button>
    );
  })}
</div>

        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted" role="status">
            Loading diagnostic tests...
          </div>
        ) : error ? (
          /* Error state */
          <div
            className="card mt-8 py-16 text-center text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        ) : filteredTests.length > 0 ? (
          /* Test cards */
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          /* Empty search state */
          <div className="card mt-8 flex flex-col items-center py-20 text-center">
            <SearchX size={36} className="text-brand-teal-400" />

            <p className="mt-4 font-bold text-ink">
              No tests match your search
            </p>

            <p className="mt-1 text-sm text-muted">
              Try a different name or choose another category.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
