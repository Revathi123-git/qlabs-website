import { Award, ShieldCheck, Users } from 'lucide-react';
import { IMAGES } from '@/data/mock-data';
import type { ReactNode } from 'react';

const VALUES = [
  { title: 'Quality without compromise', copy: 'Every sample follows a documented chain of care and is reviewed with precision.', icon: ShieldCheck },
  { title: 'People who listen', copy: 'Our collection partners and support team make space for questions, not just checklists.', icon: Users },
  { title: 'Built to earn trust', copy: 'Accredited-grade processes, modern equipment, and a culture of continuous improvement.', icon: Award },
];

const STATS = [
  { value: '12+', label: 'Years of care' },
  { value: '50k', label: 'Families served' },
  { value: '99%', label: 'Reports on time' },
];

export function AboutPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">Why Q Labs</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.15] tracking-tight text-brand-blue-700 sm:text-5xl">The lab behind your peace of mind.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
              We believe diagnostics should feel less clinical and more considered. Every sample, report and conversation is held to one standard: would we trust this for our own family?
            </p>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-semibold text-muted">{stat.label}</dt>
                  <dd className="mt-1 text-3xl font-bold text-brand-teal-500">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[36px] bg-brand-teal-50" aria-hidden="true" />
            <img src={IMAGES.lab} alt="Q Labs laboratory with technicians at work" className="h-[460px] w-full rounded-[28px] object-cover shadow-lift" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
        <div className="mb-10 max-w-xl">
          <p className="eyebrow">What we stand for</p>
          <h2 className="section-title mt-2">Care that you can count on</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <ValueCard key={value.title} icon={<Icon size={22} />}>
                <h3 className="text-lg font-bold text-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{value.copy}</p>
              </ValueCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ValueCard({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="card p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-50 text-brand-green-600">{icon}</span>
      <div className="mt-6">{children}</div>
    </div>
  );
}
