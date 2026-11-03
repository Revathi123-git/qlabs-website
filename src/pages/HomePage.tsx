import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, FileText, Home as HomeIcon, ShieldCheck, Clock3, TestTube2, Microscope, ChevronDown } from 'lucide-react';
import { useBooking } from '@/context/booking-context';
import { FAQS, HEALTH_PACKAGES, IMAGES, LAB_TESTS, SITE_CONTACT } from '@/data/mock-data';
import { toTelHref } from '@/lib/phone';
import { TestCard } from '@/components/tests/TestCard';
import { PackageCard } from '@/components/packages/PackageCard';

const QUICK_LINKS = [
  { title: 'Lab tests', description: 'Search 500+ tests with clear prices', to: '/tests', icon: TestTube2 },
  { title: 'Health packages', description: 'Full body, diabetes, heart and senior', to: '/packages', icon: Microscope },
  { title: 'Home collection', description: 'A trained visit at your doorstep', to: '/locations', icon: HomeIcon },
  { title: 'Download reports', description: 'Secure access to your results', to: '/reports', icon: FileText },
];

const STEPS = [
  { title: 'Choose your tests', copy: 'Pick individual tests or a full health package, and see preparation details upfront.', icon: TestTube2 },
  { title: 'Pick a time slot', copy: 'Select home collection or a nearby lab, then choose a time that suits your day.', icon: CalendarCheck },
  { title: 'Get your reports', copy: 'Receive clear, secure digital reports, often within 24 hours.', icon: ShieldCheck },
];

export function HomePage() {
  const { openBooking } = useBooking();
  const featuredTests = LAB_TESTS.filter((test) => test.featured);

  return (
    <main>
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-brand-teal-50/80 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-14 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-teal-200 bg-white px-4 py-2 text-xs font-semibold text-brand-teal-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-green-500" />
              Home collection available across Hyderabad
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.1] tracking-tight text-brand-blue-700 sm:text-6xl">
              Book lab tests online.
              <span className="block text-brand-teal-500">Home collection.</span>
              Fast, reliable reports.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Choose your tests, pick a time that suits you, and let our trained team take care of the rest. Clear prices, clear prep, clear results.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => openBooking()} className="btn-primary">
                Book a test
                <ArrowRight size={16} />
              </button>
              <Link to="/tests" className="btn-secondary">Explore tests</Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-7">
              <Stat value="50k+" label="Families served" />
              <Stat value="24 hr" label="Typical report time" />
              <Stat value="4.9/5" label="Patient rating" />
            </dl>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] shadow-lift">
              <img src={IMAGES.doctor} alt="Doctor reviewing health results with a patient" className="h-[460px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-900/50 via-transparent to-transparent" aria-hidden="true" />
            </div>
            <div className="absolute -left-4 bottom-8 flex items-center gap-3 rounded-2xl bg-white p-4 pr-6 shadow-lift sm:-left-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green-50 text-brand-green-600">
                <Clock3 size={21} />
              </span>
              <div>
                <p className="text-xs font-semibold text-muted">Next collection</p>
                <p className="text-sm font-bold text-ink">Today, 3:00 PM slot</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] shadow-lift">
          <img src={IMAGES.bannerWide} alt="Q Labs Diagnostics. Accurate diagnostics, 24/7 service. Book a test" className="h-auto w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.to} className="group card flex items-start gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-teal-200 hover:shadow-lift">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue-50 text-brand-blue-600 transition group-hover:bg-brand-teal-500 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <div>
                  <p className="font-bold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Popular with our patients</p>
            <h2 className="section-title mt-2">Start with what matters most</h2>
          </div>
          <Link to="/tests" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-600 hover:text-brand-teal-700">
            View all tests
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featuredTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] shadow-card">
            <img src={IMAGES.lab} alt="Q Labs scientists working in a modern laboratory" className="h-[420px] w-full object-cover" />
          </div>
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="section-title mt-2">Your health, on your schedule.</h2>
            <p className="mt-4 max-w-md leading-7 text-muted">From the first click to your final report, we keep every step clear, convenient, and human.</p>
            <ol className="mt-10 space-y-7">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="flex gap-5">
                    <div className="relative flex flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal-50 text-brand-teal-600">
                        <Icon size={21} />
                      </span>
                      {index < STEPS.length - 1 && <span className="mt-2 h-full w-px bg-brand-teal-100" aria-hidden="true" />}
                    </div>
                    <div className="pb-2">
                      <h3 className="font-bold text-ink">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted">{step.copy}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">For every stage of life</p>
            <h2 className="section-title mt-2">Find the right health package</h2>
          </div>
          <Link to="/packages" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-600 hover:text-brand-teal-700">
            Compare packages
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {HEALTH_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-brand-blue-900 px-7 py-14 sm:px-14 lg:px-20 lg:py-20">
          <img src={IMAGES.testTubes} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-blue-900 via-brand-blue-900/90 to-brand-blue-700/70" aria-hidden="true" />
          <div className="max-w-xl">
            <p className="eyebrow text-brand-green-200">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">Book your test in under two minutes.</h2>
            <p className="mt-4 leading-7 text-brand-blue-100">Pick your tests, choose a slot, and confirm. Your reports are one secure login away.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => openBooking()} className="btn-accent">
                Book a test
                <ArrowRight size={16} />
              </button>
              <Link to="/reports" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Find my report
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 className="section-title mt-2">Questions, answered.</h2>
            <p className="mt-4 leading-7 text-muted">Still unsure? Our care team is happy to help you choose the right tests.</p>
            <a href={toTelHref(SITE_CONTACT.phones[0])} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-teal-600 hover:text-brand-teal-700">
              Call {SITE_CONTACT.phones[0]}
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group card p-5 open:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink">
                  {faq.question}
                  <ChevronDown size={20} className="shrink-0 text-brand-teal-500 transition duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-brand-blue-700">{value}</dd>
    </div>
  );
}
