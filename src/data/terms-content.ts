export interface TermsSection {
  title: string;
  body: (string | string[])[];
}

export const TERMS_EFFECTIVE_DATE = 'February 2026';

export const TERMS_INTRO = [
  'Welcome to Q Labs Diagnostics. By accessing our website, booking a test, or using our services, you agree to the following Terms and Conditions.',
  'If you do not agree, do not use our services.',
];

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: 'About Us',
    body: [
      'Q Labs Diagnostics is a healthcare service provider located in Shaikpet, Hyderabad, offering laboratory and diagnostic services for individuals and corporate clients.',
    ],
  },
  {
    title: 'Services',
    body: [
      'We provide diagnostic testing including but not limited to:',
      [
        'Blood investigations',
        'Clinical biochemistry',
        'Hematology',
        'Microbiology',
        'Serology',
        'Clinical pathology',
        'Molecular biology testing',
        'Corporate and bulk health screenings',
      ],
      'All tests are conducted following standard laboratory procedures and quality protocols.',
    ],
  },
  {
    title: 'Eligibility',
    body: [
      'By using our services, you confirm that:',
      ['You are at least 18 years old, or', 'You are using the service under supervision of a parent/guardian', 'The information provided is accurate and complete'],
      'Providing false medical or personal information may impact test results.',
    ],
  },
  {
    title: 'Booking & Payments',
    body: [
      [
        'Payments must be made in full before or at the time of sample collection unless otherwise agreed.',
        'Corporate billing terms will be governed by separate written agreements.',
        'Prices are subject to change without prior notice.',
        'We reserve the right to refuse service in case of non-payment.',
      ],
    ],
  },
  {
    title: 'Sample Collection',
    body: [
      'For home or on-site collection:',
      [
        'The patient must provide correct address and contact details.',
        'Delays due to incorrect information are not our responsibility.',
        'Certain tests require fasting or preparation. Failure to follow instructions may affect results.',
      ],
    ],
  },
  {
    title: 'Reports & Medical Disclaimer',
    body: [
      [
        'Reports are generated based on the sample provided.',
        'Results are for informational and diagnostic purposes only.',
        'They must be interpreted by a qualified medical practitioner.',
        'Q Labs Diagnostics is not responsible for medical decisions taken without professional consultation.',
      ],
    ],
  },
  {
    title: 'Accuracy & Limitations',
    body: [
      'While we maintain strict quality control measures, diagnostic testing has inherent biological and technical limitations.',
      'We do not guarantee 100% diagnostic certainty in any medical test.',
    ],
  },
  {
    title: 'Cancellations & Refunds',
    body: [
      [
        'Cancellation requests must be made before sample collection.',
        'Once a sample is collected and processed, refunds will not be issued.',
        'Refund timelines (if applicable) may take 5–7 working days.',
        'Corporate agreements may have separate cancellation policies.',
      ],
    ],
  },
  {
    title: 'Corporate Health Programs',
    body: [
      'Bulk and corporate testing services are governed by individual service agreements.',
      'Q Labs Diagnostics is not liable for employer decisions based on screening reports.',
    ],
  },
  {
    title: 'Privacy',
    body: [
      'Patient information is handled confidentially and used only for diagnostic and compliance purposes.',
      'For more details, please refer to our Privacy Policy.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'Q Labs Diagnostics shall not be liable for:',
      ['Indirect or consequential damages', 'Misinterpretation of results', 'Delays caused by technical issues beyond our control', 'Decisions taken by third parties based on reports'],
      'Our maximum liability, if any, shall not exceed the amount paid for the specific test.',
    ],
  },
  {
    title: 'Website Usage',
    body: [
      'Content on this website is for informational purposes only.',
      'Unauthorized copying or reproduction is prohibited.',
      'We reserve the right to modify website content at any time.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These Terms shall be governed by the laws of India.',
      'Any disputes shall be subject to the jurisdiction of courts in Hyderabad, Telangana.',
    ],
  },
  {
    title: 'Contact Information',
    body: [
      'Q Labs Diagnostics',
      'Shaikpet, Hyderabad',
      'Phone: +91 9063222152',
      'Phone: +91 8520004903',
    ],
  },
];
