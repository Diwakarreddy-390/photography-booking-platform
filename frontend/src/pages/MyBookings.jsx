import API_URL from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Camera,
    CalendarDays,
    Clock,
    MapPin,
    Package,
    ArrowRight
} from "lucide-react";

import "./MyBookings.css";

function MyBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchBookings = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/my-bookings`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                // Handle expired or invalid customer token
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("customer");

                    navigate("/login", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.error || "Unable to load bookings"
                    );
                }

                setBookings(data.bookings || []);

            } catch (err) {
                setError(err.message);

            } finally {
                setLoading(false);
            }
        };

        fetchBookings();

    }, [navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="my-bookings-message">
                Loading your bookings...
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="my-bookings-message error">
                {error}
            </div>
        );
    }

    return (
        <section className="my-bookings-page">

            {/* Page Header */}
            <div className="my-bookings-header">
                <span className="booking-eyebrow">
                    YOUR ACCOUNT
                </span>

                <h1>My Bookings</h1>

                <p>
                    Every special moment starts with a beautiful memory.
                </p>
            </div>

            <div className="my-bookings-container">

                {/* Empty State */}
                {bookings.length === 0 ? (

                    <div className="empty-bookings">

                        <Camera size={45} />

                        <h2>No bookings yet</h2>

                        <p>
                            Your photography booking requests will appear here.
                        </p>

                        <button onClick={() => navigate("/packages")}>
                            Explore Packages
                            <ArrowRight size={18} />
                        </button>

                    </div>

                ) : (

                    /* Booking Cards */
                    bookings.map((booking) => (

                        <div className="booking-card" key={booking.id}>

                            <div className="booking-card-top">

                                <div>
                                    <span className="booking-id">
                                        BOOKING #{booking.id}
                                    </span>

                                    <h2>{booking.package_name}</h2>
                                </div>

                                <span
                                    className={`booking-status ${booking.status?.toLowerCase()}`}
                                >
                                    {booking.status}
                                </span>

                            </div>

                            <div className="booking-details">

                                {/* Booking Date */}
                                <div className="booking-detail">
                                    <CalendarDays size={19} />

                                    <div>
                                        <small>Booking Date</small>

                                        <p>
                                            {new Date(
                                                booking.booking_date
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                timeZone: "UTC"
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="booking-detail">
                                    <Clock size={19} />

                                    <div>
                                        <small>Time Slot</small>
                                        <p>{booking.time_slot}</p>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="booking-detail">
                                    <Package size={19} />

                                    <div>
                                        <small>Category</small>
                                        <p>
                                            {booking.category || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="booking-detail">
                                    <MapPin size={19} />

                                    <div>
                                        <small>Location</small>
                                        <p>
                                            {booking.location || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                            </div>

                            <div className="booking-card-footer">
                                <span>PRL SHOOTS Photography</span>

                                <span>
                                    Booking #{booking.id}
                                </span>
                            </div>

                        </div>

                    ))

                )}

            </div>

        </section>
    );
}

export default MyBookings;
