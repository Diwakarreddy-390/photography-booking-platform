import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCustomers.css";

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const savedAdmin = localStorage.getItem("admin");

    if (!token || !savedAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/admin-customers",
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
          throw new Error(data.error || "Unable to load customers");
        }

        setCustomers(data.customers || []);
      } catch (err) {
        setError(err.message || "Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin", { replace: true });
  };

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.includes(search) ||
      String(customer.id).includes(search)
    );
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

          <button onClick={() => navigate("/admin/bookings")}>
            Bookings
          </button>

          <button onClick={() => navigate("/admin/packages")}>
            Packages
          </button>

          <button className="active">
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
            <h1>Customers Management</h1>
            <p>View and manage registered customers.</p>
          </div>

          <span className="admin-role">Administrator</span>
        </header>

        <section className="booking-management">
          <div className="booking-toolbar">
            <h2>All Customers ({customers.length})</h2>

            <input
              type="text"
              placeholder="Search name, phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="booking-search"
            />
          </div>

          {loading ? (
            <p>Loading customers...</p>
          ) : error ? (
            <p className="admin-error">{error}</p>
          ) : filteredCustomers.length === 0 ? (
            <p>No customers found.</p>
          ) : (
            <div className="booking-table-wrapper">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Total Bookings</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.name || "Not provided"}</td>
                      <td>{customer.phone || "N/A"}</td>
                      <td>{customer.total_bookings}</td>
                      <td>
                        {customer.created_at
                          ? new Date(
                            customer.created_at
                          ).toLocaleDateString("en-IN")
                          : "N/A"}
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

export default AdminCustomers;