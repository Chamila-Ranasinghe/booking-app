import "../css/Home.scss";

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Live Availability — Book Instantly</div>
          <h1>
            PLAY<span className="accent">YOUR</span>GAME.
          </h1>
          <p className="hero-sub">
            Discover and instantly book premium softball pitches near you.
            Flexible slots, floodlit fields, and all-weather surfaces — ready
            when you are.
          </p>
        </div>

      
        <div className="hero-visual">
          <div className="stat-card">
            <div className="stat-number">3+</div>
            <div className="stat-label">Premium Pitches</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50+</div>
            <div className="stat-label">Bookings Made</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </section>
    </div>
  );
}
