import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ConfirmDelete() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
        alert(data.message || 'Account deleted.');
        // Clear local storage and navigate to home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } else {
        alert(data.message || 'Could not delete account.');
      }
    } catch (e) {
      console.error('Confirm delete submit error:', e);
      alert('Server error while deleting account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Confirm Account Deletion</div>
            <div className="card-body">
              <p>Please enter your password to confirm account deletion. This action is irreversible.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <button className="btn btn-danger" type="submit" disabled={loading}>{loading ? 'Deleting...' : 'Delete my account'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;
