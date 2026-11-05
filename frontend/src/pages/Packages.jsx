
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";

import {
    Camera,
    Clock,
    Image,
    ArrowRight,
    CheckCircle,
    Sparkles
} from "lucide-react";

function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/packages`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Unable to fetch packages");
                }
                return response.json();
            })
            .then((data) => {
                setPackages(data.packages || []);
            })
            .catch((err) => {
                console.error("Packages error:", err);
                setError("Unable to load packages. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleCustomBooking = (event) => {
        event.preventDefault();

        alert(
            "Thank you! Custom booking form is ready for backend integration."
        );
    };

    return (
        <main className="packages-page">

            {/* PAGE HERO */}

            <section className="packages-hero">
                <div className="packages-hero-content">

                    <div className="section-label">
                        <Sparkles size={15} />
                        OUR PHOTOGRAPHY SERVICES
                    </div>

                    <h1>
                        Choose Your
                        <br />
                        Perfect <span>Photoshoot.</span>
                    </h1>

                    <p>
                        Every moment deserves to be captured beautifully.
                        Explore our photography services or create a custom
                        photoshoot experience.
                    </p>

                    <a href="#package-list" className="gold-button">
                        Explore Packages <ArrowRight size={18} />
                    </a>

                </div>
            </section>

            {/* PACKAGES */}

            <section
                className="packages-section section"
                id="package-list"
            >

                <div className="section-label">
                    FIND YOUR PERFECT SHOOT
                </div>

                <h2>
                    Photography <span>Packages</span>
                </h2>

                <p className="packages-intro">
                    Choose a photography category that matches your special occasion.
                </p>

                {loading && (
                    <p>Loading packages...</p>
                )}

                {error && (
                    <p>{error}</p>
                )}

                {!loading && !error && packages.length === 0 && (
                    <p>No packages available at the moment.</p>
                )}

                {!loading && !error && packages.length > 0 && (
                    <div className="packages-grid">

                        {packages.map((item) => (

                            <article
                                className="package-card"
                                key={item.id}
                            >

                                <div className="package-image">

                                    <img
                                        src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900"
                                        alt={item.name}
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />

                                    <span className="package-category">
                                        PHOTOGRAPHY
                                    </span>

                                </div>

                                <div className="package-details">

                                    <h3>{item.name}</h3>

                                    <p>{item.description}</p>

                                    <div className="package-features">

                                        <span>
                                            <Clock size={16} />
                                            {item.duration}
                                        </span>

                                        <span>
                                            <Image size={16} />
                                            Professional Photography
                                        </span>

                                    </div>

                                    <div className="package-price">

                                        <div>
                                            <small>PRICING</small>

                                            <h4>
                                                ₹{Number(item.price).toLocaleString("en-IN")}
                                            </h4>
                                        </div>

                                        <Link
                                            to={`/booking?packageId=${item.id}`}
                                            className="package-arrow"
                                            aria-label={`Book ${item.name}`}
                                        >
                                            <ArrowRight size={20} />
                                        </Link>

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>
                )}

            </section>

            {/* CUSTOM BOOKING */}

            <section
                className="custom-booking section"
                id="custom-booking"
            >

                <div className="custom-booking-info">

                    <div className="section-label">
                        <Camera size={16} />
                        CUSTOM PHOTOSHOOT
                    </div>

                    <h2>
                        Have Something
                        <br />
                        <span>Special in Mind?</span>
                    </h2>

                    <p>
                        Not finding what you are looking for?
                        Tell us your requirements. We'll help you plan
                        a photoshoot that matches your vision and budget.
                    </p>

                    <div className="custom-benefit">
                        <CheckCircle size={18} />
                        Personalized photography experience
                    </div>

                    <div className="custom-benefit">
                        <CheckCircle size={18} />
                        Flexible packages and scheduling
                    </div>

                    <div className="custom-benefit">
                        <CheckCircle size={18} />
                        Custom quotation based on requirements
                    </div>

                </div>

                <form
                    className="custom-form"
                    onSubmit={handleCustomBooking}
                >

                    <h3>Request a Photoshoot</h3>

                    <label>Your Name</label>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        required
                    />

                    <label>Phone Number</label>

                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        pattern="[0-9]{10}"
                        title="Enter a valid 10-digit phone number"
                        required
                    />

                    <label>Photoshoot Type</label>

                    <select required defaultValue="">
                        <option value="" disabled>
                            Select a category
                        </option>

                        {packages.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <label>Preferred Date</label>

                    <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                    />

                    <label>Tell Us About Your Requirements</label>

                    <textarea
                        placeholder="Describe your photoshoot requirements..."
                        rows="4"
                        required
                    />

                    <button
                        type="submit"
                        className="gold-button form-submit"
                    >
                        Submit Enquiry <ArrowRight size={18} />
                    </button>

                </form>

            </section>

        </main>
    );
}

export default Packages;
