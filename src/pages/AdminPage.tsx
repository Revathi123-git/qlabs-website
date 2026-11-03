import { CalendarDays, FileText, Home, TestTube2, TrendingUp } from 'lucide-react';

const STATS = [
  { label: 'Bookings today', value: '48', note: '+12% vs yesterday', icon: CalendarDays },
  { label: 'Reports to review', value: '16', note: '4 flagged urgent', icon: FileText },
  { label: 'Home collections', value: '31', note: '87% on time', icon: Home },
  { label: 'Revenue this month', value: '₹8.4L', note: '+8.4% vs last month', icon: TrendingUp },
];

type BookingStatus = 'Confirmed' | 'In progress' | 'Pending';

const TODAY_BOOKINGS: { name: string; detail: string; status: BookingStatus }[] = [
  { name: 'Ananya Rao', detail: 'Home collection · 10:30 AM', status: 'Confirmed' },
  { name: 'Vikram Shah', detail: 'Q Labs Shaikpet · 11:00 AM', status: 'In progress' },
  { name: 'Meera Nair', detail: 'Home collection · 11:30 AM', status: 'Confirmed' },
  { name: 'Rohan Kapoor', detail: 'Q Labs Shaikpet · 12:00 PM', status: 'Pending' },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  Confirmed: 'bg-brand-green-50 text-brand-green-700',
  'In progress': 'bg-brand-blue-50 text-brand-blue-600',
  Pending: 'bg-amber-50 text-amber-700',
};

export function AdminPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Q Labs workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-blue-700 sm:text-4xl">Good morning, Priya.</h1>
          <p className="mt-2 text-sm text-muted">Here is how today is shaping up at Q Labs Shaikpet and across home collections.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted">{stat.label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal-50 text-brand-teal-600">
                  <Icon size={17} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-brand-blue-700">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-brand-green-600">{stat.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink">Today's bookings</h2>
            <span className="text-xs font-semibold text-muted">{TODAY_BOOKINGS.length} shown</span>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {TODAY_BOOKINGS.map((booking) => (
              <li key={booking.name} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal-50 text-xs font-bold text-brand-teal-700">
                    {booking.name.split(' ').map((part) => part[0]).join('')}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{booking.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{booking.detail}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="card flex flex-col justify-between bg-brand-blue-700 p-6 text-white">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <TestTube2 size={20} />
            </span>
            <h2 className="mt-5 text-lg font-bold">Catalogue and content</h2>
            <p className="mt-2 text-sm leading-6 text-brand-blue-100">Test prices, packages, FAQs and clinic hours are managed here once the backend is connected.</p>
          </div>
          <p className="mt-6 text-sm font-semibold text-brand-green-200">16 reports are waiting for review.</p>
        </aside>
      </div>
    </main>
  );
}
