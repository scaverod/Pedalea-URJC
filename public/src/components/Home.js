import React from 'react';

function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">URJC pedalea</h1>
          <p className="hero-sub">Crea, comparte y descubre rutas ciclistas en la comunidad URJC.</p>
          <div className="hero-ctas">
            <a className="btn" href="/routes">Explorar rutas</a>
            <a className="btn btn-secondary" href="/upload">Sube tu ruta</a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card">
            <div className="pulse" />
          </div>
        </div>
      </section>

      <section>
        <h2>Nuestras Rutas Destacadas</h2>
        <p>Explora algunas de las rutas más populares y mejor valoradas por nuestra comunidad.</p>
        <div className="card-grid">
          <div className="card">
            <h3>Ruta del Campus de Móstoles</h3>
            <p>Un recorrido suave y pintoresco alrededor del campus principal.</p>
            <a className="link-accent" href="/routes/mostoles">Ver ruta →</a>
          </div>
          <div className="card">
            <h3>Camino del Río</h3>
            <p>Una ruta más larga que sigue el curso del río, ideal para ciclistas experimentados.</p>
            <a className="link-accent" href="/routes/rio">Ver ruta →</a>
          </div>
          <div className="card">
            <h3>Parque Coimbra Challenge</h3>
            <p>Desafía tus límites con esta ruta exigente con subidas y bajadas.</p>
            <a className="link-accent" href="/routes/coimbra">Ver ruta →</a>
          </div>
        </div>
      </section>

      <section>
        <h2>Únete a la Comunidad</h2>
        <p>Conecta con otros ciclistas, comparte tus experiencias y participa en eventos.</p>
        <div className="card-grid">
          <div className="card">
            <h3>Eventos y Quedadas</h3>
            <p>Descubre los próximos eventos ciclistas organizados por la URJC.</p>
            <a className="link-accent" href="/events">Ver eventos →</a>
          </div>
          <div className="card">
            <h3>Foro de Discusión</h3>
            <p>Comparte consejos, haz preguntas y conecta con la comunidad.</p>
            <a className="link-accent" href="/forum">Ir al foro →</a>
          </div>
          <div className="card">
            <h3>Gamificación</h3>
            <p>Gana puntos, insignias y sube de nivel participando activamente.</p>
            <a className="link-accent" href="/gamification">Más información →</a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;