import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import AuthLayout from "./AuthLayout";
import loginLogo from '../../Assets/login-logo.png';
import authpng from "../../Assets/auth.png"
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error messages
    setErrorMessage("");

    if (password !== confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    if (password.length < 8) {
      return setErrorMessage("Password should have more than 8 characters");
    }

    try {
      const res = await api.post(`/users/reset-password/${token}`, {
        password,
      });
      if (res.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      setErrorMessage("Error resetting password");
    }
  };

  return (
    <AuthLayout>
    <div className='flex min-h-screen w-full'>
      <div className='flex-1 bg-purple-600 w-1/2 p-12 flex items-center'>
        <div className='max-w-2xl'>
          <img
          src={authpng}
          alt="Login Illustration"
          className="max-w-sm rounded-md mb-20 w-full h-full"
        />
          <p className='text-purple-200'>
            Automate document management to boost efficiency, reduce errors, and
            focus on strategic goals.
          </p>
        </div>
      </div>

      <div className='flex-1 w-1/2 items-center justify-center'>
        <div className='p-12 flex items-center justify-center'>
          <div className='w-full max-w-md'>
            <div className='flex items-center mb-8'>
              <div className='flex items-center justify-center w-full'>
                <img src={loginLogo} alt='Neo' className='w-40' />
              </div>
            </div>

            <div className='bg-white rounded-lg border p-8'>
              <h2 className='text-xl font-bold text-center mb-1'>
                Reset Password
              </h2>
              <p className='text-gray-600 mb-6 text-sm text-center'>
                Reset your password here. Create a new password to secure your
                account and get back on track.
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type='password'
                  placeholder='New Password'
                  value={password}
                  autocomplete='new-password'
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
                <input
                  type='password'
                  placeholder='Confirm Password'
                  value={confirmPassword}
                  autocomplete='new-password'
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
                <button
                  type='submit'
                  className='w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                >
                  Reset Password
                </button>
                {errorMessage && (
                  <p className='mt-2 text-red-600 text-sm'>{errorMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
        <div className='text-xs text-center w-full'>
          © 2024 NEO India, Inc. All rights reserved.
        </div>
      </div>
    </div>
    </AuthLayout>
  );
};

export default ResetPassword;
