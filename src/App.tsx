
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BookingProvider } from '@/context/BookingProvider';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';

import { HomePage } from '@/pages/HomePage';
import { TestsPage } from '@/pages/TestsPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { AboutPage } from '@/pages/AboutPage';
import { LocationsPage } from '@/pages/LocationsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ContactPage } from '@/pages/ContactPage';
import { TermsPage } from '@/pages/TermsPage';

function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <Routes>
          {/* Public website routes */}
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

          {/* Admin routes - AdminLayout manages all admin pages */}
          <Route path="admin/*" element={<AdminLayout />} />

          {/* Redirect unknown routes to the homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BookingProvider>
    </BrowserRouter>
  );
}

export default App;
