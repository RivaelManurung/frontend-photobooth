import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { PhotoboothProvider } from './context/PhotoboothContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts

import AdminLayout from './components/layout/AdminLayout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Photos from './pages/admin/Photos';
import PhotoDetails from './pages/admin/PhotoDetails';
import Templates from './pages/admin/Templates';
import TemplateDetails from './pages/admin/TemplateDetails';
import TemplateCreate from './pages/admin/TemplateCreate';

import Payments from './pages/admin/Payments';
import PaymentDetails from './pages/admin/PaymentDetails';
import Promos from './pages/admin/Promos';
import PromoCreate from './pages/admin/PromoCreate';
import PromoDetails from './pages/admin/PromoDetails';
import Sessions from './pages/admin/Sessions';
import SessionDetails from './pages/admin/SessionDetails';
import Settings from './pages/admin/Settings';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import Health from './pages/admin/Health';

import UserDetails from './pages/admin/UserDetails';


// User Pages
import Landing from './pages/user/Landing';
import LayoutSelection from './pages/user/LayoutSelection';
import StyleSelection from './pages/user/StyleSelection';
import PhotoBooth from './pages/user/PhotoBooth';
import Result from './pages/user/Result';
import Gallery from './pages/user/Gallery';
import Features from './pages/user/Features';
import AboutUs from './pages/user/AboutUs';
import ContactUs from './pages/user/ContactUs';
import TermsOfService from './pages/user/TermsOfService';
import PrivacyPolicy from './pages/user/PrivacyPolicy';
import Profile from './pages/user/Profile';
import OrderHistory from './pages/user/OrderHistory';
import Packages from './pages/user/Packages';
import Checkout from './pages/user/Checkout';
import { usePhotobooth } from './context/PhotoboothContext';

// Shared & Auth
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Paid Route Component for Photobooth Flow
const PaidRoute = ({ children }) => {
  const { paymentVerified } = usePhotobooth();
  if (!paymentVerified) return <Navigate to="/packages" replace />;
  return children;
};

/**
 * User-facing photobooth flow.
 * State is managed via PhotoboothContext — no prop drilling needed.
 */
function UserFlow() {
  return (
    <Routes>
      <Route path="/"        element={<Landing />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/checkout/:packageId" element={<Checkout />} />
      
      {/* Protected Photobooth Flow */}
      <Route path="/layout"  element={<PaidRoute><LayoutSelection /></PaidRoute>} />
      <Route path="/style"   element={<PaidRoute><StyleSelection /></PaidRoute>} />
      <Route path="/booth"   element={<PaidRoute><PhotoBooth /></PaidRoute>} />
      <Route path="/result"  element={<PaidRoute><Result /></PaidRoute>} />
      
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/features" element={<Features />} />
      <Route path="/about"    element={<AboutUs />} />
      <Route path="/contact"  element={<ContactUs />} />
      <Route path="/terms"    element={<TermsOfService />} />
      <Route path="/privacy"  element={<PrivacyPolicy />} />
      <Route path="/profile"  element={<Profile />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="*"         element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PhotoboothProvider>
          <BrowserRouter>
            <Routes>
              {/* Login */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="users/:id" element={<UserDetails />} />
                <Route path="photos" element={<Photos />} />
                <Route path="photos/:id" element={<PhotoDetails />} />

                <Route path="templates" element={<Templates />} />
                <Route path="templates/:id" element={<TemplateDetails />} />
                <Route path="templates/create" element={<TemplateCreate />} />
                <Route path="templates/edit/:id" element={<TemplateCreate />} />

                <Route path="payments" element={<Payments />} />
                <Route path="payments/:id" element={<PaymentDetails />} />
                <Route path="promos" element={<Promos />} />
                <Route path="promos/create" element={<PromoCreate />} />
                <Route path="promos/:id" element={<PromoDetails />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="sessions/:id" element={<SessionDetails />} />

                <Route path="reports" element={<Reports />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="health" element={<Health />} />

                <Route path="settings" element={<Settings />} />
                <Route path="settings/profile" element={<Settings />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* User Routes */}
              <Route path="/*" element={<UserFlow />} />
            </Routes>
          </BrowserRouter>
        </PhotoboothProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}


export default App;
