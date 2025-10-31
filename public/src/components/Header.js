import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // close mobile menu on route change
    setMenuOpen(false);
    setAdminMenuOpen(false);

    const fetchMe = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      // Immediately set user from localStorage if available (for instant UI update)
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          console.error('Error parsing cached user', e);
        }
      }

      try {
        const res = await fetch('/api/auth/me', { headers: { 'x-auth-token': token } });
        if (!res.ok) {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          const u = await res.json();
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u)); // Keep cache fresh
        }
      } catch (e) {
        console.error('Header /api/auth/me error', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <img src="/logo.png" alt="logo" className="brand-logo" />
        <div>
          <div className="brand-title">URJC pedalea</div>
        </div>
      </Link>

      <button
        className="nav-toggle"
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Principal" aria-hidden={!menuOpen && window.innerWidth <= 820}>
        <Link to="/" onClick={() => setMenuOpen(false)} className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
        <Link to="/routes" onClick={() => setMenuOpen(false)} className={`nav-link ${location.pathname === '/routes' ? 'active' : ''}`}>Rutas</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)} className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>Acerca</Link>

        {/* acciones duplicadas para menú móvil (se muestran solo en mobile) */}
        <div className="menu-actions">
          {!loading && !user && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="nav-link">Accede</Link>
            </>
          )}

          {!loading && user && (
            <>
              {user.role === 'ROLE_ADMIN' && (
                <div className="admin-dropdown-mobile">
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className={`btn btn-outline ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>Administración</Link>
                  <div className="admin-submenu-mobile">
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="admin-submenu-item">Usuarios</Link>
                    <span className="admin-submenu-item disabled">Rutas</span>
                    <span className="admin-submenu-item disabled">Blog</span>
                  </div>
                </div>
              )}
              <Link to="/profile" onClick={() => setMenuOpen(false)} className={`btn btn-ghost ${location.pathname === '/profile' ? 'active' : ''}`}>Perfil</Link>
              <button className="btn btn-danger" onClick={() => { setMenuOpen(false); handleLogout(); }}>Salir</button>
            </>
          )}
        </div>
      </nav>

      <div className="actions">
        {!loading && !user && (
          <>
            <Link to="/login" className="nav-link">Accede</Link>
          </>
        )}

        {!loading && user && (
          <>
            {user.role === 'ROLE_ADMIN' && (
              <div className="admin-dropdown">
                <button 
                  className={`btn btn-outline ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  aria-expanded={adminMenuOpen}
                >
                  Administración
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '6px', display: 'inline-block' }}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {adminMenuOpen && (
                  <div className="admin-submenu">
                    <Link to="/admin/users" onClick={() => setAdminMenuOpen(false)} className="admin-submenu-item">Usuarios</Link>
                    <Link to="/admin/routes" onClick={() => setAdminMenuOpen(false)} className="admin-submenu-item disabled">Rutas</Link>
                    <Link to="/admin/blog" onClick={() => setAdminMenuOpen(false)} className="admin-submenu-item disabled">Blog</Link>
                  </div>
                )}
              </div>
            )}
            <Link to="/profile" className={`btn btn-ghost profile-link ${location.pathname === '/profile' ? 'active' : ''}`}>
              <span className="user-avatar" aria-hidden>
                {user.username ? user.username.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
              </span>
              <span className="profile-name">{user.username || user.email}</span>
            </Link>
            <button className="btn btn-danger" onClick={handleLogout}>Salir</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
