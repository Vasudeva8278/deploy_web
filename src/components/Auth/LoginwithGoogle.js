import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import React, { useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

const LoginwithGoogle = () => {
  const { setUser, setToken } = useContext(AuthContext);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  console.log(clientId);
  const navigate = useNavigate();
  const onSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    console.log(idToken);
    // Send the token to your backend for validation
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/api/users/google-auth`,
      { idToken: idToken }
    );
    console.log(response);
    if (response.status === 200) {
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("orgId", response.data.user.orgId);
      navigate("/projects");
    }
  };

  const onFailure = (response) => {
    console.error("Login Failed:", response);
  };

    return (
    <AuthLayout>
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        text='signin_with'
        type='standard'
        size='medium'
        // theme='filled_black'
        logo_alignment='centers'
        onSuccess={onSuccess}
        onFailure={onFailure}
        onError={() => {
          console.log("Login Failed");
        }}
        cookiePolicy={"single_host_origin"}
      />
    </GoogleOAuthProvider>
    </AuthLayout>
  );
};

export default LoginwithGoogle;
