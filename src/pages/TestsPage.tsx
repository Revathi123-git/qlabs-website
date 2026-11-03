import { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TestCard } from '@/components/tests/TestCard';
import { IMAGES, LAB_TESTS, TEST_CATEGORIES } from '@/data/mock-data';

export function TestsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof TEST_CATEGORIES)[number]>('All');

  const filteredTests = useMemo(
    () =>
      LAB_TESTS.filter(
        (test) =>
          (category === 'All' || test.category === category) &&
          test.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, category],
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
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by test name"
              aria-label="Search tests"
              className="input !border-transparent !bg-canvas !pl-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
            {TEST_CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                  category === item ? 'bg-brand-blue-700 text-white shadow-md shadow-brand-blue-700/20' : 'bg-canvas text-muted hover:text-brand-teal-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredTests.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <div className="card mt-8 flex flex-col items-center py-20 text-center">
            <SearchX size={36} className="text-brand-teal-400" />
            <p className="mt-4 font-bold text-ink">No tests match your search</p>
            <p className="mt-1 text-sm text-muted">Try a different name or choose another category.</p>
          </div>
        )}
      </section>
    </main>
  );
}
