
import {
  ArrowRight,
  Camera,
  Heart,
  Sparkles,
  CalendarDays,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const services = [
  {
    title: "Wedding Photography",
    category: "WEDDINGS",
    slug: "wedding-photography",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
  },
  {
    title: "Birthday Shoots",
    category: "CELEBRATIONS",
    slug: "birthday-photography",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900",
  },
  {
    title: "Vehicle Delivery",
    category: "VEHICLE CELEBRATIONS",
    slug: "vehicle-delivery",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900",
  },
];

const exploreButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "12px 22px",
  marginTop: "14px",
  backgroundColor: "#d6b875",
  color: "#111111",
  border: "2px solid #d6b875",
  borderRadius: "7px",
  fontSize: "14px",
  fontWeight: "700",
  textDecoration: "none",
  opacity: 1,
  visibility: "visible",
  position: "relative",
  zIndex: 10,
  cursor: "pointer",
  width: "fit-content",
};

function Home() {
  const navigate = useNavigate();

  const openService = (slug) => {
    navigate(`/reels/${slug}`);
  };

  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="hero-tag">
            <Sparkles size={16} />
            PRL SHOOTS
          </span>

          <h1>
            Capturing Moments.
            <br />
            <span>Creating Memories.</span>
          </h1>

          <p>
            Every picture tells a story. We capture your beautiful moments
            and turn them into memories that last forever.
          </p>

          <div className="hero-buttons">
            <Link to="/packages" className="hero-primary-btn">
              Explore Packages
              <ArrowRight size={18} />
            </Link>

            <Link to="/booking" className="hero-secondary-btn">
              Book a Shoot
              <CalendarDays size={18} />
            </Link>
          </div>
        </div>

        <div className="hero-bottom">
          <span>
            <Camera size={16} />
            Photography & Cinematic Reels
          </span>

          <span>Scroll to explore ↓</span>
        </div>
      </section>

      {/* INTRO SECTION */}
      <section className="home-intro">
        <div className="intro-icon">
          <Camera size={28} />
        </div>

        <span className="section-label">
          WELCOME TO PRL SHOOTS
        </span>

        <h2>
          Your Moments.
          <br />
          Our <span>Passion.</span>
        </h2>

        <p>
          From your most special celebrations to everyday beautiful
          moments, PRL SHOOTS brings your memories to life through
          creative photography and cinematic storytelling.
        </p>
      </section>

      {/* SERVICES SECTION */}
      <section className="services-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              WHAT WE CAPTURE
            </span>

            <h2>
              Our <span>Photography</span>
            </h2>
          </div>

          <Link to="/packages" className="view-all-link">
            View Packages
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <article
              className="service-card"
              key={service.slug}
              role="link"
              tabIndex={0}
              aria-label={`Explore ${service.title} reels`}
              onClick={() => openService(service.slug)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  openService(service.slug);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="service-image-wrapper">
                <img
                  src={service.image}
                  alt={service.title}
                  className="service-image"
                  loading="lazy"
                />

                <div className="service-image-overlay"></div>

                <span className="service-number">
                  0{index + 1}
                </span>

                <div className="service-card-content">
                  <span className="service-category">
                    {service.category}
                  </span>

                  <h3>{service.title}</h3>

                  <Link
                    to={`/reels/${service.slug}`}
                    className="service-explore-link"
                    style={exploreButtonStyle}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor =
                        "#f0d18b";

                      event.currentTarget.style.transform =
                        "translateY(-3px)";

                      event.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(214,184,117,0.35)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor =
                        "#d6b875";

                      event.currentTarget.style.transform =
                        "translateY(0)";

                      event.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>Explore Reels</span>
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-us-section">
        <div className="why-us-content">
          <span className="section-label">
            WHY PRL SHOOTS
          </span>

          <h2>
            More Than Just
            <br />
            <span>Photography.</span>
          </h2>

          <p>
            We believe every moment deserves to be remembered.
            Our creative approach, attention to detail, and passion
            for storytelling make every shoot special.
          </p>

          <div className="why-us-features">
            <div className="why-us-feature">
              <Camera size={22} />

              <div>
                <h4>Creative Photography</h4>
                <p>
                  Unique frames with a creative touch.
                </p>
              </div>
            </div>

            <div className="why-us-feature">
              <Heart size={22} />

              <div>
                <h4>Memories That Last</h4>
                <p>
                  Every moment captured with care.
                </p>
              </div>
            </div>

            <div className="why-us-feature">
              <Sparkles size={22} />

              <div>
                <h4>Cinematic Reels</h4>
                <p>
                  Beautiful stories in every frame.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="why-us-image">
          <img
            src="https://images.unsplash.com/photo-1529636798458-92182e662485?w=1000"
            alt="Photography couple"
            loading="lazy"
          />

          <div className="why-us-image-caption">
            <span>PRL SHOOTS</span>
            <p>Making memories unforgettable.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="home-cta-section">
        <div className="cta-content">
          <span className="section-label">
            LET'S CREATE SOMETHING BEAUTIFUL
          </span>

          <h2>
            Your Story Deserves
            <br />
            <span>To Be Captured.</span>
          </h2>

          <p>
            Have a special occasion coming up? Let's make it
            unforgettable with PRL SHOOTS.
          </p>

          <Link
            to="/booking"
            className="cta-booking-btn"
          >
            Book Your Shoot
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;
