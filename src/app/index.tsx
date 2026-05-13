import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Lazy load pages for code splitting
const Login = lazy(() => import('@/modules/auth/pages/LoginPage'));
const Dashboard = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));
const AuditLogs = lazy(() => import('@/modules/audit/pages/AuditLogsPage'));
// ... add more as we migrate

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                {/* Add more admin routes here */}
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        {/* ... user flow routes */}
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
