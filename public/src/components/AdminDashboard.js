import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Helper to fetch and safely parse JSON, falling back to text if necessary
  const safeFetch = async (url, options) => {
    const res = await fetch(url, options);
    let payload;
    try {
      payload = await res.json();
    } catch (e) {
      try {
        const text = await res.text();
        payload = { message: text };
      } catch (e2) {
        payload = { message: 'No response body' };
      }
    }
    return { res, payload };
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        // Verify current user from authoritative endpoint
        const meRes = await fetch('/api/auth/me', { headers: { 'x-auth-token': token } });
        if (!meRes.ok) {
          navigate('/login');
          return;
        }
        const me = await meRes.json();
        if (me.role !== 'ROLE_ADMIN') {
          setError('You do not have permission to view this page.');
          return;
        }

        const response = await fetch('/api/users', {
          headers: {
            'x-auth-token': token,
          },
        });

        if (response.status === 403) {
          setError('You do not have permission to view this page.');
          return;
        }

        const data = await response.json();

        if (response.ok) {
          setUsers(data);
        } else {
          setError(data.message || 'Failed to fetch users.');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Network error or server is unreachable.');
      }
    };

    fetchUsers();
  }, [navigate]);

  if (error) {
    return <div className="container mt-5"><div className="text-danger">{error}</div></div>;
  }

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard - User Management</h2>
      {message && <div className="text-success mt-2">{message}</div>}
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button type="button" className="btn btn-sm btn-info me-2" onClick={async () => {
                  // Simple inline edit: prompt for username and role, then call API
                  const token = localStorage.getItem('token');
                  const newUsername = window.prompt('New username', user.username || '');
                  if (newUsername === null) return; // cancelled
                  const newRole = window.prompt('Role (e.g. ROLE_USER or ROLE_ADMIN)', user.role || 'ROLE_USER');
                  if (newRole === null) return;
                  try {
                    setMessage('');
                    const res = await fetch(`/api/users/${user.id}`, { method: 'PUT', headers: { 'x-auth-token': token, 'Content-Type': 'application/json' }, body: JSON.stringify({ username: newUsername, role: newRole }) });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to update user');
                    setUsers(users.map(u => u.id === user.id ? { ...u, username: newUsername, role: newRole } : u));
                    setMessage(data.message || 'User updated');
                  } catch (err) {
                    console.error('Update user error:', err);
                    setMessage(err.message || 'Error updating user');
                  }
                }}>Edit</button>
                <button type="button" className="btn btn-sm btn-secondary me-2" onClick={async () => {
                  const token = localStorage.getItem('token');
                  setMessage('');
                  try {
                    const { res, payload } = await safeFetch(`/api/users/${user.id}/resend-verification`, { method: 'POST', headers: { 'x-auth-token': token } });
                    setMessage(payload.message || (res.ok ? 'Verification resent.' : 'Error resending verification'));
                  } catch (err) {
                    console.error('Resend verification error:', err);
                    setMessage('Network error while resending verification.');
                  }
                }}>Resend verification</button>
                <button className="btn btn-sm btn-warning me-2" onClick={async () => {
                  const token = localStorage.getItem('token');
                  try {
                    const { res, payload } = await safeFetch(`/api/users/${user.id}/send-reset`, { method: 'POST', headers: { 'x-auth-token': token } });
                    setMessage(payload.message || (res.ok ? 'Reset sent.' : 'Error sending reset'));
                  } catch (err) {
                    console.error('Send reset error:', err);
                    setMessage('Network error while sending reset.');
                  }
                }}>Send reset</button>
                <button type="button" className="btn btn-sm btn-danger me-2" onClick={async () => {
                  const token = localStorage.getItem('token');
                  if (!confirm('Really delete this user?')) return;
                  try {
                    setMessage('');
                    const { res, payload } = await safeFetch(`/api/users/${user.id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
                    if (!res.ok) throw new Error(payload.message || 'Failed to delete user');
                    setMessage(payload.message || 'User deleted.');
                    // Refresh list
                    setUsers(users.filter(u => u.id !== user.id));
                  } catch (err) {
                    console.error('Delete user error:', err);
                    setMessage(err.message || 'Error deleting user');
                  }
                }}>Delete</button>
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={async () => {
                  const token = localStorage.getItem('token');
                  setMessage('');
                  try {
                    const { res, payload } = await safeFetch(`/api/users/${user.id}/suspend`, { method: 'POST', headers: { 'x-auth-token': token, 'Content-Type': 'application/json' }, body: JSON.stringify({ suspend: !user.suspended }) });
                    setMessage(payload.message || (res.ok ? 'User updated.' : 'Error updating user'));
                    // Update local state
                    setUsers(users.map(u => u.id === user.id ? { ...u, suspended: user.suspended ? 0 : 1 } : u));
                  } catch (err) {
                    console.error('Suspend error:', err);
                    setMessage('Network error while updating user.');
                  }
                }}>{user.suspended ? 'Unsuspend' : 'Suspend'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
