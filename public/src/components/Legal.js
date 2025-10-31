import React from 'react';

export default function Legal() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-header">Información legal</div>
        <p>Este sitio es un prototipo académico. Los datos se tratan con fines docentes. Consulta la política de privacidad y los términos de uso cuando estén disponibles.</p>
        <p className="muted">¿Has detectado un problema? Abre una incidencia o <a className="link-accent" href="https://github.com/scaverod/Pedalea-URJC" target="_blank" rel="noopener noreferrer">colabora en GitHub</a>.</p>
      </div>
    </div>
  );
}
