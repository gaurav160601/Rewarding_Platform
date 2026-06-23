import { Navigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

function ProtectedRoute({ children }) {

  const token =
    useAuthStore(
      (state) => state.token
    );

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
