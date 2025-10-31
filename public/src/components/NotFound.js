import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    // Inicia cuenta atrás y redirección automática al inicio
    setCountdown(5);
    const tick = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    // Navegación SPA
    const t1 = setTimeout(() => {
      navigate('/', { replace: true });
    }, 5000);

    // Fallback hard redirect (evitar en tests/jsdom)
    const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');
    const t2 = isJsdom
      ? null
      : setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.assign('/');
          }
        }, 6000);

    return () => {
      clearInterval(tick);
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [navigate]);
  return (
    <div className="auth-container" style={{ textAlign: 'center' }}>
      <div className="auth-card">
        <img src="/logo.png" alt="logo" style={{ width: 96, height: 96, margin: '0 auto 12px', display: 'block' }} />
        <div className="auth-card-header">¡Uy! Ruta no encontrada</div>
        <p>
          El camino por el que intentas ir en bici es peligroso.
          <br />
          ¿Por qué no vas por una ruta más segura?
        </p>
        <div style={{ marginTop: 8, color: '#5f6b7a' }}>
          Redirigiendo al inicio en {countdown || 1} s…
        </div>
        {/* Ilustración 404 bajo el texto */}
        <img
          src="/images/404-bici.png"
          alt="Señal de peligro y bicicleta"
          style={{
            display: 'block',
            margin: '16px auto 0',
            maxWidth: 360,
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
}
