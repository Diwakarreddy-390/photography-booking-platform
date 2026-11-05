import API_URL from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CalendarDays,
    Clock,
    MapPin,
    Camera,
} from "lucide-react";

function Booking() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedPackageId = searchParams.get("packageId");

    const [availablePackages, setAvailablePackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        category: "",
        packageType: "",
        date: "",
        time: "",
        location: "",
        requirements: "",
    });

    // Load packages from backend
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/packages`
                );

                if (!response.ok) {
                    throw new Error("Unable to fetch packages");
                }

                const data = await response.json();
                const fetchedPackages = data.packages || [];

                setAvailablePackages(fetchedPackages);

                const selectedPackage = fetchedPackages.find(
                    (item) =>
                        String(item.id) === String(selectedPackageId)
                );

                if (selectedPackage) {
                    setFormData((prev) => ({
                        ...prev,
                        packageType: String(selectedPackage.id),
                    }));
                }
            } catch (error) {
                console.error("Package loading error:", error);
            } finally {
                setLoadingPackages(false);
            }
        };

        fetchPackages();
    }, [selectedPackageId]);

    // Handle form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Submit booking
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        // Validate required form fields
        const requiredFields = [
            "name",
            "email",
            "category",
            "packageType",
            "date",
            "time",
            "location",
        ];

        const missingField = requiredFields.find(
            (field) => !String(formData[field] || "").trim()
        );

        if (missingField) {
            alert("Please complete all required fields.");
            return;
        }

        // Check login
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login before submitting your booking.");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(
               `${API_URL}/bookings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                alert(data.error || "Your session has expired. Please login again.");
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error || "Booking submission failed"
                );
            }

            alert(
                `Booking submitted successfully! Your booking ID is ${data.booking_id}. Admin approval is pending.`
            );

            // Clear form after successful booking
            setFormData({
                name: "",
                phone: "",
                email: "",
                category: "",
                packageType: "",
                date: "",
                time: "",
                location: "",
                requirements: "",
            });

            navigate("/my-bookings");
        } catch (error) {
            console.error("Booking error:", error);
            alert(error.message || "Unable to submit booking.");
        }
    };

    return (
        <div className="booking-page">
            <section className="booking-header">
                <p className="section-tag">
                    LET'S CREATE MEMORIES
                </p>

                <h1>
                    Book Your <span>Photoshoot</span>
                </h1>

                <p>
                    Tell us about your photoshoot. Our team will contact you
                    to confirm availability and advance payment.
                </p>
            </section>

            <section className="booking-container">
                <div className="booking-info">
                    <Camera size={42} />

                    <h2>Your Special Moments</h2>

                    <p>
                        Choose your photography package, preferred date and
                        time. Our team will review your request.
                    </p>

                    <div className="booking-note">
                        <CalendarDays />

                        <div>
                            <h3>Flexible Date</h3>
                            <p>
                                Request your preferred photoshoot date.
                            </p>
                        </div>
                    </div>

                    <div className="booking-note">
                        <Clock />

                        <div>
                            <h3>Custom Time</h3>
                            <p>
                                Enter the time that works best for you.
                            </p>
                        </div>
                    </div>

                    <div className="booking-note">
                        <MapPin />

                        <div>
                            <h3>Location</h3>
                            <p>
                                Tell us where you want your photoshoot.
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    className="booking-form"
                    onSubmit={handleSubmit}
                >
                    <h2>Booking Details</h2>

                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength="10"
                        required
                    />

                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Photoshoot Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select photoshoot category
                        </option>

                        <option value="Wedding Photography">
                            Wedding Photography
                        </option>

                        <option value="Birthday Photography">
                            Birthday Photography
                        </option>

                        <option value="Events">
                            Events
                        </option>

                        <option value="Model / Fashion">
                            Model / Fashion
                        </option>

                        <option value="Baby Shoot">
                            Baby Shoot
                        </option>

                        <option value="Other">
                            Other
                        </option>
                    </select>

                    <label>Package Type</label>
                    <select
                        name="packageType"
                        value={formData.packageType}
                        onChange={handleChange}
                        required
                        disabled={loadingPackages}
                    >
                        <option value="">
                            {loadingPackages
                                ? "Loading packages..."
                                : "Select package type"}
                        </option>

                        {availablePackages.map((item) => (
                            <option
                                key={item.id}
                                value={String(item.id)}
                            >
                                {item.name} - ₹
                                {Number(item.price).toLocaleString("en-IN")}
                            </option>
                        ))}
                    </select>

                    <div className="booking-row">
                        <div>
                            <label>Preferred Date</label>

                            <input
                                type="date"
                                name="date"
                                min={new Date().toLocaleDateString("en-CA")}
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Preferred Time</label>

                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <label>Photoshoot Location</label>
                    <input
                        type="text"
                        name="location"
                        placeholder="Enter your preferred location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />

                    <label>Additional Requirements</label>
                    <textarea
                        name="requirements"
                        placeholder="Describe your requirements..."
                        rows="4"
                        value={formData.requirements}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        className="booking-submit"
                    >
                        Submit Booking Request
                    </button>

                    <p className="booking-disclaimer">
                        Your booking is not confirmed immediately. Our admin
                        will review your request and contact you about approval
                        and advance payment.
                    </p>
                </form>
            </section>
        </div>
    );
}

export default Booking;
