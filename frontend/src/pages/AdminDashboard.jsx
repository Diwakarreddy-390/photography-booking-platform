
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import API_URL from "../api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    total_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    total_customers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const savedAdmin = localStorage.getItem("admin");

    if (!token || !savedAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    try {
      setAdmin(JSON.parse(savedAdmin));
    } catch {
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
      navigate("/admin", { replace: true });
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `${API_URL}/admin-dashboard`,
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
          throw new Error(data.error || "Unable to load dashboard");
        }

        setStats(data);
      } catch (err) {
        setError(err.message || "Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>PRL SHOOTS</h2>
        <p>ADMIN PANEL</p>

        <nav>
          <button
            className="active"
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </button>

          <button onClick={() => navigate("/admin/bookings")}>
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

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {admin?.name || "Admin"}!</p>
          </div>

          <span className="admin-role">Administrator</span>
        </header>

        {loading ? (
          <p>Loading dashboard statistics...</p>
        ) : error ? (
          <p className="admin-error">{error}</p>
        ) : (
          <section className="admin-stats">
            <div className="admin-stat-card">
              <h3>Total Bookings</h3>
              <h2>{stats.total_bookings}</h2>
            </div>

            <div className="admin-stat-card">
              <h3>Pending Requests</h3>
              <h2>{stats.pending_bookings}</h2>
            </div>

            <div className="admin-stat-card">
              <h3>Confirmed Bookings</h3>
              <h2>{stats.confirmed_bookings}</h2>
            </div>

            <div className="admin-stat-card">
              <h3>Total Customers</h3>
              <h2>{stats.total_customers}</h2>
            </div>
          </section>
        )}

        <section className="admin-welcome">
          <h2>Welcome to PRL SHOOTS Admin Panel</h2>
          <p>
            Manage photography bookings, packages, customer details,
            and completed photography reels from one place.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
