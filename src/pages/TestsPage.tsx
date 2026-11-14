
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  SearchX,
  Grid2X2,
  Thermometer,
  ShieldCheck,
  Apple,
  HeartPulse,
  Activity,
  Dna,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { TestCard } from '@/components/tests/TestCard';
import { IMAGES } from '@/data/mock-data';
import { supabase } from '@/lib/supabase';
import type { LabTest } from '@/types';

type Category = {
  id: string;
  name: string;
};

const TESTS_PER_PAGE = 9;

export function TestsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  const [tests, setTests] = useState<LabTest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryIcons: Record<string, typeof Grid2X2> = {
    All: Grid2X2,
    Fever: Thermometer,
    Inflammation: ShieldCheck,
    Nutrition: Apple,
    Heart: HeartPulse,
    Thyroid: Activity,
    Hormone: Dna,
    'Liver & Hepatic Tests': FlaskConical,
  };

  // Load tests and categories from Supabase.
  useEffect(() => {
    let cancelled = false;

    async function loadTests() {
      setIsLoading(true);
      setError(null);

      const [testsResult, categoriesResult, linksResult] =
        await Promise.all([
          supabase
            .from('tests')
            .select(
              'id, name, selling_price, report_turnaround_hours, sample_type, display_order',
            )
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

      if (
        testsResult.error ||
        categoriesResult.error ||
        linksResult.error
      ) {
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

      const loadedCategories = categoriesResult.data ?? [];
      setCategories(loadedCategories);

      const categoryNames = new Map<string, string>();

      for (const item of loadedCategories) {
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

      const mappedTests: LabTest[] = (
        testsResult.data ?? []
      ).map((test) => {
        const linkedCategories =
          linksByTest.get(test.id) ?? [];

        return {
          id: test.id,
          name: test.name,
          category: linkedCategories[0] ?? 'Other',
          categories: linkedCategories,
          price: Number(test.selling_price),
          prep: 'Preparation details available on enquiry',
          sampleType: test.sample_type,

          turnaround:
            test.report_turnaround_hours == null
              ? 'To be confirmed'
              : test.report_turnaround_hours === 0
                ? 'Same day'
                : test.report_turnaround_hours < 24
                  ? `${test.report_turnaround_hours} hours`
                  : `${test.report_turnaround_hours / 24} ${
                      test.report_turnaround_hours === 24
                        ? 'day'
                        : 'days'
                    }`,
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

  // Available categories.
  const testCategories = useMemo(
    () => ['All', ...categories.map((item) => item.name)],
    [categories],
  );

  // Count active tests in each category.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: tests.length,
    };

    for (const item of categories) {
      counts[item.name] = 0;
    }

    for (const test of tests) {
      for (const categoryName of test.categories ?? []) {
        counts[categoryName] =
          (counts[categoryName] ?? 0) + 1;
      }
    }

    return counts;
  }, [tests, categories]);

  // Filter by category and search text.
  const filteredTests = useMemo(
    () =>
      tests.filter(
        (test) =>
          (category === 'All' ||
            (test.categories ?? [test.category]).includes(category)) &&
          test.name
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [tests, query, category],
  );

  // Reset carousel when search or category changes.
  useEffect(() => {
    setCurrentPage(0);
  }, [query, category]);

  // Calculate carousel pages.
  const totalPages = Math.ceil(
    filteredTests.length / TESTS_PER_PAGE,
  );

  const startIndex = currentPage * TESTS_PER_PAGE;

  const visibleTests = filteredTests.slice(
    startIndex,
    startIndex + TESTS_PER_PAGE,
  );

  // Carousel navigation.
  const goToPrevious = () => {
    setCurrentPage((page) => Math.max(0, page - 1));
  };

  const goToNext = () => {
    setCurrentPage((page) =>
      Math.min(totalPages - 1, page + 1),
    );
  };

  return (
    <main>
      <PageHeader
        eyebrow="Test catalogue"
        title="Clear answers, transparent prices."
        description="Search individual tests with preparation guidance and turnaround times before you book."
        backgroundImage={IMAGES.testTubes}
      />

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">

        {isLoading ? (
          <div
            className="py-20 text-center text-sm text-muted"
            role="status"
          >
            Loading diagnostic tests...
          </div>
        ) : error ? (
          <div
            className="card py-16 text-center text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[235px_minmax(0,1fr)]">

            {/* CATEGORY SIDEBAR */}
            <aside className="card p-3 lg:sticky lg:top-24">
              <h2 className="px-3 py-3 text-sm font-bold text-brand-blue-700">
                Test Categories
              </h2>

              <nav
                className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible"
                aria-label="Test categories"
              >
                {testCategories.map((item) => {
                  const CategoryIcon =
                    categoryIcons[item] ?? FlaskConical;

                  const isSelected = category === item;
                  const count = categoryCounts[item] ?? 0;

                  return (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      aria-pressed={isSelected}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition lg:w-full ${
                        isSelected
                          ? 'bg-brand-blue-700 text-white shadow-sm'
                          : 'text-ink hover:bg-brand-teal-50 hover:text-brand-blue-700'
                      }`}
                    >
                      <CategoryIcon
                        size={19}
                        className="shrink-0"
                      />

                      <span className="min-w-0 flex-1 text-sm font-semibold">
                        {item}
                      </span>

                      <span
                        className={`min-w-8 rounded-full px-2 py-1 text-center text-xs font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN TEST AREA */}
            <div className="min-w-0">

              {/* SEARCH BAR */}
              <div className="card mb-6 p-4 sm:p-5">
                <div className="relative">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    type="search"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Search diagnostic tests..."
                    aria-label="Search diagnostic tests"
                    className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-100"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-brand-blue-700">
                      {category === 'All'
                        ? 'All Diagnostic Tests'
                        : category}
                    </h2>

                    <p className="mt-1 text-xs text-muted">
                      Browse our available diagnostic tests
                    </p>
                  </div>

                  <span className="rounded-full bg-brand-teal-50 px-4 py-2 text-sm font-bold text-brand-teal-700">
                    {filteredTests.length} tests
                  </span>
                </div>
              </div>

              {/* TEST CAROUSEL */}
              {filteredTests.length > 0 ? (
                <div>

                  {/* 3 COLUMN × 3 ROW GRID */}
                  <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    aria-live="polite"
                  >
                    {visibleTests.map((test) => (
                      <TestCard
                        key={test.id}
                        test={test}
                      />
                    ))}
                  </div>

                  {/* CAROUSEL NAVIGATION */}
                  {totalPages > 1 && (
                    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">

                      <p className="text-sm text-muted">
                        Showing{' '}
                        <span className="font-bold text-ink">
                          {startIndex + 1}–
                          {Math.min(
                            startIndex + TESTS_PER_PAGE,
                            filteredTests.length,
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-bold text-ink">
                          {filteredTests.length}
                        </span>{' '}
                        tests
                      </p>

                      <div className="flex items-center gap-3">

                        <button
                          onClick={goToPrevious}
                          disabled={currentPage === 0}
                          aria-label="Previous 9 tests"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-brand-blue-700 transition hover:border-brand-teal-500 hover:bg-brand-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <span className="min-w-[65px] text-center text-sm font-bold text-brand-blue-700">
                          {currentPage + 1} / {totalPages}
                        </span>

                        <button
                          onClick={goToNext}
                          disabled={currentPage >= totalPages - 1}
                          aria-label="Next 9 tests"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-brand-blue-700 transition hover:border-brand-teal-500 hover:bg-brand-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight size={20} />
                        </button>

                      </div>
                    </div>
                  )}

                  {/* SINGLE PAGE INFORMATION */}
                  {totalPages <= 1 && (
                    <p className="mt-5 text-center text-xs text-muted">
                      Showing all {filteredTests.length} available tests
                    </p>
                  )}

                </div>
              ) : (
                /* EMPTY SEARCH RESULTS */
                <div className="card flex flex-col items-center py-20 text-center">
                  <SearchX
                    size={36}
                    className="text-brand-teal-400"
                  />

                  <p className="mt-4 font-bold text-ink">
                    No tests match your search
                  </p>

                  <p className="mt-1 text-sm text-muted">
                    Try another search or select a different category.
                  </p>

                  <button
                    onClick={() => {
                      setQuery('');
                      setCategory('All');
                    }}
                    className="mt-5 rounded-full bg-brand-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-800"
                  >
                    View all tests
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}