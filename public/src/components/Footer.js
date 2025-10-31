import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <nav className="footer-links" aria-label="Enlaces de utilidad">
          <Link to="/acerca">Acerca</Link>
          <span className="dot">·</span>
          <Link to="/legal">Legal</Link>
          <span className="dot">·</span>
          <a href="https://github.com/scaverod/Pedalea-URJC" target="_blank" rel="noopener noreferrer">Colabora</a>
        </nav>

        <div className="footer-meta">
          <div className="copy">© {year} URJC pedalea</div>
          <p className="author">
            Desarrollado por <strong>Sergio Cavero</strong>
            <span className="author-links">
              <a href="https://github.com/scaverod" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub de Sergio Cavero">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.8-.25.8-.56l-.02-2.03c-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.18.08 1.8 1.22 1.8 1.22 1.04 1.78 2.73 1.26 3.4.97.1-.76.4-1.26.73-1.55-2.56-.3-5.25-1.28-5.25-5.7 0-1.26.45-2.28 1.2-3.08-.12-.3-.52-1.5.12-3.12 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.82 0c2.22-1.49 3.2-1.18 3.2-1.18.64 1.62.24 2.82.12 3.12.76.8 1.2 1.82 1.2 3.08 0 4.43-2.7 5.4-5.27 5.7.41.36.78 1.08.78 2.18l-.02 3.24c0 .31.22.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.86 18.14.5 12 .5z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/sergio-cavero" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn de Sergio Cavero">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.5v8.5h2.5v-4.74c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.74h2.5M6.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m1.5 1h-3V19h3V9z"></path>
                </svg>
              </a>
              <a href="mailto:sergio.cavero@urjc.es" title="Email" aria-label="Enviar correo a Sergio Cavero">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4-8 5-8-5V6l8 5 8-5z"></path>
                </svg>
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
