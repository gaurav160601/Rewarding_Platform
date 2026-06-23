import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-sidebar">
          <div className="auth-sidebar-content">
            <div className="auth-logo">Rewarding</div>
            <h2 className="auth-tagline">You're all set!</h2>
            <p className="auth-description">
              Your account has been created. You can now log in and start earning rewards on every purchase.
            </p>
          </div>
        </div>
        <div className="auth-main">
          <div className="auth-card-wrap" style={{ textAlign: "center" }}>
            <div className="auth-success-icon">✓</div>
            <h1 className="auth-card-title">Account Created</h1>
            <p className="auth-card-subtitle">
              You can now log in with your credentials.
            </p>
            <p className="text-muted" style={{ marginTop: "12px", fontSize: "13px" }}>
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <div className="auth-logo">Rewarding</div>
          <h2 className="auth-tagline">Start earning today</h2>
          <p className="auth-description">
            Create your account and start collecting reward points on every purchase. Redeem them for discounts on future orders.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              Free to join
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              Instant reward points
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              No hidden fees
            </div>
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card-wrap">
          <h1 className="auth-card-title">Create account</h1>
          <p className="auth-card-subtitle">Start your rewarding journey</p>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">✕</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            style={{ padding: "14px", fontSize: "15px", marginTop: "8px" }}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="auth-card-footer">
            Already have an account?{" "}
            <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
