
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPackages.css";

const API_URL = "http://127.0.0.1:5000";

function AdminPackages() {
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [packageName, setPackageName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [editingId, setEditingId] = useState(null);

    const getToken = () => localStorage.getItem("adminToken");

    useEffect(() => {
        const token = getToken();
        const savedAdmin = localStorage.getItem("admin");

        if (!token || !savedAdmin) {
            navigate("/admin", { replace: true });
            return;
        }

        const fetchPackages = async () => {
            try {
                const response = await fetch(`${API_URL}/admin-packages`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("admin");
                    navigate("/admin", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error(data.error || "Unable to load packages");
                }

                setPackages(data.packages || []);
            } catch (err) {
                setError(err.message || "Unable to connect to server");
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin", { replace: true });
    };

    const resetForm = () => {
        setPackageName("");
        setDescription("");
        setPrice("");
        setDuration("");
        setEditingId(null);
        setFormError("");
        setShowForm(false);
    };

    const handleAddPackage = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!packageName.trim() || price === "") {
            setFormError("Package name and price are required.");
            return;
        }

        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            setFormError("Please enter a valid price.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(`${API_URL}/admin-packages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    name: packageName.trim(),
                    description: description.trim(),
                    price: Number(price),
                    duration: duration.trim(),
                }),
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");
                navigate("/admin", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || "Unable to add package");
            }

            setPackages((previous) => [
                {
                    id: data.package_id,
                    name: packageName.trim(),
                    description: description.trim(),
                    price: Number(price),
                    duration: duration.trim(),
                },
                ...previous,
            ]);

            resetForm();
            alert("Package added successfully!");
        } catch (err) {
            setFormError(err.message || "Unable to add package");
        } finally {
            setSaving(false);
        }
    };

    const handleEditPackage = (pkg) => {
        setEditingId(pkg.id);
        setPackageName(pkg.name);
        setDescription(pkg.description || "");
        setPrice(String(pkg.price));
        setDuration(pkg.duration || "");
        setFormError("");
        setShowForm(true);
    };

    const handleUpdatePackage = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!packageName.trim() || price === "") {
            setFormError("Package name and price are required.");
            return;
        }

        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            setFormError("Please enter a valid price.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/admin-packages/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({
                        name: packageName.trim(),
                        description: description.trim(),
                        price: Number(price),
                        duration: duration.trim(),
                    }),
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
                throw new Error(data.error || "Unable to update package");
            }

            setPackages((previous) =>
                previous.map((pkg) =>
                    pkg.id === editingId
                        ? {
                              ...pkg,
                              name: packageName.trim(),
                              description: description.trim(),
                              price: Number(price),
                              duration: duration.trim(),
                          }
                        : pkg
                )
            );

            resetForm();
            alert("Package updated successfully!");
        } catch (err) {
            setFormError(err.message || "Unable to update package");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePackage = async (packageId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this package?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${API_URL}/admin-packages/${packageId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
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
                alert(data.error || "Failed to delete package");
                return;
            }

            setPackages((previous) =>
                previous.filter((pkg) => pkg.id !== packageId)
            );

            alert("Package deleted successfully!");
        } catch {
            alert("Unable to connect to the server");
        }
    };

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

                    <button className="active">Packages</button>

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
                        <h1>Packages Management</h1>
                        <p>View and manage photography packages.</p>
                    </div>

                    <span className="admin-role">Administrator</span>
                </header>

                <section className="booking-management">
                    <div className="booking-toolbar">
                        <h2>All Packages ({packages.length})</h2>

                        <button
                            className="add-package-btn"
                            onClick={() => {
                                if (showForm) {
                                    resetForm();
                                } else {
                                    setEditingId(null);
                                    setPackageName("");
                                    setDescription("");
                                    setPrice("");
                                    setDuration("");
                                    setFormError("");
                                    setShowForm(true);
                                }
                            }}
                        >
                            {showForm ? "Cancel" : "+ Add Package"}
                        </button>
                    </div>

                    {showForm && (
                        <form
                            className="package-form"
                            onSubmit={
                                editingId
                                    ? handleUpdatePackage
                                    : handleAddPackage
                            }
                        >
                            <h3>
                                {editingId ? "Edit Package" : "Add New Package"}
                            </h3>

                            <div className="package-form-grid">
                                <div>
                                    <label>Package Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter package name"
                                        value={packageName}
                                        onChange={(e) =>
                                            setPackageName(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="Enter price"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Duration</label>
                                    <input
                                        type="text"
                                        placeholder="Example: 3 Hours"
                                        value={duration}
                                        onChange={(e) =>
                                            setDuration(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="package-description">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Enter package description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        rows="3"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <p className="admin-error">{formError}</p>
                            )}

                            <div className="package-form-actions">
                                <button type="submit" disabled={saving}>
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                        ? "Update Package"
                                        : "Save Package"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <p>Loading packages...</p>
                    ) : error ? (
                        <p className="admin-error">{error}</p>
                    ) : packages.length === 0 ? (
                        <p>No packages found.</p>
                    ) : (
                        <div className="booking-table-wrapper">
                            <table className="booking-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Package Name</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Duration</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {packages.map((pkg) => (
                                        <tr key={pkg.id}>
                                            <td>{pkg.id}</td>
                                            <td>{pkg.name}</td>
                                            <td>{pkg.description}</td>
                                            <td>
                                                ₹
                                                {Number(pkg.price).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>
                                            <td>{pkg.duration || "N/A"}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="edit-package-btn"
                                                    onClick={() =>
                                                        handleEditPackage(pkg)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-package-btn"
                                                    onClick={() =>
                                                        handleDeletePackage(
                                                            pkg.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
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

export default AdminPackages;
