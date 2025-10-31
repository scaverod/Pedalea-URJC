import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function EmailVerified() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/login', { replace: true }), 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="auth-container" style={{ textAlign: 'center' }}>
      <div className="auth-card">
        <img src="/logo.png" alt="logo" style={{ width: 96, height: 96, margin: '0 auto 12px', display: 'block' }} />
        <div className="auth-card-header">¡Enhorabuena!</div>
        <p>Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.</p>
        <Link to="/login" className="auth-button" style={{ display: 'inline-block', textDecoration: 'none' }}>Ir al inicio de sesión</Link>
        <div className="muted" style={{ marginTop: 8 }}>Te redirigiremos automáticamente en 5 segundos…</div>
      </div>
    </div>
  );
}
