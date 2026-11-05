import {
  Camera,
  Smartphone,
  Video,
  Heart,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

import "./About.css";

function About() {
  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">
            <Sparkles size={16} /> ABOUT PRL SHOOTS
          </span>

          <h1>
            Every Frame Has
            <br />
            <span>A Story.</span>
          </h1>

          <p>
            We capture emotions, celebrate moments and turn
            beautiful memories into timeless stories.
          </p>

          <a href="#our-equipment" className="about-explore">
            Explore Our Studio <ArrowUpRight size={18} />
          </a>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="about-intro">
        <span className="about-label">WHO WE ARE</span>

        <h2>
          More Than Photography.
          <br />
          <span>It's An Experience.</span>
        </h2>

        <p>
          At PRL SHOOTS, we believe every moment deserves
          to be remembered. We bring creativity, passion
          and attention to detail to every shoot.
        </p>

        <div className="about-values">
          <div>
            <Camera size={30} />
            <h3>Creative Vision</h3>
            <p>Unique perspectives for every moment.</p>
          </div>

          <div>
            <Heart size={30} />
            <h3>Passion</h3>
            <p>Capturing genuine emotions and stories.</p>
          </div>

          <div>
            <Sparkles size={30} />
            <h3>Quality</h3>
            <p>Beautifully captured memories.</p>
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="equipment-section" id="our-equipment">
        <span className="about-label">OUR GEAR</span>

        <h2>
          The Tools Behind
          <br />
          <span>Every Frame.</span>
        </h2>

        <p className="equipment-description">
          Our equipment helps us bring every creative idea to life.
        </p>

        <div className="equipment-grid">

          <article className="equipment-card">
            <div className="equipment-icon">
              <Smartphone size={38} />
            </div>

            <span>OUR CAMERA</span>
            <h3>iPhone 17 Pro</h3>

            <p>
              Our primary camera for capturing beautiful
              photographs and cinematic videos.
            </p>
          </article>

          <article className="equipment-card">
            <div className="equipment-icon">
              <Video size={38} />
            </div>

            <span>OUR STABILIZER</span>
            <h3>DJI Osmo Mobile 7</h3>

            <p>
              Smooth and stable footage for dynamic videos
              and creative camera movements.
            </p>
          </article>

        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="about-instagram">
        <div className="instagram-content">
          <Camera size={42} />

          <span className="about-label">FOLLOW OUR JOURNEY</span>

          <h2>
            Moments. Stories.
            <br />
            <span>On Instagram.</span>
          </h2>

          <p>
            Explore our latest shoots, creative work
            and behind-the-scenes moments.
          </p>

          <a
            href="https://www.instagram.com/prl_shoots.in/"
            target="_blank"
            rel="noreferrer"
            className="instagram-button"
          >
            Follow @prl_shoots.in
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>

    </main>
  );
}

export default About;
