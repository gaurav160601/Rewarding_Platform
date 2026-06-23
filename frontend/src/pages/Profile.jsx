import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import graphqlClient from "../graphql/client";
import PROFILE_QUERY from "../graphql/profile.query";
import useAuthStore from "../store/auth.store";
import { useToast } from "../components/Toast";

function Profile() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logginOut, setLogginOut] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await graphqlClient.post("", {
          query: PROFILE_QUERY,
        });
        const body = response.data;
        if (body.errors) {
          throw new Error(body.errors[0]?.message || "Failed to load data");
        }
        const data = body.data;
        setProfile(data.profile);
        setOrders(data.orders || []);
        setRewardBalance(data.rewardBalance?.reward_points || 0);
        setTransactions(data.rewardHistory || []);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message || "Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    setLogginOut(true);
    logout();
    toast("Logged out successfully", "success");
    navigate("/");
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const earned = transactions.filter((t) => t.type === "EARN").reduce((s, t) => s + Number(t.points || 0), 0);
  const redeemed = transactions.filter((t) => t.type === "REDEEM" || t.type === "REFUND").reduce((s, t) => s + Math.abs(Number(t.points || 0)), 0);
  const savings = transactions.filter((t) => t.type === "REDEEM").reduce((s, t) => s + Math.abs(Number(t.points || 0)), 0);

  const orderStats = {
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
    PENDING: orders.filter((o) => ["PAYMENT_PENDING", "PAID", "PROCESSING", "SHIPPED"].includes(o.status)).length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED" || o.status === "PAYMENT_EXPIRED").length,
    PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
  };

  const recentActivity = [...transactions]
    .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
    .slice(0, 5);

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() || "?";

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Customer Dashboard</h1>
        <div className="card" style={{ maxWidth: 800, padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
            <div className="skeleton-shimmer" style={{ width: 80, height: 80, borderRadius: "50%" }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 22 }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: "30%", height: 16, marginTop: 8 }} />
            </div>
          </div>
      <div className="stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card" style={{ padding: 24, textAlign: "center" }}>
                <div className="skeleton-line skeleton-shimmer" style={{ width: "50%", height: 12, margin: "0 auto 12px" }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: "35%", height: 28, margin: "0 auto" }} />
              </div>
            ))}
          </div>
          <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 120, marginTop: 24 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Customer Dashboard</h1>
        <div className="empty-state">
          <div className="icon">👤</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <h1 className="page-title">Customer Dashboard</h1>
        <div className="empty-state">
          <div className="icon">👤</div>
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Customer Dashboard</h1>

      {/* Section 7 — Enhanced Avatar + Logout */}
      <div className="dashboard-header">
        <div className="dashboard-avatar-wrap">
          <div className="dashboard-avatar">{initials}</div>
        </div>
        <div className="dashboard-header-info">
          <h2>{profile.name || "User"}</h2>
          <p className="dashboard-email">{profile.email}</p>
          <div className="dashboard-header-badges">
            <span className={`badge badge-${profile.role?.toLowerCase()}`}>{profile.role}</span>
          </div>
        </div>
        <button className="btn btn-danger dashboard-logout" onClick={handleLogout} disabled={logginOut}>
          {logginOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      {/* Section 8 — Account Information (moved up) */}
      <h2 className="section-title">Account Information</h2>
      <div className="card account-info-card">
        <div className="account-info-grid">
          <div className="account-info-item">
            <span className="account-info-label">Email</span>
            <span className="account-info-value">{profile.email}</span>
          </div>
          <div className="account-info-item">
            <span className="account-info-label">Role</span>
            <span className="account-info-value">
              <span className={`badge badge-${profile.role?.toLowerCase()}`}>{profile.role}</span>
            </span>
          </div>
          <div className="account-info-item">
            <span className="account-info-label">User ID</span>
            <span className="account-info-value" style={{ color: "#64748b" }}>#{profile.id}</span>
          </div>
          <div className="account-info-item">
            <span className="account-info-label">Member Since</span>
            <span className="account-info-value">
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                    month: "short", year: "numeric"
                  })
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1 — Account Statistics */}
      <h2 className="section-title">Account Statistics</h2>
      <div className="stats-grid">
        <div className="card-stat">
          <h3>Total Orders</h3>
          <p className="value blue">{totalOrders}</p>
        </div>
        <div className="card-stat">
          <h3>Total Spent</h3>
          <p className="value green">₹{totalSpent.toLocaleString("en-IN")}</p>
        </div>
        <div className="card-stat">
          <h3>Reward Points</h3>
          <p className="value purple">{rewardBalance.toLocaleString("en-IN")}</p>
        </div>
        <div className="card-stat">
          <h3>Member Since</h3>
          <p className="value orange" style={{ fontSize: 22 }}>
            {profile.created_at
              ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
      </div>

      {/* Section 3 — Rewards Wallet */}
      <h2 className="section-title">Rewards Wallet</h2>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card-stat">
          <h3>Current Balance</h3>
          <p className="value purple">{rewardBalance.toLocaleString("en-IN")}</p>
          <p className="card-stat-sub">Points</p>
        </div>
        <div className="card-stat">
          <h3>Lifetime Earned</h3>
          <p className="value green">{earned.toLocaleString("en-IN")}</p>
          <p className="card-stat-sub">Points</p>
        </div>
        <div className="card-stat">
          <h3>Lifetime Redeemed</h3>
          <p className="value orange">{redeemed.toLocaleString("en-IN")}</p>
          <p className="card-stat-sub">Points</p>
        </div>
        <div className="card-stat">
          <h3>Total Savings</h3>
          <p className="value green">₹{savings.toLocaleString("en-IN")}</p>
          <p className="card-stat-sub">From rewards</p>
        </div>
      </div>

      {/* Section 4 — Order Statistics */}
      <h2 className="section-title">Order Statistics</h2>
      <div className="stats-grid">
        <div className="card-stat">
          <h3>Delivered</h3>
          <p className="value green">{orderStats.DELIVERED}</p>
        </div>
        <div className="card-stat">
          <h3>Pending</h3>
          <p className="value orange">{orderStats.PENDING}</p>
        </div>
        <div className="card-stat">
          <h3>Processing</h3>
          <p className="value blue">{orderStats.PROCESSING}</p>
        </div>
        <div className="card-stat">
          <h3>Cancelled</h3>
          <p className="value" style={{ color: "#dc2626" }}>{orderStats.CANCELLED}</p>
        </div>
      </div>

      {/* Section 5 — Recent Activity */}
      <h2 className="section-title">Recent Activity</h2>
      <div className="card">
        {recentActivity.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 0" }}>
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((txn) => (
              <div key={txn.id || txn._id} className="activity-item">
                <div className="activity-icon">
                  {txn.type === "EARN" ? "+" : txn.type === "REDEEM" ? "−" : "↩"}
                </div>
                <div className="activity-info">
                  <span className="activity-text">
                    {txn.type === "EARN" ? "+" : ""}
                    {txn.type === "EARN" ? "" : txn.type === "REFUND" ? "" : "−"}
                    {Math.abs(Number(txn.points))} Points {txn.type === "EARN" ? "Earned" : txn.type === "REDEEM" ? "Redeemed" : "Refunded"}
                  </span>
                  {txn.description && (
                    <span className="activity-desc">{txn.description}</span>
                  )}
                </div>
                <span className="activity-date">
                  {new Date(txn.createdAt || txn.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short"
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 6 — Quick Actions */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="profile-actions">
        <button className="btn btn-primary" onClick={() => navigate("/orders")}>
          View Orders
        </button>
        <button className="btn btn-success" onClick={() => navigate("/rewards")}>
          View Rewards
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/products")}>
          Browse Products
        </button>
      </div>
    </div>
  );
}

export default Profile;
