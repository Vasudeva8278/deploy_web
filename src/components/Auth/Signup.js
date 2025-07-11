import React, { useContext, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import loginLogo from '../../Assets/login-logo.png';
import AuthLayout from "./AuthLayout";
import GoogleOauthButton from "./GoogleOauthButton";
import authpng from "../../Assets/auth.png"

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setCpassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [accept, setAccept] = useState("");
  const [error, setError] = useState(null);
  const { setUser, setToken } = useContext(AuthContext);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const userData = {
    user: { name, email, password, confirmpassword, accept, role: "685f9b7d3d988647b344e5ca" },
    mobile: { name: mobile },
  };

  const mutation = useMutation(
    async (userData) => {
      const response = await api.post("/users/signup", userData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log("Signup successful:", data);
        setIsSubmitting(false);
        setSuccessMessage(
          "Signup successful! Please check your email to verify your account."
        );
      },
      onError: (error) => {
        setIsSubmitting(false);
        console.error("Signup error:", error);
        setError(error.response?.data?.message || "Signup failed");
      },
    }
  );

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmpassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const userData = {
      user: { name, email, password, confirmpassword, accept, role: "68621597db15fbb9bbd2f838" },
      mobile: { name: mobile },
    };
    mutation.mutate(userData);
  };

  return (
    <AuthLayout>
      {/* Main container with proper flex layout */}
      <div className="flex">
        {/* Left Panel - Brand/Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800  relative">
          <div className="flex flex-col justify-center items-center w-full p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">NEO TEMPLATES</h2>
              <p className="text-green-100 text-lg max-w-md">
                Automate document management to boost efficiency, reduce errors, and
                focus on strategic goals.
              </p>
            </div>

            <div className="max-w-md w-full">
              <img
                src={authpng}
                alt="Signup Illustration"
                className="w-full h-auto "
              />
            </div>
          </div>

          {/* Optional: Background decoration */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <img src={loginLogo} alt="Neo" className="w-32 mx-auto mb-4" />
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome to NEO 👋
                </h2>
                <p className="text-gray-600 text-sm">
                  Create your account to get started with our platform
                </p>
              </div>

              {successMessage ? (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm text-center">
                  {successMessage}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name Field */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  {/* Mobile Number Field */}
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter your mobile number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use 8 or more characters with a mix of letters, numbers & symbols.
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label
                      htmlFor="confirmpassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmpassword"
                      value={confirmpassword}
                      onChange={(e) => setCpassword(e.target.value)}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={accept}
                      onChange={(e) => setAccept(e.target.checked)}
                      required
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                      I accept the{" "}
                      <a href="#" className="text-blue-600 hover:text-green-800 hover:underline transition duration-200">
                        Terms & Conditions
                      </a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full  bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Login Link */}
                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      {/* <a
                        href="/login"
                        className="text-blue-600 hover:text-green-800 hover:underline font-medium transition duration-200"
                      >
                        Log In
                      </a> */}
                      <Link
                        to="/login"
                        className="text-blue-600 hover:text-green-800 hover:underline font-medium transition duration-200"
                      >
                        Log In
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="text-xs text-center text-gray-500 mt-6">
              © 2024 NEO India, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;