import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

// User Pages
import Login from './pages/Auth/Login/Login.jsx';
import SignUp from './pages/Auth/SignUp/SignUp.jsx';
import VerifyEmail from './pages/Auth/VerifyEmail/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout.jsx';
import AdminStats from './pages/Admin/AdminStats.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminDevices from './pages/Admin/AdminDevices.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role'); // Chúng ta sẽ lưu role vào localStorage lúc login

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Nếu là Admin mà vào trang User -> về Admin Dashboard
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    // Nếu là User mà vào trang Admin -> về User Dashboard
    if (role === 'CAREGIVER') return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<VerifyEmail />} />

        {/* User Routes (Caregiver) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRole="CAREGIVER">
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminStats />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="devices" element={<AdminDevices />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;