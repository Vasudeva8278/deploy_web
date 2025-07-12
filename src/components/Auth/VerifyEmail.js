import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  console.log("In VerifyEmail");

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const response = await api.get(`/users/verify-email/${token}`); // Replace `token` with the actual token
        const data = response.data;
        console.log(response);

        if (response.status === 200) {
          alert(data.message); // Show success message
          navigate("/login"); // Redirect to login
        } else {
          alert(data.message); // Show error message
          navigate("/signup");
        }
      } catch (err) {
        console.error("Verification failed:", err);
        alert("Failed to verify email. Please try again.");
        navigate("/signup");
      }
    };

    verifyUserEmail();
  }, []);

  return <div>Verifying your email...</div>;
};

export default VerifyEmail;