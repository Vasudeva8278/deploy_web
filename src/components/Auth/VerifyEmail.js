import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AuthLayout from "./AuthLayout";
  
const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      api.get(`/users/verify-email/${token}`)
        .then(res => {
          setMessage("Email verified! You can now log in.");
          setTimeout(() => navigate("/login"), 2000);
        })
        .catch(err => {
          setMessage("Verification failed or link expired.");
        });
    } else {
      setMessage("Invalid verification link.");
    }
  }, [location, navigate]);

  return <AuthLayout>
    <div>{message}</div>
  </AuthLayout>;
};

export default VerifyEmail;
