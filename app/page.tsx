import ScrollFrameAnimation from '../components/ScrollFrameAnimation';

export default function Home() {
  return (
    <main>
      {/* Fixed Header with Logo */}
      <header className="fixed-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">R</span>
            <span className="logo-text">RANGE ROVER</span>
          </div>
          <nav className="header-nav">
            <a href="#explore" className="nav-link">Explore</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#gallery" className="nav-link">Gallery</a>
            <button className="cta-button">Book Test Drive</button>
          </nav>
        </div>
      </header>

      {/* Hero Section Overlay */}
      <section className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">BEYOND LUXURY</h1>
          <p className="hero-subtitle">Experience the pinnacle of automotive excellence</p>
          <div className="scroll-indicator">
            <span>Scroll to Explore</span>
            <div className="scroll-arrow"></div>
          </div>
        </div>
      </section>

      {/* Main Animation Component - UNTOUCHED */}
      <ScrollFrameAnimation />

      {/* Content Sections that appear on scroll */}
      <section id="explore" className="content-section section-explore">
        <div className="section-content">
          <h2>REDEFINING EXCELLENCE</h2>
          <p>Where refined luxury meets unparalleled performance. Every curve, every detail, engineered for those who demand nothing but the best.</p>
        </div>
      </section>

      <section id="features" className="content-section section-features">
        <div className="section-content">
          <h2>INNOVATION MEETS ELEGANCE</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Performance</h3>
              <p>Unmatched power with precision engineering</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safety</h3>
              <p>Advanced protection for every journey</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Luxury</h3>
              <p>Hand-crafted interiors of exceptional quality</p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="content-section section-gallery">
        <div className="section-content">
          <h2>DISCOVER MORE</h2>
          <p>Explore the complete collection and find your perfect match.</p>
          <button className="explore-btn">View All Models</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon small">R</span>
            <span className="logo-text small">RANGE ROVER</span>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
          <p className="copyright">© 2025 Range Rover. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
