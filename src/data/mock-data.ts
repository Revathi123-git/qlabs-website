import type { Branch, Faq, HealthPackage, LabTest } from '@/types';

export const LAB_TESTS: LabTest[] = [
  { id: 'cbc', name: 'Complete Blood Count', category: 'Routine', price: 450, prep: 'No preparation', turnaround: 'Same day', featured: true },
  { id: 'thyroid', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Hormones', price: 650, prep: 'No preparation', turnaround: '24 hours', featured: true },
  { id: 'hba1c', name: 'HbA1c (Diabetes Marker)', category: 'Diabetes', price: 550, prep: 'No preparation', turnaround: 'Same day', featured: true },
  { id: 'lipid', name: 'Lipid Profile', category: 'Heart health', price: 700, prep: '10–12 hr fasting', turnaround: '24 hours' },
  { id: 'b12', name: 'Vitamin B12', category: 'Vitamins', price: 950, prep: 'No preparation', turnaround: '48 hours' },
  { id: 'liver', name: 'Liver Function Test', category: 'Routine', price: 850, prep: '8 hr fasting preferred', turnaround: '24 hours' },
  { id: 'kidney', name: 'Kidney Function Test', category: 'Routine', price: 750, prep: 'No preparation', turnaround: '24 hours' },
  { id: 'vitd', name: 'Vitamin D (25-OH)', category: 'Vitamins', price: 900, prep: 'No preparation', turnaround: '48 hours' },
];

export const HEALTH_PACKAGES: HealthPackage[] = [
  {
    id: 'full-body',
    title: 'Full Body Essential',
    description: 'A thoughtful baseline for everyday wellness, covering blood, liver, kidney and thyroid health.',
    testCount: 68,
    price: 1499,
    originalPrice: 2299,
    highlights: ['Complete blood count', 'Liver and kidney panel', 'Thyroid profile', 'Free home collection'],
  },
  {
    id: 'diabetes',
    title: 'Diabetes Care',
    description: 'Track the markers that matter most for blood sugar control and long-term metabolic health.',
    testCount: 42,
    price: 999,
    originalPrice: 1499,
    highlights: ['HbA1c and fasting glucose', 'Kidney function screen', 'Lipid profile', 'Vitamin B12'],
  },
  {
    id: 'heart',
    title: 'Heart Smart',
    description: 'A closer look at cholesterol, inflammation and cardiovascular risk markers.',
    testCount: 36,
    price: 1199,
    originalPrice: 1799,
    highlights: ['Advanced lipid profile', 'hs-CRP inflammation marker', 'Electrolytes', 'Homocysteine'],
  },
  {
    id: 'senior',
    title: 'Senior Wellness',
    description: 'Complete care designed for adults over 60, including bone, vitamin and organ health.',
    testCount: 85,
    price: 2499,
    originalPrice: 3499,
    highlights: ['Vitamin D and B12', 'Bone profile', 'Full organ function', 'Urine analysis'],
  },
];

export const FAQS: Faq[] = [
  {
    question: 'Do I need to fast before my tests?',
    answer: 'It depends on the test. Your booking summary shows any preparation needed, and our collection partner will remind you before the visit.',
  },
  {
    question: 'How do home collections work?',
    answer: 'Choose home collection while booking, select a convenient slot, and a trained phlebotomist will visit your address with everything needed.',
  },
  {
    question: 'When will I receive my reports?',
    answer: 'Most routine reports are ready the same day or within 24 hours. Specialised tests may take up to 48 hours, and we notify you when they are ready.',
  },
];

export const BRANCHES: Branch[] = [
  { name: 'Q Labs Diagnostics, Shaikpet', address: 'Shaikpet, Hyderabad', hours: '7:00 AM – 8:00 PM' },
];


export const TIME_SLOTS = [
  '8:00 AM – 9:00 AM',
  '10:00 AM – 11:00 AM',
  '12:00 PM – 1:00 PM',
  '3:00 PM – 4:00 PM',
  '5:00 PM – 6:00 PM',
];

export const BOOKING_DATES = ['Tomorrow, 24 Oct', 'Fri, 25 Oct', 'Sat, 26 Oct'];

export const TEST_CATEGORIES = ['All', 'Routine', 'Diabetes', 'Heart health', 'Hormones', 'Vitamins'] as const;

export const SITE_CONTACT = {
  phones: ['+91 9063222152', '+91 8520004903'],
  email: 'support.qlabs@qlabsdiagnostics.com',
  address: 'Shaikpet, Hyderabad',
  hours: 'Open Mon–Sun, 7:00 AM – 8:00 PM',
};


export const IMAGES = {
  bannerWide: '/banner.webp',
  testTubes: '/baanner.webp',
  lab: 'https://images.pexels.com/photos/9574409/pexels-photo-9574409.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  doctor: 'https://images.pexels.com/photos/7578797/pexels-photo-7578797.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};
