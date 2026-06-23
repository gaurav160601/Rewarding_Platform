import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore
  from "../store/auth.store";

function Logout() {

  const navigate = useNavigate();
  const logout = useAuthStore(
    (state) => state.logout
  );

  useEffect(() => {
    logout();
    navigate("/");
  }, []);

  return null;
}

export default Logout;
