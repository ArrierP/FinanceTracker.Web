import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
