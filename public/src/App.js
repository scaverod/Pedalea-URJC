import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ConfirmDelete from './components/ConfirmDelete';
import Profile from './components/Profile';
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminRoutes = lazy(() => import('./components/AdminRoutes'));
const AdminBlog = lazy(() => import('./components/AdminBlog'));
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div>
        <Header />

        <Suspense fallback={<div style={{padding:'1rem'}}>Cargando…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/confirm-delete/:token" element={<ConfirmDelete />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/routes"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminBlog />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
