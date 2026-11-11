
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
}

const STEP_TITLES = [
  'What would you like to check?',
  'Choose your collection',
  'Your patient details',
  'Booking details ready',
];

// Get today's date in the user's local timezone.
function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Get the current local time in HH:mm format.
function getLocalTimeString() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

// Format the selected date for display.
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

// Format the selected time for display.
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

  const [items, setItems] = useState<BookableItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialItemId,
  );

  const [mode, setMode] = useState<CollectionMode>('home');

  // Date and time are initially empty.
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

  // Minimum selectable date is today.
  const today = getLocalDateString();

  // Minimum selectable time when today's date is selected.
  const currentTime = getLocalTimeString();

  // Fetch active tests and packages from Supabase.
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

      // Map active individual tests.
      const bookableTests: BookableItem[] = (
        testsResult.data ?? []
      ).map((test) => ({
        id: test.id,
        name: test.name,
        detail:
          test.report_turnaround_hours == null
            ? 'Individual diagnostic test'
            : `Report in ${test.report_turnaround_hours} hours`,
        price: Number(test.selling_price),
        type: 'test',
      }));

      // Map active packages.
      const bookablePackages: BookableItem[] = (
        packagesResult.data ?? []
      ).map((pkg) => {
        const includedTests =
          itemsByPackage.get(pkg.id) ??
          pkg.tests_included ??
          [];

        return {
          id: pkg.id,
          name: pkg.package_name,
          detail: `${includedTests.length} tests included`,
          price: Number(pkg.price),
          type: 'package',
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

  // Selected test or package.
  const selected = items.find((item) => item.id === selectedId);

  // Search tests and packages.
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [items, query],
  );

  // Collection fee and total price.
  const collectionFee = mode === 'home' ? 100 : 0;

  const total = (selected?.price ?? 0) + collectionFee;

  // Calculate the minimum allowed time.
  // If the customer selects today, past times cannot be selected.
  const minimumTime =
    date === today ? currentTime : undefined;

  // Check whether the selected date and time are valid.
  const isCollectionSelectionValid =
    Boolean(date) &&
    Boolean(slot) &&
    date >= today &&
    (date !== today || slot >= currentTime);

  // Change date and reset the previously selected time.
  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newDate = event.target.value;

    setDate(newDate);
    setSlot('');
  };

  // Handle time selection.
  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSlot(event.target.value);
  };

  // Validate patient details.
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

  // Continue from collection selection.
  const handleCollectionContinue = () => {
    if (!isCollectionSelectionValid) return;

    setStep(2);
  };

  // Existing local confirmation behavior.
  const confirm = () => {
    if (!validate()) return;

    setReference(
      `QL-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    );

    setStep(3);
  };

  // Require a test/package in Step 1.
  const canContinue =
    Boolean(selected) && !isLoading;

  return (
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
        className="flex max-h-[92vh] w-full max-w-[580px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl"
      >
        {/* Header */}
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

        {/* Progress indicator */}
        {step < 3 && (
          <div className="flex gap-2 px-6 pt-5" aria-hidden="true">
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

          {/* STEP 1: Select a test or package */}
          {step === 0 && (
            <div>
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tests or packages"
                  className="input !pl-11"
                  aria-label="Search tests or packages"
                />
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
                <div className="mt-4 space-y-2.5">
                  {filteredItems.map((item) => {
                    const isSelected = item.id === selectedId;

                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => setSelectedId(item.id)}
                        aria-pressed={isSelected}
                        className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-brand-teal-400 bg-brand-teal-50 ring-4 ring-brand-teal-100'
                            : 'border-line hover:border-brand-teal-200 hover:bg-canvas'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            {item.detail}
                          </p>

                          <span className="mt-2 inline-flex rounded-full bg-brand-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-blue-600">
                            {item.type === 'test'
                              ? 'Individual test'
                              : 'Health package'}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-bold text-brand-blue-700">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>

                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'border-brand-teal-500 bg-brand-teal-500 text-white'
                                : 'border-line text-transparent'
                            }`}
                          >
                            <Check size={14} />
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredItems.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted">
                      {items.length === 0
                        ? 'No active tests or packages are available.'
                        : 'No matches. Try another name.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Collection options */}
          {step === 1 && (
            <div className="space-y-6">

              {/* Collection mode */}
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

              {/* Date selection */}
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

              {/* Preferred time selection */}
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

          {/* STEP 3: Patient details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-brand-teal-50 p-4 text-sm">
                <p className="font-bold text-brand-teal-700">
                  {selected?.name}
                </p>

                <p className="mt-1 text-muted">
                  {mode === 'home'
                    ? 'Home collection'
                    : 'Visit a lab'}
                  {' · '}
                  {formatCollectionDate(date)}
                  {' · '}
                  {formatCollectionTime(slot)}
                </p>
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
            </div>
          )}

          {/* STEP 4: Confirmation screen */}
          {step === 3 && (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600">
                <Check size={30} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-brand-blue-700">
                Thank you, {patient.name.split(' ')[0]}.
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Your {selected?.name} booking details are ready.
                Your preferred collection date is{' '}
                {formatCollectionDate(date)} at{' '}
                {formatCollectionTime(slot)}.
                We will send a confirmation to {patient.phone}
                after the booking request is submitted.
              </p>

              <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-line p-4">
                <p className="text-xs font-semibold text-muted">
                  Reference preview
                </p>

                <p className="mt-1 text-lg font-bold tracking-wider text-brand-blue-700">
                  {reference}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 border-t border-line bg-white px-6 py-4">

          {step === 0 || step === 3 ? (
            <p className="flex-1 text-sm text-muted">
              {step === 0 && selected ? (
                <>
                  Total{' '}
                  <span className="font-bold text-ink">
                    ₹{selected.price.toLocaleString('en-IN')}
                  </span>
                </>
              ) : null}
            </p>
          ) : (
            <p className="flex-1 text-sm text-muted">
              Total{' '}
              <span className="font-bold text-ink">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </p>
          )}

          {step > 0 && step < 3 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary !px-4 !py-3"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {/* Continue from Step 1 */}
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

          {/* Continue from Step 2 */}
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

          {/* Confirm from Step 3 */}
          {step === 2 && (
            <button
              onClick={confirm}
              className="btn-primary"
            >
              Review and confirm
              <ArrowRight size={16} />
            </button>
          )}

          {/* Finish */}
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
