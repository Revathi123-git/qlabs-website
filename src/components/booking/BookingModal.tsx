
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  MapPin,
  Search,
  X,
  CalendarDays,
  Clock,
  Plus,
  Minus,
  FlaskConical,
  Package,
} from 'lucide-react';

import { FormField } from '@/components/ui/FormField';
import { supabase } from '@/lib/supabase';
import type { CollectionMode, PatientDetails } from '@/types';

interface BookableItem {
  id: string;
  name: string;
  detail: string;
  price: number;
  type: 'test' | 'package';
  includedTests?: string[];
}

type ItemFilter = 'all' | 'test' | 'package';

const STEP_TITLES = [
  'What would you like to check?',
  'Choose your collection',
  'Your patient details',
  'Booking confirmed',
];

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getLocalTimeString() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function formatCollectionDate(date: string) {
  if (!date) return '';

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );
}

function formatCollectionTime(time: string) {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);

  const formattedDate = new Date();
  formattedDate.setHours(hours, minutes, 0, 0);

  return formattedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

interface BookingModalProps {
  initialItemId?: string;
  onClose: () => void;
}

export function BookingModal({
  initialItemId,
  onClose,
}: BookingModalProps) {
  const [step, setStep] = useState(0);

  const [query, setQuery] = useState('');

  const [itemFilter, setItemFilter] =
    useState<ItemFilter>('all');

  const [items, setItems] = useState<BookableItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  // Package details popup.
  const [viewingPackage, setViewingPackage] =
    useState<BookableItem | null>(null);

  // Multiple selected tests and packages.
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialItemId ? [initialItemId] : [],
  );

  const [mode, setMode] = useState<CollectionMode>('home');

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  const [patient, setPatient] = useState<PatientDetails>({
    name: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof PatientDetails, string>>
  >({});

  const [reference, setReference] = useState('');

  // Booking submission state.
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = getLocalDateString();
  const currentTime = getLocalTimeString();

  // Fetch active tests and packages.
  useEffect(() => {
    let cancelled = false;

    async function loadBookableItems() {
      setIsLoading(true);
      setLoadError(null);

      const [testsResult, packagesResult, packageItemsResult] =
        await Promise.all([
          supabase
            .from('tests')
            .select(
              'id, name, selling_price, report_turnaround_hours',
            )
            .eq('is_active', true)
            .order('display_order', { ascending: true }),

          supabase
            .from('test_packages')
            .select(
              'id, package_name, price, tests_included, display_order',
            )
            .eq('is_active', true)
            .order('display_order', { ascending: true }),

          supabase
            .from('package_items')
            .select('package_id, display_name, display_order')
            .order('display_order', { ascending: true }),
        ]);

      if (cancelled) return;

      if (
        testsResult.error ||
        packagesResult.error ||
        packageItemsResult.error
      ) {
        console.error('Booking catalogue error:', {
          tests: testsResult.error,
          packages: packagesResult.error,
          packageItems: packageItemsResult.error,
        });

        setLoadError(
          'We could not load tests and packages. Please try again shortly.',
        );

        setIsLoading(false);
        return;
      }

      // Group package items by package ID.
      const itemsByPackage = new Map<string, string[]>();

      for (const item of packageItemsResult.data ?? []) {
        const existing = itemsByPackage.get(item.package_id) ?? [];

        existing.push(item.display_name);

        itemsByPackage.set(item.package_id, existing);
      }

      // Individual tests.
      const bookableTests: BookableItem[] = (
        testsResult.data ?? []
      ).map((test) => ({
        id: test.id,
        name: test.name,
        detail:
          test.report_turnaround_hours == null
            ? 'Individual diagnostic test'
            : test.report_turnaround_hours === 0
              ? 'Same day'
              : test.report_turnaround_hours < 24
                ? `Report in ${test.report_turnaround_hours} hours`
                : `Report in ${test.report_turnaround_hours / 24} days`,
        price: Number(test.selling_price),
        type: 'test',
      }));

      // Packages with their included test names.
      const bookablePackages: BookableItem[] = (
        packagesResult.data ?? []
      ).map((pkg) => {
        const packageItems = itemsByPackage.get(pkg.id);

        const fallbackTests = Array.isArray(pkg.tests_included)
          ? pkg.tests_included.map(String)
          : [];

        const includedTests =
          packageItems && packageItems.length > 0
            ? packageItems
            : fallbackTests;

        return {
          id: pkg.id,
          name: pkg.package_name,
          detail: `${includedTests.length} items included`,
          price: Number(pkg.price),
          type: 'package',
          includedTests,
        };
      });

      if (cancelled) return;

      setItems([...bookableTests, ...bookablePackages]);
      setIsLoading(false);
    }

    loadBookableItems();

    return () => {
      cancelled = true;
    };
  }, []);

  // Selected items.
  const selectedItems = useMemo(
    () =>
      items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  // Calculate selected item total.
  const selectedSubtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.price,
        0,
      ),
    [selectedItems],
  );

  // Collection fee.
  const collectionFee = mode === 'home' ? 100 : 0;

  const total = selectedSubtotal + collectionFee;

  // Search and filter.
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(query.trim().toLowerCase());

        const matchesType =
          itemFilter === 'all' || item.type === itemFilter;

        return matchesSearch && matchesType;
      }),
    [items, query, itemFilter],
  );

  // Add or remove an item.
  const toggleItem = (itemId: string) => {
    setSelectedIds((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId],
    );
  };

  const removeItem = (itemId: string) => {
    setSelectedIds((previous) =>
      previous.filter((id) => id !== itemId),
    );
  };

  // Collection time validation.
  const minimumTime =
    date === today ? currentTime : undefined;

  const isCollectionSelectionValid =
    Boolean(date) &&
    Boolean(slot) &&
    date >= today &&
    (date !== today || slot >= currentTime);

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDate(event.target.value);
    setSlot('');
  };

  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSlot(event.target.value);
  };

  // Patient validation.
  const validate = () => {
    const next: typeof errors = {};

    if (!patient.name.trim()) {
      next.name = 'Please enter the patient name.';
    }

    if (!/^\d{10}$/.test(patient.phone.trim())) {
      next.phone = 'Enter a valid 10 digit mobile number.';
    }

    if (
      patient.email.trim() &&
      !/^\S+@\S+\.\S+$/.test(patient.email.trim())
    ) {
      next.email = 'Enter a valid email address.';
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleCollectionContinue = () => {
    if (!isCollectionSelectionValid) return;

    setStep(2);
  };

  // Save booking to Supabase.
  const confirm = async () => {
    if (isSaving) return;

    setSubmitError(null);

    if (!validate()) return;

    if (selectedItems.length === 0) {
      setSubmitError(
        'Please select at least one test or package.',
      );
      return;
    }

    if (!isCollectionSelectionValid) {
      setSubmitError(
        'Please select a valid collection date and time.',
      );
      return;
    }

    setIsSaving(true);

    try {
      const bookingItems = selectedItems.map((item) => ({
        id: item.id,
        type: item.type,
      }));

      const { data, error } = await supabase.rpc(
        'create_booking',
        {
          p_patient_name: patient.name.trim(),
          p_phone: patient.phone.trim(),
          p_email: patient.email.trim() || null,
          p_collection_mode: mode,
          p_collection_date: date,
          p_collection_time: slot,
          p_items: bookingItems,
        },
      );

      if (error) {
        console.error('Booking save error:', error);

        throw new Error(
          error.message || 'Unable to save booking.',
        );
      }

      const result = data as {
        success?: boolean;
        booking_reference?: string;
      } | null;

      if (!result?.success || !result.booking_reference) {
        throw new Error(
          'Booking could not be confirmed. Please try again.',
        );
      }

      // Show confirmation only after successful database save.
      setReference(result.booking_reference);
      setStep(3);
    } catch (error) {
      console.error('Booking submission failed:', error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canContinue =
    selectedIds.length > 0 &&
    selectedItems.length === selectedIds.length &&
    !isLoading;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-brand-blue-900/60 backdrop-blur-sm sm:items-center sm:p-6"
        role="presentation"
        onMouseDown={(event) =>
          event.target === event.currentTarget && onClose()
        }
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-title"
          className="flex max-h-[92vh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl"
        >
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <p className="eyebrow">
                Book a test · Step {Math.min(step + 1, 3)} of 3
              </p>

              <h2
                id="booking-title"
                className="mt-1.5 text-xl font-bold text-brand-blue-700"
              >
                {STEP_TITLES[step]}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted transition hover:bg-canvas hover:text-ink"
              aria-label="Close booking"
            >
              <X size={20} />
            </button>
          </div>

          {/* PROGRESS */}
          {step < 3 && (
            <div
              className="flex gap-2 px-6 pt-5"
              aria-hidden="true"
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    item <= step
                      ? 'bg-brand-teal-500'
                      : 'bg-line'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6">

            {/* STEP 1: TEST AND PACKAGE SELECTION */}
            {step === 0 && (
              <div className="space-y-5">

                {/* SEARCH */}
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Search tests or packages..."
                    className="input !pl-11"
                    aria-label="Search tests or packages"
                  />
                </div>

                {/* ITEM FILTERS */}
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'all', label: 'All items' },
                      { value: 'test', label: 'Individual tests' },
                      { value: 'package', label: 'Packages' },
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setItemFilter(filter.value)}
                      aria-pressed={itemFilter === filter.value}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        itemFilter === filter.value
                          ? 'bg-brand-blue-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-brand-teal-50 hover:text-brand-blue-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* SELECTED ITEMS */}
                <div className="rounded-2xl border border-brand-teal-200 bg-brand-teal-50/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-brand-blue-700">
                      Selected items ({selectedItems.length})
                    </h3>

                    <span className="text-sm font-bold text-brand-teal-700">
                      ₹{selectedSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {selectedItems.length === 0 ? (
                    <p className="mt-3 text-xs text-muted">
                      No items selected yet. Add tests or packages
                      from the list below.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {selectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {item.type === 'test' ? (
                              <FlaskConical
                                size={16}
                                className="shrink-0 text-brand-teal-600"
                              />
                            ) : (
                              <Package
                                size={16}
                                className="shrink-0 text-brand-teal-600"
                              />
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-ink">
                                {item.name}
                              </p>

                              <p className="text-[10px] text-muted">
                                {item.type === 'test'
                                  ? 'Individual test'
                                  : 'Package'}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-xs font-bold text-brand-blue-700">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>

                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="rounded-full p-1.5 text-danger transition hover:bg-red-50"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AVAILABLE ITEMS */}
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-brand-blue-700">
                      Browse tests and packages
                    </h3>

                    <span className="text-xs text-muted">
                      {filteredItems.length} available
                    </span>
                  </div>

                  {isLoading ? (
                    <div
                      className="py-12 text-center text-sm text-muted"
                      role="status"
                    >
                      Loading tests and packages...
                    </div>
                  ) : loadError ? (
                    <div
                      className="py-10 text-center text-sm text-danger"
                      role="alert"
                    >
                      {loadError}
                    </div>
                  ) : (
                    <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                      {filteredItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);

                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition ${
                              isSelected
                                ? 'border-brand-teal-300 bg-brand-teal-50/50'
                                : 'border-line hover:border-brand-teal-200'
                            }`}
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal-50 text-brand-teal-600">
                                {item.type === 'test' ? (
                                  <FlaskConical size={17} />
                                ) : (
                                  <Package size={17} />
                                )}
                              </span>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">
                                  {item.name}
                                </p>

                                {/* ITEM COUNT + SEE ALL TESTS */}
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-muted">
                                    {item.detail}
                                  </span>

                                  {item.type === 'package' &&
                                    item.includedTests &&
                                    item.includedTests.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setViewingPackage(item)
                                        }
                                        className="text-xs font-semibold text-brand-blue-700 underline underline-offset-2 hover:text-brand-teal-600"
                                      >
                                        See all tests
                                      </button>
                                    )}
                                </div>

                                <span className="mt-1.5 inline-block text-[10px] font-semibold uppercase tracking-wide text-brand-blue-600">
                                  {item.type === 'test'
                                    ? 'Individual test'
                                    : 'Health package'}
                                </span>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="text-sm font-bold text-brand-blue-700">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>

                              <button
                                onClick={() => toggleItem(item.id)}
                                aria-pressed={isSelected}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                                  isSelected
                                    ? 'bg-brand-teal-500 text-white hover:bg-red-500'
                                    : 'bg-brand-blue-700 text-white hover:bg-brand-teal-500'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Minus size={13} />
                                    Remove
                                  </>
                                ) : (
                                  <>
                                    <Plus size={13} />
                                    Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredItems.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted">
                          {items.length === 0
                            ? 'No active tests or packages are available.'
                            : 'No matches. Try another search.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: COLLECTION OPTIONS */}
            {step === 1 && (
              <div className="space-y-6">

                {/* SELECTED ITEMS */}
                <div>
                  <p className="label">Selected items</p>

                  <div className="rounded-2xl border border-line p-4">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 py-2 text-sm"
                      >
                        <span className="text-ink">{item.name}</span>

                        <span className="shrink-0 font-semibold text-brand-blue-700">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}

                    <div className="mt-2 border-t border-line pt-3 text-sm font-bold text-brand-blue-700">
                      <div className="flex justify-between">
                        <span>Items subtotal</span>
                        <span>
                          ₹{selectedSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLLECTION MODE */}
                <div>
                  <p className="label">Collection</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceCard
                      active={mode === 'home'}
                      onClick={() => setMode('home')}
                      icon={<Home size={19} />}
                      title="Home collection"
                      subtitle="₹100 visit fee"
                    />

                    <ChoiceCard
                      active={mode === 'lab'}
                      onClick={() => setMode('lab')}
                      icon={<MapPin size={19} />}
                      title="Visit a lab"
                      subtitle="No extra charge"
                    />
                  </div>
                </div>

                {/* DATE */}
                <div>
                  <p className="label flex items-center gap-2">
                    <CalendarDays size={16} />
                    Choose your collection date
                  </p>

                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={handleDateChange}
                    className="input w-full"
                    aria-label="Choose collection date"
                  />

                  {date && date >= today && (
                    <p className="mt-2 text-sm font-medium text-brand-teal-700">
                      Selected date: {formatCollectionDate(date)}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-muted">
                    You can select today or any future date.
                  </p>
                </div>

                {/* TIME */}
                <div>
                  <p className="label flex items-center gap-2">
                    <Clock size={16} />
                    Choose your preferred collection time
                  </p>

                  <input
                    type="time"
                    value={slot}
                    min={minimumTime}
                    onChange={handleTimeChange}
                    className="input w-full"
                    aria-label="Choose collection time"
                    disabled={!date || date < today}
                  />

                  <p className="mt-1 text-xs text-muted">
                    Select your preferred collection time.
                  </p>

                  {date && slot && (
                    <p className="mt-3 rounded-xl bg-brand-teal-50 p-3 text-sm font-semibold text-brand-teal-700">
                      Preferred collection:
                      {' '}
                      {formatCollectionDate(date)}
                      {' · '}
                      {formatCollectionTime(slot)}
                    </p>
                  )}

                  {date === today && slot && slot < currentTime && (
                    <p className="mt-2 text-sm text-danger" role="alert">
                      This time has already passed. Please select another time.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: PATIENT DETAILS */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-brand-teal-50 p-4">
                  <p className="text-sm font-bold text-brand-blue-700">
                    Selected items ({selectedItems.length})
                  </p>

                  <div className="mt-3 space-y-2">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-ink">{item.name}</span>
                        <span className="shrink-0 font-semibold text-brand-blue-700">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-brand-teal-200 pt-3 text-xs text-muted">
                    {mode === 'home'
                      ? 'Home collection · ₹100 fee'
                      : 'Visit a lab · No collection fee'}

                    <p className="mt-1">
                      {formatCollectionDate(date)}
                      {' · '}
                      {formatCollectionTime(slot)}
                    </p>

                    <p className="mt-2 text-base font-bold text-brand-blue-700">
                      Total: ₹{total.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <FormField
                  id="patient-name"
                  label="Patient full name"
                  error={errors.name}
                >
                  <input
                    id="patient-name"
                    value={patient.name}
                    onChange={(event) =>
                      setPatient({
                        ...patient,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Ananya Rao"
                    className="input"
                    aria-invalid={Boolean(errors.name)}
                  />
                </FormField>

                <FormField
                  id="patient-phone"
                  label="Mobile number"
                  error={errors.phone}
                >
                  <input
                    id="patient-phone"
                    value={patient.phone}
                    onChange={(event) =>
                      setPatient({
                        ...patient,
                        phone: event.target.value,
                      })
                    }
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10 digit mobile number"
                    className="input"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </FormField>

                <FormField
                  id="patient-email"
                  label="Email (optional)"
                  error={errors.email}
                >
                  <input
                    id="patient-email"
                    value={patient.email}
                    onChange={(event) =>
                      setPatient({
                        ...patient,
                        email: event.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    className="input"
                    aria-invalid={Boolean(errors.email)}
                  />
                </FormField>

                {/* BOOKING SUBMISSION ERROR */}
                {submitError && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    role="alert"
                  >
                    {submitError}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 3 && (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600">
                  <Check size={30} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-brand-blue-700">
                  Thank you, {patient.name.split(' ')[0]}.
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                  Your booking has been saved successfully.
                  Your preferred collection is on{' '}
                  {formatCollectionDate(date)}
                  {' '}at {formatCollectionTime(slot)}.
                </p>

                <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line p-4 text-left">
                  <p className="text-xs font-bold text-brand-blue-700">
                    Selected tests and packages
                  </p>

                  <div className="mt-3 space-y-2">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-ink">{item.name}</span>

                        <span className="shrink-0 font-semibold">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-line pt-3">
                    <div className="flex justify-between text-sm">
                      <span>Collection fee</span>
                      <span>₹{collectionFee}</span>
                    </div>

                    <div className="mt-2 flex justify-between font-bold text-brand-blue-700">
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-line p-4">
                  <p className="text-xs font-semibold text-muted">
                    Booking reference
                  </p>

                  <p className="mt-1 text-lg font-bold tracking-wider text-brand-blue-700">
                    {reference}
                  </p>
                </div>

                <p className="mt-4 text-xs text-muted">
                  Contact number: {patient.phone}
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center gap-3 border-t border-line bg-white px-6 py-4">

            <p className="flex-1 text-sm text-muted">
              {step === 0 ? (
                <>
                  {selectedItems.length} selected ·{' '}
                  <span className="font-bold text-ink">
                    ₹{selectedSubtotal.toLocaleString('en-IN')}
                  </span>
                </>
              ) : step < 3 ? (
                <>
                  Total{' '}
                  <span className="font-bold text-ink">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </>
              ) : null}
            </p>

            {step > 0 && step < 3 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isSaving}
                className="btn-secondary !px-4 !py-3 disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}

            {step === 0 && (
              <button
                onClick={() => setStep(1)}
                disabled={!canContinue}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            )}

            {step === 1 && (
              <button
                onClick={handleCollectionContinue}
                disabled={!isCollectionSelectionValid}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={confirm}
                disabled={isSaving}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving booking...' : 'Review and confirm'}
                {!isSaving && <ArrowRight size={16} />}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={onClose}
                className="btn-primary w-full"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PACKAGE INCLUDED TESTS POPUP */}
      {viewingPackage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-blue-900/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewingPackage(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="included-tests-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="included-tests-title"
                  className="text-lg font-bold text-brand-blue-700"
                >
                  {viewingPackage.name}
                </h3>

                <p className="mt-1 text-sm text-muted">
                  {viewingPackage.includedTests?.length ?? 0} tests included
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewingPackage(null)}
                aria-label="Close included tests"
                className="rounded-full p-2 text-muted transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 max-h-[55vh] space-y-2 overflow-y-auto">
              {viewingPackage.includedTests?.map((test, index) => (
                <div
                  key={`${test}-${index}`}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <Check
                    size={17}
                    className="mt-0.5 shrink-0 text-brand-teal-600"
                  />

                  <span className="text-sm text-ink">
                    {test}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setViewingPackage(null)}
              className="btn-primary mt-5 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ChoiceCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? 'border-brand-teal-400 bg-brand-teal-50 ring-4 ring-brand-teal-100'
          : 'border-line hover:border-brand-teal-200'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          active
            ? 'bg-brand-teal-500 text-white'
            : 'bg-brand-teal-50 text-brand-teal-600'
        }`}
      >
        {icon}
      </span>

      <p className="mt-3 text-sm font-bold text-ink">
        {title}
      </p>

      <p className="mt-1 text-xs text-muted">
        {subtitle}
      </p>
    </button>
  );
}
