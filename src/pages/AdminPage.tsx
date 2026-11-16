
import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  Package,
  RefreshCw,
  TestTube2,
  Users,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  booking_reference: string;
  patient_name: string;
  phone: string;
  collection_mode: string;
  collection_date: string;
  collection_time: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Enquiry {
  id: string;
  full_name: string;
  mobile: string;
  email: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  activeTests: number;
  activePackages: number;
  totalBookings: number;
  pendingBookings: number;
  newEnquiries: number;
  totalEnquiries: number;
}

const EMPTY_STATS: DashboardStats = {
  activeTests: 0,
  activePackages: 0,
  totalBookings: 0,
  pendingBookings: 0,
  newEnquiries: 0,
  totalEnquiries: 0,
};

function formatDate(value: string) {
  if (!value) return '—';

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value: string) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    new: 'bg-amber-50 text-amber-700 border-amber-200',
    contacted: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] || 'border-gray-200 bg-gray-50 text-gray-600'
      }`}
    >
      {status.split('_').join(' ')}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof TestTube2;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#64748B]">{title}</p>
          <p className="mt-3 text-3xl font-bold tabular-nums text-[#064568]">
            {value.toLocaleString('en-IN')}
          </p>
          <p className="mt-2 text-xs text-[#64748B]">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconColor}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null
  );
  const [bookingActionError, setBookingActionError] = useState('');

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [
        testsResult,
        packagesResult,
        bookingsResult,
        pendingResult,
        enquiriesResult,
        newEnquiriesResult,
        recentBookingsResult,
        recentEnquiriesResult,
      ] = await Promise.all([
        supabase
          .from('tests')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),

        supabase
          .from('test_packages')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),

        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),

        supabase
          .from('contact_enquiries')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('contact_enquiries')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new'),

        supabase
          .from('bookings')
          .select(
            'id, booking_reference, patient_name, phone, collection_mode, collection_date, collection_time, total_amount, status, created_at'
          )
          .order('created_at', { ascending: false })
          .limit(6),

        supabase
          .from('contact_enquiries')
          .select('id, full_name, mobile, email, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const firstError =
        testsResult.error ||
        packagesResult.error ||
        bookingsResult.error ||
        pendingResult.error ||
        enquiriesResult.error ||
        newEnquiriesResult.error ||
        recentBookingsResult.error ||
        recentEnquiriesResult.error;

      if (firstError) {
        throw firstError;
      }

      setStats({
        activeTests: testsResult.count ?? 0,
        activePackages: packagesResult.count ?? 0,
        totalBookings: bookingsResult.count ?? 0,
        pendingBookings: pendingResult.count ?? 0,
        newEnquiries: newEnquiriesResult.count ?? 0,
        totalEnquiries: enquiriesResult.count ?? 0,
      });

      setBookings((recentBookingsResult.data ?? []) as Booking[]);
      setEnquiries((recentEnquiriesResult.data ?? []) as Enquiry[]);
    } catch (err) {
      console.error('Dashboard loading error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard information.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Manually mark a booking as completed after sample collection.
  const markBookingCompleted = async (booking: Booking) => {
    const confirmed = window.confirm(
      `Have you received the sample for booking ${booking.booking_reference}? Mark it as completed?`
    );

    if (!confirmed) return;

    setUpdatingBookingId(booking.id);
    setBookingActionError('');

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id)
        .in('status', ['pending', 'confirmed'])
        .select('id')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          'This booking was already updated or its status cannot be changed. Refresh the dashboard and check its current status.'
        );
      }

      await loadDashboard(true);
    } catch (err) {
      console.error('Booking status update error:', err);

      setBookingActionError(
        err instanceof Error
          ? err.message
          : 'Unable to update booking status.'
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#079C83]">
            Q Labs Diagnostics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#064568] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Overview of your diagnostic website activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#17324D] hover:border-[#079C83] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Dashboard data could not be loaded.</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2">
              Check your Supabase admin login and database permissions.
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-[#079C83]" />
          <h2 className="font-semibold text-[#17324D]">
            Website overview
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Active tests"
            value={stats.activeTests}
            description="Tests currently displayed"
            icon={TestTube2}
            iconColor="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Active packages"
            value={stats.activePackages}
            description="Packages currently available"
            icon={Package}
            iconColor="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Total bookings"
            value={stats.totalBookings}
            description="All website bookings"
            icon={CalendarDays}
            iconColor="bg-violet-50 text-violet-700"
          />

          <StatCard
            title="Pending bookings"
            value={stats.pendingBookings}
            description="Bookings awaiting confirmation"
            icon={Clock}
            iconColor="bg-amber-50 text-amber-700"
          />

          <StatCard
            title="Total enquiries"
            value={stats.totalEnquiries}
            description="Contact form submissions"
            icon={MessageSquare}
            iconColor="bg-cyan-50 text-cyan-700"
          />

          <StatCard
            title="New enquiries"
            value={stats.newEnquiries}
            description="Enquiries awaiting follow-up"
            icon={Users}
            iconColor="bg-orange-50 text-orange-700"
          />
        </div>
      </section>

      {/* Booking action error */}
      {bookingActionError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {bookingActionError}
        </div>
      )}

      {/* Recent bookings */}
      <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h2 className="font-semibold text-[#064568]">
              Recent bookings
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Latest bookings received through your website
            </p>
          </div>

          <span className="rounded-full bg-[#F0F9F7] px-3 py-1 text-xs font-semibold text-[#079C83]">
            {stats.totalBookings} total
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList
              size={30}
              className="mx-auto text-[#94A3B8]"
            />
            <p className="mt-3 text-sm font-medium text-[#17324D]">
              No bookings found
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              New website bookings will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-[#64748B]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Booking</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Collection</th>
                  <th className="px-5 py-3 font-semibold">Date & time</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#064568]">
                        {booking.booking_reference}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#17324D]">
                        {booking.patient_name}
                      </p>
                      <p className="mt-1 text-xs text-[#64748B]">
                        {booking.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4 capitalize text-[#475569]">
                      {booking.collection_mode === 'home'
                        ? 'Home collection'
                        : 'Lab visit'}
                    </td>

                    <td className="px-5 py-4 text-[#475569]">
                      <p>{formatDate(booking.collection_date)}</p>
                      <p className="mt-1 text-xs text-[#64748B]">
                        {booking.collection_time}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#17324D]">
                      {formatCurrency(booking.total_amount)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>

                    <td className="px-5 py-4">
                      {booking.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-green-700">
                          <CheckCircle size={16} />
                          Completed
                        </span>
                      ) : booking.status === 'pending' ||
                        booking.status === 'confirmed' ? (
                        <button
                          type="button"
                          onClick={() => markBookingCompleted(booking)}
                          disabled={updatingBookingId === booking.id}
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#079C83] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#067D6A] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle size={15} />
                          {updatingBookingId === booking.id
                            ? 'Updating...'
                            : 'Mark as Completed'}
                        </button>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">
                          No action
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent enquiries */}
      <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h2 className="font-semibold text-[#064568]">
              Recent contact enquiries
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Messages submitted through the contact page
            </p>
          </div>

          <span className="rounded-full bg-[#F0F9F7] px-3 py-1 text-xs font-semibold text-[#079C83]">
            {stats.newEnquiries} new
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            Loading enquiries...
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare
              size={30}
              className="mx-auto text-[#94A3B8]"
            />
            <p className="mt-3 text-sm font-medium text-[#17324D]">
              No contact enquiries found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#17324D]">
                    {enquiry.full_name}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {enquiry.mobile}
                    {enquiry.email ? ` · ${enquiry.email}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-[#94A3B8]">
                    Submitted {formatDateTime(enquiry.created_at)}
                  </p>
                </div>

                <StatusBadge status={enquiry.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Admin information */}
      <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#F0F9F7] p-3 text-[#079C83]">
            <IndianRupee size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-[#064568]">
              Catalogue and booking management
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#64748B]">
              Manage your diagnostic tests, prices, package details and
              catalogue images. Review patient bookings and follow up on
              contact enquiries from the administration area.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
