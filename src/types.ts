export type TestCategory = 'Routine' | 'Diabetes' | 'Heart health' | 'Hormones' | 'Vitamins';

export interface LabTest {
  id: string;
  name: string;
  category: TestCategory;
  price: number;
  prep: string;
  turnaround: string;
  featured?: boolean;
}

export interface HealthPackage {
  id: string;
  title: string;
  description: string;
  testCount: number;
  price: number;
  originalPrice: number;
  highlights: string[];
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Branch {
  name: string;
  address: string;
  hours: string;
}

export type CollectionMode = 'home' | 'lab';

export interface PatientDetails {
  name: string;
  phone: string;
  email: string;
}
