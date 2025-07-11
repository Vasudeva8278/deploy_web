import React from "react";
import googlePng from "../../Assets/google.png"; // Make sure this path is correct and the PNG exists

const GoogleOauthButton = ({ label }) => {
  const handleClick = () => {
    window.location.href = `${process.env.REACT_APP_BASE_URL}/api/auth/google`;
  };
  return (
    <button onClick={handleClick} className="flex items-center justify-center gap-2 border rounded-lg px-4 py-2 bg-white hover:bg-gray-100 transition">
      <img src={googlePng} alt="Google" className="w-5 h-5" />
      {label} with Google
    </button>
  );
};

export default GoogleOauthButton;

