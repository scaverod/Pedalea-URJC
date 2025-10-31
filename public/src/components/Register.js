import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // After showing the success message, auto-redirect to login after a short delay
  useEffect(() => {
    if (!message) return;
  // 5-second countdown for UX feedback
  setCountdown(5);
    const tick = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    // Try client-side navigation first
    const t1 = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 5000);
    // Fallback: hard redirect in case client-side routing is blocked (avoid in test/jsdom)
    const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');
    const t2 = isJsdom ? null : setTimeout(() => {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }, 6000);
    return () => {
      clearInterval(tick);
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [message, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Inform the user they must verify email before first login and auto-redirect to login
        let successText = '¡Registro exitoso! Para iniciar sesión por primera vez valida primero tu correo. Te hemos enviado un email de verificación.';
        if (data && data.message) {
          successText = `${data.message} Para iniciar sesión por primera vez valida primero tu correo.`;
        }
        setMessage(successText);
      } else {
        setError(data.message || 'El registro ha fallado.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error de red o el servidor no responde.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-header">Registrarse</div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          {message && (
            <div className="alert-success">
              {message} Serás redirigido al inicio de sesión en {countdown || 1} s…
            </div>
          )}
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
            <label htmlFor="usernameInput" className="form-label">Nombre de Usuario</label>
            <input
              type="text"
              className="form-input"
              id="usernameInput"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          <button type="submit" className="auth-button">Registrarse</button>
        </form>
        <Link to="/login" className="auth-link">¿Ya tienes cuenta? Inicia Sesión</Link>
      </div>
    </div>
  );
}

export default Register;