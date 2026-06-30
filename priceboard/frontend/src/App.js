import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PriceBoard from './pages/PriceBoard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SalesEntry from './pages/SalesEntry';
import SalesDashboard from './pages/SalesDashboard';
import './index.css';

function PrivateRoute({ children }) {
  return localStorage.getItem('pb_token') ? children : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<PriceBoard />} />
        <Route path="/sales" element={<SalesEntry />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/sales" element={<PrivateRoute><SalesDashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
