import { NavLink } from "react-router-dom";
import useAuthStore
  from "../store/auth.store";

function AppLayout({ children }) {

  const token = useAuthStore(
    (state) => state.token
  );

  let role = "CUSTOMER";

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );
    role = payload.role;
  } catch {}

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-brand">
          <span>R</span>ewarding Platform
        </span>
        <NavLink to="/products" className="navbar-link">Products</NavLink>
        <NavLink to="/cart" className="navbar-link">Cart</NavLink>
        <NavLink to="/orders" className="navbar-link">Orders</NavLink>
        <NavLink to="/rewards" className="navbar-link">Rewards</NavLink>
        <NavLink to="/payment-history" className="navbar-link">Payments</NavLink>

        {role === "ADMIN" && (
          <>
            <span className="navbar-divider" />
            <span className="navbar-label">Admin</span>
            <NavLink to="/admin" className="navbar-link">Dashboard</NavLink>
            <NavLink to="/admin/products" className="navbar-link">Products</NavLink>
            <NavLink to="/admin/orders" className="navbar-link">Orders</NavLink>
            <NavLink to="/admin/users" className="navbar-link">Users</NavLink>
          </>
        )}

        <div className="navbar-spacer" />
        <NavLink to="/profile" className="navbar-link">Profile</NavLink>
      </nav>

      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default AppLayout;
