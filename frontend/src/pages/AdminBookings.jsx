
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBookings.css";
import API_URL from "../api";
function AdminBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    

    const fetchBookings = async (isRefresh = false) => {
        const token = localStorage.getItem("adminToken");

        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(
                `${API_URL}/admin-bookings`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");
                navigate("/admin", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || "Unable to load bookings");
            }

            setBookings(data.bookings || []);
        } catch (err) {
            setError(err.message || "Unable to connect to server");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        const savedAdmin = localStorage.getItem("admin");

        if (!token || !savedAdmin) {
            navigate("/admin", { replace: true });
            return;
        }

        fetchBookings();
    }, [navigate]);

    const [updatingId, setUpdatingId] = useState(null);

    const handleStatusUpdate = async (bookingId, status) => {
        if (status === "Rejected") {
            const confirmed = window.confirm(
                "Are you sure you want to reject this booking?"
            );

            if (!confirmed) {
                return;
            }
        }
        const token = localStorage.getItem("adminToken");

        try {
            setUpdatingId(bookingId);
            setError("");

            const response = await fetch(
                `${API_URL}/admin-bookings/${bookingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to update booking");
            }

            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking.id === bookingId
                        ? { ...booking, status: data.status }
                        : booking
                )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };
    const handleExportCSV = () => {
        if (bookings.length === 0) {
            alert("No bookings available to export.");
            return;
        }

        const headers = [
            "Booking ID",
            "Customer Name",
            "Phone",
            "Package",
            "Booking Date",
            "Time Slot",
            "Status",
        ];

        const rows = bookings.map((booking) => [
            booking.id,
            booking.customer_name || "N/A",
            booking.customer_phone || "N/A",
            booking.package_name || "N/A",
            booking.booking_date || "N/A",
            booking.time_slot || "N/A",
            booking.status || "N/A",
        ]);

        const csvContent = [headers, ...rows]
            .map((row) =>
                row
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "PRL-SHOOTS-Bookings.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };
    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin", { replace: true });
    };
    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        (booking) => booking.status?.toLowerCase() === "pending"
    ).length;

    const confirmedBookings = bookings.filter(
        (booking) => booking.status?.toLowerCase() === "confirmed"
    ).length;

    const rejectedBookings = bookings.filter(
        (booking) => booking.status?.toLowerCase() === "rejected"
    ).length;
    const filteredBookings = bookings.filter((booking) => {
        const matchesStatus =
            filter === "All" ||
            booking.status?.toLowerCase() === filter.toLowerCase();

        const search = searchTerm.toLowerCase();

        const matchesSearch =
            booking.customer_name?.toLowerCase().includes(search) ||
            booking.customer_phone?.includes(search) ||
            booking.package_name?.toLowerCase().includes(search) ||
            String(booking.id).includes(search);

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <h2>PRL SHOOTS</h2>
                <p>ADMIN PANEL</p>

                <nav>
                    <button onClick={() => navigate("/admin/dashboard")}>
                        Dashboard
                    </button>

                    <button className="active">
                        Bookings
                    </button>

                    <button onClick={() => navigate("/admin/packages")}>
                        Packages
                    </button>
                    <button onClick={() => navigate("/admin/customers")}>
                        Customers
                    </button>
                    <button onClick={() => navigate("/admin/reels")}>
                        Manage Reels
                    </button>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </aside>

            {selectedBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="booking-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="booking-modal-header">
                            <h2>Booking Details</h2>

                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedBooking(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="booking-details-content">
                            <p>
                                <strong>Booking ID:</strong>{" "}
                                {selectedBooking.id}
                            </p>

                            <p>
                                <strong>Customer Name:</strong>{" "}
                                {selectedBooking.customer_name || "Not provided"}
                            </p>

                            <p>
                                <strong>Phone Number:</strong>{" "}
                                {selectedBooking.customer_phone || "N/A"}
                            </p>

                            <p>
                                <strong>Package:</strong>{" "}
                                {selectedBooking.package_name || "N/A"}
                            </p>

                            <p>
                                <strong>Booking Date:</strong>{" "}
                                {selectedBooking.booking_date
                                    ? new Date(
                                        selectedBooking.booking_date
                                    ).toLocaleDateString("en-IN")
                                    : "N/A"}
                            </p>

                            <p>
                                <strong>Time Slot:</strong>{" "}
                                {selectedBooking.time_slot || "N/A"}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedBooking.status}
                            </p>
                        </div>

                        <button
                            className="modal-done-btn"
                            onClick={() => setSelectedBooking(null)}
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Bookings Management</h1>
                        <p>View and manage all photography bookings.</p>
                    </div>

                    <span className="admin-role">Administrator</span>
                </header>

                <section className="booking-management">
                    <div className="booking-stats">

                        <div className="booking-stat-card total">
                            <h3>Total Bookings</h3>
                            <h2>{totalBookings}</h2>
                        </div>

                        <div className="booking-stat-card pending">
                            <h3>Pending Bookings</h3>
                            <h2>{pendingBookings}</h2>
                        </div>

                        <div className="booking-stat-card confirmed">
                            <h3>Confirmed Bookings</h3>
                            <h2>{confirmedBookings}</h2>
                        </div>

                        <div className="booking-stat-card rejected">
                            <h3>Rejected Bookings</h3>
                            <h2>{rejectedBookings}</h2>
                        </div>

                    </div>
                    <div className="booking-toolbar">
                        <h2>All Bookings ({bookings.length})</h2>
                        <button
                            className="export-btn"
                            onClick={handleExportCSV}
                        >
                            ↓ Export CSV
                        </button>
                        <button
                            className="refresh-btn"
                            onClick={() => fetchBookings(true)}
                            disabled={refreshing}
                        >
                            {refreshing ? "Refreshing..." : "↻ Refresh"}
                        </button>
                        <input
                            type="text"
                            placeholder="Search name, phone, package or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="booking-search"
                        />

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Bookings</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading bookings...</p>
                    ) : error ? (
                        <p className="admin-error">{error}</p>
                    ) : filteredBookings.length === 0 ? (
                        <p>No bookings found.</p>
                    ) : (
                        <div className="booking-table-wrapper">
                            <table className="booking-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Package</th>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td>{booking.id}</td>
                                            <td>{booking.customer_name || "N/A"}</td>
                                            <td>{booking.customer_phone || "N/A"}</td>
                                            <td>{booking.package_name || "N/A"}</td>
                                            <td>
                                                {booking.booking_date
                                                    ? new Date(
                                                        booking.booking_date
                                                    ).toLocaleDateString("en-IN")
                                                    : "N/A"}
                                            </td>
                                            <td>{booking.time_slot || "N/A"}</td>
                                            <td>
                                                <span
                                                    className={`booking-status ${booking.status?.toLowerCase()}`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>


                                            <td>
                                                <div className="booking-actions">
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => setSelectedBooking(booking)}
                                                    >
                                                        View Details
                                                    </button>

                                                    {booking.status?.toLowerCase() === "pending" && (
                                                        <>
                                                            <button
                                                                className="approve-btn"
                                                                disabled={updatingId === booking.id}
                                                                onClick={() =>
                                                                    handleStatusUpdate(booking.id, "Confirmed")
                                                                }
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="reject-btn"
                                                                disabled={updatingId === booking.id}
                                                                onClick={() =>
                                                                    handleStatusUpdate(booking.id, "Rejected")
                                                                }
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>


                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminBookings;
