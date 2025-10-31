import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ConfirmDelete() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/confirm-delete/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Cuenta eliminada.');
        // Clear local storage and navigate to home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } else {
        setError(data.message || 'No se pudo eliminar la cuenta.');
      }
    } catch (e) {
      console.error('Confirm delete submit error:', e);
      setError('Error del servidor al eliminar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Confirmar eliminación de cuenta</div>
            <div className="card-body">
              {error && <div className="text-danger mb-2">{error}</div>}
              {message && <div className="text-success mb-2">{message}</div>}
              <p>Introduce tu contraseña para confirmar la eliminación de la cuenta. Esta acción es irreversible.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <button className="btn btn-danger" type="submit" disabled={loading}>{loading ? 'Eliminando...' : 'Eliminar mi cuenta'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;
