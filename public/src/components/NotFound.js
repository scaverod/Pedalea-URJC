import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
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
        <Link to="/" className="auth-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
