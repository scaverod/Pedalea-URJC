import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setAuthUser(null);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'x-auth-token': token },
        });
        if (!res.ok) {
          setAuthUser(null);
        } else {
          const u = await res.json();
          setAuthUser(u);
        }
      } catch (e) {
        console.error('Error fetching /api/auth/me:', e);
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  if (loading) return null; // or a spinner

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(authUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
