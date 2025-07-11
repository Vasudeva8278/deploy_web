import React from "react";
import backgroundImage from "../../Assets/back.png";

const AuthLayout = ({ children }) => (
  <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden">
    {/* Blurred Background Image */}
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(8px)",
      }}
    />
    {/* Centered Card */}
    <div className="relative z-10 w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden flex">
      {children}
    </div>
  </div>
);

export default AuthLayout;
