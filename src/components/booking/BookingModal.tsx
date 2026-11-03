import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Home, MapPin, Search, X } from 'lucide-react';
import { BOOKING_DATES, HEALTH_PACKAGES, LAB_TESTS, TIME_SLOTS } from '@/data/mock-data';
import { FormField } from '@/components/ui/FormField';
import type { CollectionMode, PatientDetails } from '@/types';

interface BookableItem {
  id: string;
  name: string;
  detail: string;
  price: number;
}

const BOOKABLE_ITEMS: BookableItem[] = [
  ...LAB_TESTS.map((test) => ({ id: test.id, name: test.name, detail: `${test.prep} · ${test.turnaround}`, price: test.price })),
  ...HEALTH_PACKAGES.map((pkg) => ({ id: pkg.id, name: pkg.title, detail: `${pkg.testCount} tests included`, price: pkg.price })),
];

const STEP_TITLES = ['What would you like to check?', 'Choose your collection', 'Your patient details', 'Booking confirmed'];

interface BookingModalProps {
  initialItemId?: string;
  onClose: () => void;
}

export function BookingModal({ initialItemId, onClose }: BookingModalProps) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(initialItemId);
  const [mode, setMode] = useState<CollectionMode>('home');
  const [date, setDate] = useState(BOOKING_DATES[0]);
  const [slot, setSlot] = useState(TIME_SLOTS[1]);
  const [patient, setPatient] = useState<PatientDetails>({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof PatientDetails, string>>>({});
  const [reference, setReference] = useState('');

  const selected = BOOKABLE_ITEMS.find((item) => item.id === selectedId);
  const filteredItems = useMemo(
    () => BOOKABLE_ITEMS.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const collectionFee = mode === 'home' ? 100 : 0;
  const total = (selected?.price ?? 0) + collectionFee;

  const validate = () => {
    const next: typeof errors = {};
    if (!patient.name.trim()) next.name = 'Please enter the patient name.';
    if (!/^\d{10}$/.test(patient.phone.trim())) next.phone = 'Enter a valid 10 digit mobile number.';
    if (patient.email.trim() && !/^\S+@\S+\.\S+$/.test(patient.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const confirm = () => {
    if (!validate()) return;
    setReference(`QL-${Date.now().toString(36).toUpperCase().slice(-6)}`);
    setStep(3);
  };

  const canContinue = step === 0 ? Boolean(selected) : true;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-blue-900/60 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="booking-title" className="flex max-h-[92vh] w-full max-w-[580px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="eyebrow">Book a test · Step {Math.min(step + 1, 3)} of 3</p>
            <h2 id="booking-title" className="mt-1.5 text-xl font-bold text-brand-blue-700">{STEP_TITLES[step]}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted transition hover:bg-canvas hover:text-ink" aria-label="Close booking">
            <X size={20} />
          </button>
        </div>

        {step < 3 && (
          <div className="flex gap-2 px-6 pt-5" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className={`h-1.5 flex-1 rounded-full transition-colors ${item <= step ? 'bg-brand-teal-500' : 'bg-line'}`} />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 && (
            <div>
              <div className="relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests or packages" className="input !pl-11" aria-label="Search tests or packages" />
              </div>
              <div className="mt-4 space-y-2.5">
                {filteredItems.map((item) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                        isSelected ? 'border-brand-teal-400 bg-brand-teal-50 ring-4 ring-brand-teal-100' : 'border-line hover:border-brand-teal-200 hover:bg-canvas'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-muted">{item.detail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand-blue-700">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${isSelected ? 'border-brand-teal-500 bg-brand-teal-500 text-white' : 'border-line text-transparent'}`}>
                          <Check size={14} />
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filteredItems.length === 0 && <p className="py-8 text-center text-sm text-muted">No matches. Try another name.</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="label">Collection</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceCard active={mode === 'home'} onClick={() => setMode('home')} icon={<Home size={19} />} title="Home collection" subtitle="₹100 visit fee" />
                  <ChoiceCard active={mode === 'lab'} onClick={() => setMode('lab')} icon={<MapPin size={19} />} title="Visit a lab" subtitle="No extra charge" />
                </div>
              </div>
              <div>
                <p className="label">Date</p>
                <div className="grid grid-cols-3 gap-2">
                  {BOOKING_DATES.map((item) => (
                    <PillButton key={item} active={date === item} onClick={() => setDate(item)}>{item}</PillButton>
                  ))}
                </div>
              </div>
              <div>
                <p className="label">Time slot</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIME_SLOTS.map((item) => (
                    <PillButton key={item} active={slot === item} onClick={() => setSlot(item)}>{item}</PillButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-brand-teal-50 p-4 text-sm">
                <p className="font-bold text-brand-teal-700">{selected?.name}</p>
                <p className="mt-1 text-muted">{mode === 'home' ? 'Home collection' : 'Visit a lab'} · {date} · {slot}</p>
              </div>
              <FormField id="patient-name" label="Patient full name" error={errors.name}>
                <input id="patient-name" value={patient.name} onChange={(event) => setPatient({ ...patient, name: event.target.value })} placeholder="e.g. Ananya Rao" className="input" aria-invalid={Boolean(errors.name)} />
              </FormField>
              <FormField id="patient-phone" label="Mobile number" error={errors.phone}>
                <input id="patient-phone" value={patient.phone} onChange={(event) => setPatient({ ...patient, phone: event.target.value })} inputMode="numeric" placeholder="10 digit mobile number" className="input" aria-invalid={Boolean(errors.phone)} />
              </FormField>
              <FormField id="patient-email" label="Email (optional)" error={errors.email}>
                <input id="patient-email" value={patient.email} onChange={(event) => setPatient({ ...patient, email: event.target.value })} placeholder="you@example.com" className="input" aria-invalid={Boolean(errors.email)} />
              </FormField>
            </div>
          )}

          {step === 3 && (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600">
                <Check size={30} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-brand-blue-700">Thank you, {patient.name.split(' ')[0]}.</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Your {selected?.name} is booked for {date} between {slot.toLowerCase()}. We will send a confirmation to {patient.phone}.
              </p>
              <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-line p-4">
                <p className="text-xs font-semibold text-muted">Booking reference</p>
                <p className="mt-1 text-lg font-bold tracking-wider text-brand-blue-700">{reference}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-white px-6 py-4">
          {step === 0 || step === 3 ? (
            <p className="flex-1 text-sm text-muted">
              {step === 0 && selected ? (
                <>Total <span className="font-bold text-ink">₹{selected.price.toLocaleString('en-IN')}</span></>
              ) : null}
            </p>
          ) : (
            <p className="flex-1 text-sm text-muted">
              Total <span className="font-bold text-ink">₹{total.toLocaleString('en-IN')}</span>
            </p>
          )}
          {step > 0 && step < 3 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary !px-4 !py-3">
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          {step < 2 && (
            <button onClick={() => setStep(step + 1)} disabled={!canContinue} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">
              Continue
              <ArrowRight size={16} />
            </button>
          )}
          {step === 2 && (
            <button onClick={confirm} className="btn-primary">
              Review and confirm
              <ArrowRight size={16} />
            </button>
          )}
          {step === 3 && (
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border p-4 text-left transition ${active ? 'border-brand-teal-400 bg-brand-teal-50 ring-4 ring-brand-teal-100' : 'border-line hover:border-brand-teal-200'}`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-brand-teal-500 text-white' : 'bg-brand-teal-50 text-brand-teal-600'}`}>{icon}</span>
      <p className="mt-3 text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </button>
  );
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold transition ${active ? 'border-brand-teal-400 bg-brand-teal-50 text-brand-teal-700' : 'border-line text-ink hover:border-brand-teal-200'}`}
    >
      {children}
    </button>
  );
}
