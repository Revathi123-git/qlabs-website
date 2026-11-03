import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock3, Mail, MapPin, Phone, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormField } from '@/components/ui/FormField';
import { SITE_CONTACT } from '@/data/mock-data';
import { toTelHref } from '@/lib/phone';
import { supabase } from '@/lib/supabase';

interface EnquiryForm {
  fullName: string;
  mobile: string;
  email: string;
}

type EnquiryErrors = Partial<Record<keyof EnquiryForm, string>>;

const EMPTY_FORM: EnquiryForm = { fullName: '', mobile: '', email: '' };

export function ContactPage() {
  const [form, setForm] = useState<EnquiryForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = (field: keyof EnquiryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const next: EnquiryErrors = {};
    if (!form.fullName.trim()) next.fullName = 'Please enter your full name.';
    if (!/^\d{10}$/.test(form.mobile.trim())) next.mobile = 'Enter a valid 10 digit mobile number.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from('contact_enquiries').insert({
      full_name: form.fullName.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
    });
    setIsSubmitting(false);

    if (error) {
      setSubmitError('We could not send your enquiry. Please check your details and try again.');
      return;
    }
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError(null);
    setIsSubmitted(false);
  };

  return (
    <main>
      <PageHeader
        eyebrow="Contact us"
        title="We are happy to help."
        description="Questions about a test, a package or your visit? Reach our team by phone or send us an enquiry."
      />

      <section className="mx-auto grid max-w-[1100px] gap-8 px-5 py-14 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div className="space-y-4">
          <ContactCard icon={<Phone size={20} />} title="Call us">
            {SITE_CONTACT.phones.map((phone) => (
              <a key={phone} href={toTelHref(phone)} className="block text-base font-semibold text-ink transition hover:text-brand-teal-600">
                {phone}
              </a>
            ))}
          </ContactCard>
          <ContactCard icon={<Mail size={20} />} title="Email us">
            <a href={`mailto:${SITE_CONTACT.email}`} className="break-all text-base font-semibold text-ink transition hover:text-brand-teal-600">
              {SITE_CONTACT.email}
            </a>
          </ContactCard>
          <ContactCard icon={<MapPin size={20} />} title="Visit our lab">
            <p className="text-base font-semibold text-ink">{SITE_CONTACT.address}</p>
          </ContactCard>
          <ContactCard icon={<Clock3 size={20} />} title="Opening hours">
            <p className="text-base font-semibold text-ink">{SITE_CONTACT.hours}</p>
          </ContactCard>
        </div>

        <div className="card p-7 sm:p-9">
          {isSubmitted ? (
            <div className="flex flex-col items-center py-10 text-center" role="status">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-50 text-brand-green-600">
                <CheckCircle2 size={32} />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-brand-blue-700">Thank you, {form.fullName.trim().split(' ')[0]}.</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                Your enquiry has been received. Our team will reach out on {form.mobile} or {form.email.trim()} shortly.
              </p>
              <button onClick={resetForm} className="btn-secondary mt-8">Send another enquiry</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-ink">Send us an enquiry</h2>
                <p className="mt-1.5 text-sm text-muted">Share your details and we will get back to you.</p>
              </div>
              <FormField id="contact-name" label="Full name" error={errors.fullName}>
                <input
                  id="contact-name"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  autoComplete="name"
                  placeholder="e.g. Ananya Rao"
                  className="input"
                  aria-invalid={Boolean(errors.fullName)}
                />
              </FormField>
              <FormField id="contact-mobile" label="Mobile number" error={errors.mobile}>
                <input
                  id="contact-mobile"
                  value={form.mobile}
                  onChange={(event) => updateField('mobile', event.target.value)}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10 digit mobile number"
                  className="input"
                  aria-invalid={Boolean(errors.mobile)}
                />
              </FormField>
              <FormField id="contact-email" label="Mail ID" error={errors.email}>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input"
                  aria-invalid={Boolean(errors.email)}
                />
              </FormField>
              {submitError && (
                <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
                  {submitError}
                </p>
              )}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                <Send size={16} />
                {isSubmitting ? 'Sending...' : 'Send enquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function ContactCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card flex items-start gap-4 p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal-50 text-brand-teal-600">{icon}</span>
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{title}</p>
        {children}
      </div>
    </div>
  );
}
