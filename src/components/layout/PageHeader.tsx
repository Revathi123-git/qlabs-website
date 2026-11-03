import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  backgroundImage?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, backgroundImage, children }: PageHeaderProps) {
  if (backgroundImage) {
    return (
      <section className="relative isolate overflow-hidden bg-brand-blue-900">
        <img src={backgroundImage} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-blue-900 via-brand-blue-900/85 to-brand-blue-700/50" aria-hidden="true" />
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-24">
          <p className="eyebrow text-brand-green-200">{eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-brand-blue-100">{description}</p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-brand-blue-700 sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">{description}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
