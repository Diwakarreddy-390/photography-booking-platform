import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const photos = [
  {
    id: 1,
    title: "Wedding Moments",
    category: "Wedding",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900"
  },
  {
    id: 2,
    title: "Beautiful Celebration",
    category: "Birthday",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900"
  },
  {
    id: 3,
    title: "Fashion Portrait",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900"
  },
  {
    id: 4,
    title: "Love Story",
    category: "Pre-Wedding",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900"
  },
  {
    id: 5,
    title: "Golden Memories",
    category: "Wedding",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900"
  },
  {
    id: 6,
    title: "Creative Portrait",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900"
  },
  {
    id: 7,
    title: "Special Birthday",
    category: "Birthday",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900"
  },
  {
    id: 8,
    title: "Romantic Frames",
    category: "Pre-Wedding",
    image: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900"
  }
];

const categories = [
  "All",
  "Wedding",
  "Birthday",
  "Fashion",
  "Pre-Wedding"
];

function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter(
          (photo) => photo.category === activeCategory
        );

  return (
    <main className="portfolio-page">

      <section className="portfolio-hero">
        <div className="section-label">OUR CREATIVE WORLD</div>

        <h1>
          Every Frame Has
          <br />
          <span>A Story.</span>
        </h1>

        <p>
          Explore our collection of beautiful moments,
          creative portraits and unforgettable memories.
        </p>
      </section>

      <section className="gallery-section section">

        <div className="section-label">OUR PORTFOLIO</div>

        <h2>
          Captured With <span>Passion.</span>
        </h2>

        <div className="gallery-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={
                activeCategory === category ? "filter-active" : ""
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="gallery-grid">

          {filteredPhotos.map((photo) => (
            <article className="gallery-card" key={photo.id}>

              <img src={photo.image} alt={photo.title} />

              <div className="gallery-overlay">
                <div>
                  <span>{photo.category}</span>
                  <h3>{photo.title}</h3>
                </div>

                <ArrowUpRight size={24} />
              </div>

            </article>
          ))}

        </div>

        {filteredPhotos.length === 0 && (
          <p>No photographs available.</p>
        )}

      </section>

      <section className="portfolio-cta section">

        <div className="section-label">YOUR STORY STARTS HERE</div>

        <h2>
          Ready to Create
          <br />
          <span>Your Memories?</span>
        </h2>

        <p>Let's capture something unforgettable together.</p>

        <a href="/packages" className="gold-button">
          Explore Packages
        </a>

      </section>

    </main>
  );
}

export default Portfolio;