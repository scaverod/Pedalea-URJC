import React from 'react';

function Home() {
  return (
    <div className="container mt-5">
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Welcome to URJC pedalea!</h1>
          <p className="col-md-8 fs-4">
            Your platform to create, share, and discover cycling routes within the URJC community.
            Join us to promote cycling, manage suggestions, and participate in our gamification system.
          </p>
          <button className="btn btn-primary btn-lg" type="button">Learn More</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <h2>Explore Routes</h2>
          <p>Discover new and exciting cycling routes shared by the community.</p>
          <p><a className="btn btn-secondary" href="/routes">View details &raquo;</a></p>
        </div>
        <div className="col-md-4">
          <h2>Share Your Rides</h2>
          <p>Create and upload your own GPX routes to share with other cyclists.</p>
          <p><a className="btn btn-secondary" href="/upload">View details &raquo;</a></p>
        </div>
        <div className="col-md-4">
          <h2>Community & Gamification</h2>
          <p>Engage with the community, suggest improvements, and earn points!</p>
          <p><a className="btn btn-secondary" href="/community">View details &raquo;</a></p>
        </div>
      </div>
    </div>
  );
}

export default Home;