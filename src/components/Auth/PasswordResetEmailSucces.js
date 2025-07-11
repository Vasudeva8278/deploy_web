import React from 'react';
import loginlogo from '../../Assets/login-logo.png';
import AuthLayout from './AuthLayout';

function PasswordEmailResetSuccess() {
    return (
        <AuthLayout>
        <div className="flex min-h-screen w-full">
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
                <h2 className="text-xl font-bold text-center mb-1">Reset your password</h2>
                <p className="text-gray-600 mb-6 text-sm text-center">Reset your password now to secure your account and continue where you left off.</p>
                
                  
                  <div className='bg-gray-100 w-96 h-50 p-4 text-center'>
                      Your email for a link to reset your password has been sent. If it doesn’t appear within a few minutes, check your spam folder.
                  </div>
                  <button className='w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50' onClick={() => window.location.href = '/login'}>
                      Return to sign in
                  </button>
              </div>
            </div>
          </div>
          <div className='text-xs text-center w-full'>© 2024 NEO India, Inc. All rights reserved.</div>
        </div>
      </div>
      </AuthLayout>
    );
}

export default PasswordEmailResetSuccess;
