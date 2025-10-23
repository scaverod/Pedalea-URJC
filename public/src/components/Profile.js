import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      alert(data.message || 'If an account with that email exists, a deletion link has been sent.');
    } catch (e) {
      console.error('Request delete error:', e);
      alert('Error requesting account deletion.');
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