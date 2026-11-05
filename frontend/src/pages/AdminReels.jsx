
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminReels.css";

import API_URL from "../api";
function AdminReels() {
  const navigate = useNavigate();

  const [reels, setReels] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wedding Photography");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("adminToken");

  const fetchReels = async () => {
    try {
      const response = await fetch(`${API_URL}/admin-reels`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
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
        throw new Error(data.error || "Unable to load projects");
      }

      setReels(data.reels || []);
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken() || !localStorage.getItem("admin")) {
      navigate("/admin", { replace: true });
      return;
    }

    fetchReels();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !category.trim() || !videoUrl.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/admin-reels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          video_url: videoUrl.trim(),
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
        throw new Error(data.error || "Unable to add project");
      }

      setTitle("");
      setCategory("Wedding Photography");
      setVideoUrl("");

      await fetchReels();

      alert("Reel added successfully!");
    } catch (err) {
      setError(err.message || "Unable to add project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reelId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin-reels/${reelId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete project");
      }

      setReels((previous) =>
        previous.filter((reel) => reel.id !== reelId)
      );
    } catch (err) {
      alert(err.message || "Unable to delete project");
    }
  };

  return (
    <div className="admin-reels-page">
      <div className="admin-reels-header">
        <div>
          <h1>Manage Reels</h1>
          <p>Add completed photography projects for customers to view.</p>
        </div>

        <button
          className="reels-back-btn"
          onClick={() => navigate("/admin/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <form className="admin-reels-form" onSubmit={handleSubmit}>
        <h2>Add Completed Project</h2>

        <label>Project Title</label>
        <input
          type="text"
          placeholder="Example: Wedding Highlights"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Wedding Photography</option>
          <option>Birthday Photography</option>
          <option>Events</option>
          <option>Model / Fashion</option>
          <option>Baby Shoot</option>
          <option>Other</option>
        </select>

        <label>Google Drive Video Link</label>
        <input
          type="url"
          placeholder="Paste your Google Drive sharing link"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="reels-submit-btn" disabled={saving}>
          {saving ? "Saving..." : "Add Project"}
        </button>
      </form>

      <section className="admin-reels-list">
        <h2>Saved Projects ({reels.length})</h2>

        {loading ? (
          <p>Loading projects...</p>
        ) : reels.length === 0 ? (
          <p>No completed projects added yet.</p>
        ) : (
          reels.map((reel) => (
            <div className="admin-reel-item" key={reel.id}>
              <div>
                <h3>{reel.title}</h3>
                <p>{reel.category}</p>
                <a
                  href={reel.video_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Video
                </a>
              </div>

              <button
                type="button"
                className="reel-delete-btn"
                onClick={() => handleDelete(reel.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default AdminReels;
