import {
  Navigate,
  Link,
  Outlet,
  useLocation
} from "react-router-dom";
import useAuthStore
  from "../store/auth.store";

function AdminLayout() {

  const token = useAuthStore(
    (state) => state.token
  );

  const location = useLocation();

  if (!token) {
    return (
      <Navigate to="/" replace />
    );
  }

  let role = "CUSTOMER";

  try {

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    role = payload.role;

  } catch {
    return (
      <Navigate to="/" replace />
    );
  }

  if (role !== "ADMIN") {
    return (
      <Navigate
        to="/products"
        replace
      />
    );
  }

  const links = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/users", label: "Users" }
  ];

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3><span>A</span>dmin Panel</h3>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link${
                location.pathname ===
                link.to
                  ? " active"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/profile"
            className="sidebar-link"
          >
            Profile
          </Link>

          <Link
            to="/logout"
            className="sidebar-link"
          >
            Logout
          </Link>
        </div>
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
