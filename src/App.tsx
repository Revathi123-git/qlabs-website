import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BookingProvider } from '@/context/BookingProvider';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AboutPage } from '@/pages/AboutPage';
import { AdminPage } from '@/pages/AdminPage';
import { HomePage } from '@/pages/HomePage';
import { LocationsPage } from '@/pages/LocationsPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ContactPage } from '@/pages/ContactPage';
import { TermsPage } from '@/pages/TermsPage';
import { TestsPage } from '@/pages/TestsPage';

function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tests" element={<TestsPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BookingProvider>
    </BrowserRouter>
  );
}

export default App;
