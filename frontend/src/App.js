import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SmartCaneDashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login/Login';
import SignUp from './pages/Auth/SignUp/SignUp';
import VerifyEmail from './pages/Auth/VerifyEmail/VerifyEmail';

// --- 1. IMPORT THƯ VIỆN TOAST ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS bắt buộc
// --------------------------------

function App() {
  const isAuthenticated = true; 

  return (
    <BrowserRouter>
      {/* --- 2. ĐẶT TOAST CONTAINER Ở ĐÂY --- */}
      {/* autoClose={3000}: Tự tắt sau 3 giây */}
      {/* theme="colored": Dùng màu nền đậm (Xanh/Đỏ) cho đẹp */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <Routes>
        <Route path="/" element={isAuthenticated ? <SmartCaneDashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;