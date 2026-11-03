import { PageHeader } from '@/components/layout/PageHeader';
import { TERMS_EFFECTIVE_DATE, TERMS_INTRO, TERMS_SECTIONS } from '@/data/terms-content';

export function TermsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Legal"
        title="Terms and Conditions"
        description={`Effective date: ${TERMS_EFFECTIVE_DATE}. Please read these terms before booking a test or using our services.`}
      />

      <section className="mx-auto grid max-w-[1100px] gap-12 px-5 py-14 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
        <aside className="h-fit lg:sticky lg:top-28">
          <nav aria-label="Terms sections" className="card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">On this page</p>
            <ol className="mt-4 space-y-1.5">
              {TERMS_SECTIONS.map((section, index) => (
                <li key={section.title}>
                  <a href={`#terms-${index + 1}`} className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-brand-teal-50 hover:text-brand-teal-700">
                    <span className="mr-2 font-semibold text-brand-teal-500">{index + 1}.</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="space-y-10 text-[15px] leading-7 text-muted">
          <div className="space-y-4 rounded-2xl bg-brand-teal-50/60 p-6 text-ink">
            {TERMS_INTRO.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {TERMS_SECTIONS.map((section, index) => (
            <section key={section.title} id={`terms-${index + 1}`} className="scroll-mt-28">
              <h2 className="text-xl font-bold text-brand-blue-700">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.body.map((block, blockIndex) =>
                  Array.isArray(block) ? (
                    <ul key={blockIndex} className="list-disc space-y-2 pl-6 marker:text-brand-teal-400">
                      {block.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={blockIndex}>{block}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </article>
      </section>
    </main>
  );
}
