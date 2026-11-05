
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Camera } from "lucide-react";
import "./ServiceReels.css";

const API_URL = "http://127.0.0.1:5000";

const serviceDetails = {
  "wedding-photography": {
    title: "Wedding Photography",
    category: "Wedding Photography",
    description: "Beautiful wedding moments captured forever.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
  },

  "birthday-photography": {
    title: "Birthday Shoots",
    category: "Birthday Photography",
    description: "Celebrate your special moments with us.",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900",
  },

  "vehicle-delivery": {
    title: "Vehicle Delivery",
    category: "Vehicle Delivery",
    description: "Capture the joy of your new vehicle delivery.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900",
  },
};

function getDriveEmbedUrl(url) {
  if (!url) return "";

  const match = url.match(
    /(?:\/file\/d\/|id=)([a-zA-Z0-9_-]+)/
  );

  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  return url;
}

function ServiceReels() {
  const { category } = useParams();

  const service = serviceDetails[category];

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReel, setSelectedReel] = useState(null);

  useEffect(() => {
    if (!service) {
      setLoading(false);
      return;
    }

    const fetchReels = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/reels`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load reels");
        }

        const allReels = data.reels || [];

        const filteredReels = allReels.filter(
          (reel) =>
            reel.category?.trim().toLowerCase() ===
            service.category.toLowerCase()
        );

        setReels(filteredReels);
      } catch (err) {
        setError(
          err.message || "Unable to connect to the server"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, [category]);

  if (!service) {
    return (
      <div className="reels-page">
        <h2>Category not found</h2>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="reels-page">
      <section className="reels-hero">
        <div className="reels-hero-content">
          <Link to="/" className="reels-back-link">
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <span className="reels-label">
            <Camera size={16} />
            PRL SHOOTS
          </span>

          <h1>{service.title}</h1>
          <p>{service.description}</p>
        </div>
      </section>

      <section className="reels-gallery">
        <div className="reels-heading">
          <div>
            <span className="reels-label">
              OUR COLLECTION
            </span>

            <h2>
              Explore <span>Reels</span>
            </h2>
          </div>
        </div>

        {loading && (
          <div className="reels-message">
            Loading reels...
          </div>
        )}

        {!loading && error && (
          <div className="reels-message error">
            {error}
          </div>
        )}

        {!loading && !error && reels.length === 0 && (
          <div className="reels-empty">
            <Camera size={38} />

            <h3>No reels uploaded yet</h3>

            <p>
              Reels for {service.title} will appear here
              once uploaded by the admin.
            </p>
          </div>
        )}

        {!loading && !error && reels.length > 0 && (
          <div className="reels-grid">
            {reels.map((reel) => (
              <button
                type="button"
                className="reel-card"
                key={reel.id}
                onClick={() => setSelectedReel(reel)}
              >
                <img
                  src={service.image}
                  alt={reel.title}
                  className="reel-thumbnail"
                />

                <div className="reel-card-overlay">
                  <span className="reel-play-button">
                    <Play size={25} fill="currentColor" />
                  </span>

                  <div className="reel-card-title">
                    <span>{reel.category}</span>
                    <h3>{reel.title}</h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedReel && (
        <div
          className="reel-modal"
          onClick={() => setSelectedReel(null)}
        >
          <div
            className="reel-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="reel-modal-close"
              onClick={() => setSelectedReel(null)}
              aria-label="Close video"
            >
              ×
            </button>

            <iframe
              src={getDriveEmbedUrl(selectedReel.video_url)}
              title={selectedReel.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceReels;
