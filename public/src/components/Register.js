import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
        // Inform the user they must verify email before first login
        let successText = '¡Registro exitoso! Para iniciar sesión por primera vez, valida primero tu correo. Te hemos enviado un email de verificación.';
        if (data && data.message) {
          successText = `${data.message} Para iniciar sesión por primera vez, valida primero tu correo.`;
        }
        setMessage(successText);
        // Do NOT automatically redirect to login: require email verification first
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error or server is unreachable.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-header">Registrarse</div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
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