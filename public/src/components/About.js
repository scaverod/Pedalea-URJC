import React from 'react';

export default function About() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-header">Acerca de Pedalea URJC</div>
        <p>Pedalea URJC es un proyecto académico y comunitario para promover la movilidad sostenible en bicicleta en la Universidad Rey Juan Carlos.</p>
        <p className="muted">Código abierto y en evolución. <a className="link-accent" href="https://github.com/scaverod/Pedalea-URJC" target="_blank" rel="noopener noreferrer">Colabora en GitHub</a>.</p>
      </div>
    </div>
  );
}
