import { useState, type FormEvent } from 'react';
import { Download, FileText, Lock, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface SampleReport {
  id: string;
  name: string;
  collectedOn: string;
  parameters: { name: string; value: string; range: string; status: 'Normal' | 'Review' }[];
}

const SAMPLE_REPORT: SampleReport = {
  id: 'QL-2026-00842',
  name: 'Complete Health Screen',
  collectedOn: '18 Oct 2026',
  parameters: [
    { name: 'Haemoglobin', value: '14.2 g/dL', range: '13.0 – 17.0', status: 'Normal' },
    { name: 'Total WBC count', value: '7,800 /µL', range: '4,000 – 11,000', status: 'Normal' },
    { name: 'HbA1c', value: '6.1 %', range: 'Below 5.7', status: 'Review' },
    { name: 'TSH', value: '2.4 µIU/mL', range: '0.4 – 4.0', status: 'Normal' },
  ],
};

export function ReportsPage() {
  const [reportId, setReportId] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState<{ reportId?: string; mobile?: string }>({});
  const [report, setReport] = useState<SampleReport | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!reportId.trim()) nextErrors.reportId = 'Enter the report ID from your booking confirmation.';
    if (!/^\d{10}$/.test(mobile.trim())) nextErrors.mobile = 'Enter the 10 digit mobile number you registered with.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const isMatch = reportId.trim().toUpperCase() === SAMPLE_REPORT.id;
    setReport(isMatch ? SAMPLE_REPORT : null);
    setNotFound(!isMatch);
  };

  const downloadReport = () => {
    if (!report) return;
    const lines = [
      'Q Labs Diagnostics — Report summary',
      `Report ID: ${report.id}`,
      `Test: ${report.name}`,
      `Collected: ${report.collectedOn}`,
      '',
      ...report.parameters.map((item) => `${item.name}: ${item.value} (ref ${item.range}) — ${item.status}`),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <PageHeader
        eyebrow="Your reports"
        title="Your results, securely on hand."
        description="Enter your report ID and registered mobile number to view and download your latest results."
      />

      <section className="mx-auto grid max-w-[1100px] gap-8 px-5 py-14 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <form onSubmit={handleSubmit} noValidate className="card h-fit p-7 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal-50 text-brand-teal-600">
            <Lock size={21} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-ink">Find your report</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted">Use the report ID from your confirmation message. Try QL-2026-00842 with any 10 digit number to see a sample.</p>

          <div className="mt-7 space-y-5">
            <div>
              <label htmlFor="report-id" className="label">Report ID</label>
              <input id="report-id" value={reportId} onChange={(event) => setReportId(event.target.value)} placeholder="e.g. QL-2026-00842" className="input" aria-invalid={Boolean(errors.reportId)} aria-describedby={errors.reportId ? 'report-id-error' : undefined} />
              {errors.reportId && <p id="report-id-error" className="mt-1.5 text-xs font-semibold text-danger">{errors.reportId}</p>}
            </div>
            <div>
              <label htmlFor="report-mobile" className="label">Registered mobile number</label>
              <input id="report-mobile" value={mobile} onChange={(event) => setMobile(event.target.value)} inputMode="numeric" placeholder="10 digit mobile number" className="input" aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? 'report-mobile-error' : undefined} />
              {errors.mobile && <p id="report-mobile-error" className="mt-1.5 text-xs font-semibold text-danger">{errors.mobile}</p>}
            </div>
          </div>

          <button type="submit" className="btn-primary mt-7 w-full">
            <Search size={16} />
            Find my report
          </button>
        </form>

        <div>
          {report && (
            <article className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-brand-teal-50/60 p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-teal-600 shadow-card">
                    <FileText size={22} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-teal-600">Report ready</p>
                    <h3 className="mt-0.5 font-bold text-ink">{report.name}</h3>
                    <p className="text-xs text-muted">Collected {report.collectedOn} · {report.id}</p>
                  </div>
                </div>
                <button onClick={downloadReport} className="btn-primary !py-2.5">
                  <Download size={16} />
                  Download
                </button>
              </div>
              <ul className="divide-y divide-line">
                {report.parameters.map((item) => (
                  <li key={item.name} className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted">Reference {item.range}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-blue-700">{item.value}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === 'Normal' ? 'bg-brand-green-50 text-brand-green-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {notFound && (
            <div className="card flex flex-col items-center p-10 text-center">
              <FileText size={36} className="text-brand-teal-400" />
              <p className="mt-4 font-bold text-ink">We could not find that report</p>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">Check the report ID and mobile number, or call us and our team will help you locate it.</p>
            </div>
          )}

          {!report && !notFound && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-brand-teal-200 bg-white/60 p-10 text-center">
              <FileText size={36} className="text-brand-teal-300" />
              <p className="mt-4 font-semibold text-muted">Your report will appear here</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
