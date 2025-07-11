import React, { useState, useContext } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api, { forgotPassword } from '../../services/api';
import loginlogo from '../../Assets/login-logo.png';
import AuthLayout from './AuthLayout';


const ForgotPassword = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const mutation = useMutation(async (loginData) => {
    setLoading(true);
    const response = await api.post('/users/login', loginData);
    return response.data;
  }, {
    onSuccess: (data) => {
      setLoading(false);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('orgId', data.user.orgId);
    },
    onError: (error) => {
      setLoading(false);
      setError(error.response?.data?.message || 'Login failed');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate the input value (e.g., check if it's a valid email or phone number format)
    if (!value) {
      setError('Please enter your email or phone number.');
      return;
    }

    // Here you would handle the password reset logic, e.g., making an API call
    const response = await forgotPassword(value);
   // console.log(response)
   // console.log(response.success)
    if (response.success) {
      // Redirect to a success page
     navigate('/resetEmailSuccess');
  } else {
    //setError(response.message);
    setError("Sorry! there is an unexpected error!. Please try later again..")
    return;
  }


    // Clear the input field and error after submission
    setValue('');
    setError('');
  };

  return (
    <AuthLayout>
    <div className="flex  w-full">
      <div className="flex-1 bg-purple-600 w-1/2 p-12 flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-6">Revolutionize Document Management with Automation</h1>
          <p className="text-purple-200">Automate document management to boost efficiency, reduce errors, and focus on strategic goals.</p>
        </div>
      </div>
      
      <div className="flex-1 w-1/2 items-center justify-center">
        <div className="p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex items-center mb-8">
              <div className="flex items-center justify-center w-full">
                <img src={loginlogo} alt="Neo" className='w-40' />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-8">
              <h2 className="text-xl font-bold text-center mb-1">Welcome Back 👋</h2>
              <p className="text-gray-600 mb-6 text-sm text-center">No worries! Enter your email to receive instructions for resetting your password and regain access to your account.</p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email-phone" className="block text-gray-700 mb-2">Enter your email or phone number:</label>
                  <input
                    type="text"
                    id="email-phone"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email or Phone Number"
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Send Reset Link
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className='text-xs text-center w-full mb-3'>© 2024 NEO India, Inc. All rights reserved.</div>
      </div>
    </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
