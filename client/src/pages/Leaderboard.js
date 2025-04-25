import React, { useState, useEffect } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchId, setSearchId] = useState("");

  const API_URL = "https://leaderboard-backend-163p.onrender.com/api";

  useEffect(() => {
    fetchLeaderboard("all");
  }, []);

  const fetchLeaderboard = async (filter) => {
    setLoading(true);
    try {
      let url;

      if (filter === "all") {
        url = `${API_URL}/users`;
      } else {
        url = `${API_URL}/users/filter/${filter}`;
      }

      const response = await axios.get(url);
      setUsers(response.data.data);
      setCurrentFilter(filter);
      setError(null);
    } catch (err) {
      setError("Error fetching leaderboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchId.trim()) {
      fetchLeaderboard(currentFilter);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users/search/${searchId}`);

      if (response.data.success && response.data.data) {
        setUsers(response.data.data);
        setError(null);
      } else {
        setError("User not found");
        setUsers([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("User not found");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/recalculate`);
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError("Error recalculating ranks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header mb-4">
        <h1 className="mb-3 mb-md-0">Activity Leaderboard</h1>

        <button
          className="btn btn-success"
          onClick={handleRecalculate}
          disabled={loading}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Recalculate
        </button>
      </div>

      <div className="filter-buttons">
        <button
          className={`btn ${
            currentFilter === "all" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => fetchLeaderboard("all")}
        >
          All Time
        </button>
        <button
          className={`btn ${
            currentFilter === "year" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => fetchLeaderboard("year")}
        >
          This Year
        </button>
        <button
          className={`btn ${
            currentFilter === "month" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => fetchLeaderboard("month")}
        >
          This Month
        </button>
        <button
          className={`btn ${
            currentFilter === "day" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => fetchLeaderboard("day")}
        >
          Today
        </button>
      </div>

      <form className="search-form mb-4" onSubmit={handleSearch}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search by ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">ID</th>
                <th scope="col">Full Name</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <span
                        className={`rank-badge ${
                          user.rank <= 3 ? `rank-${user.rank}` : ""
                        }`}
                      >
                        {user.rank}
                      </span>
                    </td>
                    <td>{user.simpleId}</td>
                    <td>{user.fullName}</td>
                    <td>{user.totalPoints}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 pt-3 border-top text-light">
            <div
              className="info-box p-3 rounded"
              style={{
                background:
                  "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              }}
            >
              <p className="mb-0">
                <i className="fas fa-medal me-2"></i>
                Each physical activity earns <strong>+20 points</strong>.
                Complete more activities to climb the ranks!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
