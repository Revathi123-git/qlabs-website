export type TestCategory = string;

export interface LabTest {
  id: string;
  name: string;
  category: TestCategory;
  categories?: string[];
  price: number;
  prep: string;
  turnaround: string;
  sampleType?: string | null;
  featured?: boolean;
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
