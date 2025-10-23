import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user is logged in, redirect to login page
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleRequestDelete = async () => {
    // Send request to server to email deletion link
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/request-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-auth-token': token } : {}),
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'If an account with that email exists, a deletion link has been sent.');
      } else {
        setError(data.message || 'If an account with that email exists, a deletion link has been sent.');
      }
    } catch (e) {
      console.error('Request delete error:', e);
      setError('Error requesting account deletion.');
    }
  };

  if (!user) {
    return <div className="container mt-5">Loading profile...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">User Profile</div>
            <div className="card-body">
              {error && <div className="text-danger mb-2">{error}</div>}
              {message && <div className="text-success mb-2">{message}</div>}
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <button className="btn btn-danger me-2" onClick={handleLogout}>Logout</button>
              <button className="btn btn-outline-danger" onClick={handleRequestDelete}>Delete account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;