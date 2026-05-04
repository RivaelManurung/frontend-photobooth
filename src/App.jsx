import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { PhotoboothProvider } from './context/PhotoboothContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Photos from './pages/admin/Photos';
import Templates from './pages/admin/Templates';
import TemplateCreate from './pages/admin/TemplateCreate';
import Payments from './pages/admin/Payments';
import Promos from './pages/admin/Promos';
import Sessions from './pages/admin/Sessions';
import Settings from './pages/admin/Settings';

// User Pages
import Landing from './pages/user/Landing';
import LayoutSelection from './pages/user/LayoutSelection';
import StyleSelection from './pages/user/StyleSelection';
import PhotoBooth from './pages/user/PhotoBooth';
import Result from './pages/user/Result';
import Gallery from './pages/user/Gallery';
import Features from './pages/user/Features';

// Shared
import Login from './pages/Login';

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
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
      <Route path="/layout"  element={<LayoutSelection />} />
      <Route path="/style"   element={<StyleSelection />} />
      <Route path="/booth"   element={<PhotoBooth />} />
      <Route path="/result"  element={<Result />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/features" element={<Features />} />
    </Routes>
  );
}

function App() {
  return (
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
              <Route path="photos" element={<Photos />} />
              <Route path="templates" element={<Templates />} />
              <Route path="templates/create" element={<TemplateCreate />} />
              <Route path="templates/edit/:id" element={<TemplateCreate />} />
              <Route path="payments" element={<Payments />} />
              <Route path="promos" element={<Promos />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* User Routes */}
            <Route path="/*" element={<UserFlow />} />
          </Routes>
        </BrowserRouter>
      </PhotoboothProvider>
    </ToastProvider>
  );
}

export default App;
