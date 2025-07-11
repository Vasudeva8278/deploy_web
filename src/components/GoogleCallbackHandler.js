import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Example roles
export const ROLES = {
  EXECUTIVE: "Neo Executive",
  EXPERT: "Neo Expert",
  ADMIN: "admin",
};

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (code) {
      // Exchange code for token with your backend
      api.get(`/auth/callback?code=${code}`)
        .then(res => {
          const { token, user } = res.data;
          setToken(token);
          setUser(user);
          localStorage.setItem("token", token);
          localStorage.setItem("orgId", user.orgId);
          navigate("/projects");
        })
        .catch(() => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [location, navigate, setToken, setUser]);

  return <div>Logging you in with Google...</div>;
};

export default GoogleCallbackHandler;
