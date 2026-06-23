import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/auth.store";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    setLoading(true);
    setLoginError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.data.token;
      login(null, token);

      let role = "CUSTOMER";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        role = payload.role;
      } catch {}

      navigate(role === "ADMIN" ? "/admin" : "/products");
    } catch (error) {
      setLoginError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <div className="auth-logo">Rewarding</div>
          <h2 className="auth-tagline">Earn rewards on every purchase</h2>
          <p className="auth-description">
            Join thousands of members who save money with every order. Earn points, redeem discounts, and enjoy a premium shopping experience.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              Earn 1 point for every ₹10 spent
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              Redeem points for instant discounts
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              Track orders with real-time timeline
            </div>
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card-wrap">
          <h1 className="auth-card-title">Welcome back</h1>
          <p className="auth-card-subtitle">Sign in to your account</p>

          {loginError && (
            <div className="auth-error">
              <span className="auth-error-icon">✕</span>
              {loginError}
            </div>
          )}

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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            style={{ padding: "14px", fontSize: "15px", marginTop: "8px" }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="auth-card-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
