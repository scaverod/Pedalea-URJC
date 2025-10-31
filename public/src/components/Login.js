import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New state for success messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success messages

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccessMessage('Inicio de sesión correcto. Redirigiendo...'); // Set success message
        setTimeout(() => navigate('/profile'), 650);
      } else {
        setError(data.message || 'Error de inicio de sesión');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de red o el servidor no responde.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-header">Iniciar Sesión</div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          {successMessage && <div className="alert-success">{successMessage}</div>} {/* Render success message */}
          <div className="form-group">
            <label htmlFor="emailInput" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              id="emailInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordInput" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Acceder</button>
        </form>
        <Link to="/forgot-password" className="auth-link">¿Olvidaste tu contraseña?</Link>
        <Link to="/register" className="auth-link">¿No tienes cuenta? Regístrate</Link>
      </div>
    </div>
  );
}

export default Login;