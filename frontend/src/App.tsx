import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Policies from './pages/Policies';
import Installments from './pages/Installments';
import Renewals from './pages/Renewals';
import Underwriters from './pages/Underwriters';
import Claims from './pages/Claims';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading Hermliz IBMS...</p>
      </div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
      <Route path="/clients/:id" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
      <Route path="/policies" element={<PrivateRoute><Policies /></PrivateRoute>} />
      <Route path="/installments" element={<PrivateRoute><Installments /></PrivateRoute>} />
      <Route path="/renewals" element={<PrivateRoute><Renewals /></PrivateRoute>} />
      <Route path="/underwriters" element={<PrivateRoute><Underwriters /></PrivateRoute>} />
      <Route path="/claims" element={<PrivateRoute><Claims /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
