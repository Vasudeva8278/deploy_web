import React, { useContext, useState, useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import loginLogo from '../../Assets/login-logo.png';
import LoginwithGoogle from "./LoginwithGoogle";
import AuthLayout from "./AuthLayout";
import GoogleOauthButton from "./GoogleOauthButton";
import authpng from "../../Assets/auth.png"
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, setToken, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const isAuthenticated = !!token;

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://13.200.200.137:7000';
  
  const mutation = useMutation(
    async (loginData) => {
      setLoading(true);
      const response = await api.post(`${BASE_URL}/api/users/login`, loginData);
      console.log("response:", BASE_URL);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setLoading(false);
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("orgId", data.user.orgId);
        console.log("user.role:", data.user.role);
        navigate("/projects");
      },
      onError: (error) => {
        setLoading(false);
        setError(error.response?.data?.message || "Login failed");
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      setToken(token);

      // Fetch user info and setUser, then navigate
      api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setUser(res.data);
          localStorage.setItem("orgId", res.data.orgId);
          navigate("/projects");
        })
        .catch(() => {
          // fallback: just navigate
          navigate("/projects");
        });
    }
  }, [location, navigate, setToken, setUser]);

  return (
    <AuthLayout>
     {/* // Main container with proper flex layout */}
      <div className="flex">
        {/* Left Panel - Brand/Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative">
          <div className="flex flex-col justify-center items-center w-full p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">NEO TEMPLATES</h2>
              <p className="text-blue-100 text-lg">
                Your gateway to productivity and success
              </p>
            </div>

            <div className="max-w-md w-full">
              <img
                src={authpng}
                alt="Login Illustration"
                className="w-full h-auto "
              />
            </div>
          </div>

          {/* Optional: Background decoration */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Right Panel - Login Form */}
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
                  Welcome Back 👋
                </h2>
                <p className="text-gray-600 text-sm">
                  Ready to continue where you left off? Log in to access your
                  account and achieve more today.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgotpassword"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition duration-200"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Sign Up Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition duration-200"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
