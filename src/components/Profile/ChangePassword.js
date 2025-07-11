import React, { useState } from "react";
import axios from "axios"; // Ensure you have axios installed
import { changePassword } from "../../services/profileApi";
import reset from '../../Assets/reset_Icon.jpeg';
import { RxReload } from "react-icons/rx";

const ChangePassword = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match!");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(oldPassword, newPassword);
      const response = await changePassword(oldPassword, newPassword);
      console.log(response);
      alert(response.data.message || "Password changed successfully!");
      onClose();
    } catch (err) {
      // Handle errors
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-5 flex-row'>
      <div className='m-auto items-center blue justify-center w-10 h-10 bg-blue-100 rounded-full border border-blue-900'>
        <img src={reset} />
      </div>

      <h2 className='text-lg font-semibold text-center mt-4 mb-6'>
        Change Password
      </h2>

      {error && (
        <p className='text-red-500 text-sm text-center mb-4'>{error}</p>
      )}

      {/* Form */}
      <form onSubmit={handleSave}>
        {/* Old Password */}
        <div className='mb-4'>
          <label
            htmlFor='old-password'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Old Password
          </label>
          <input
            type='password'
            id='old-password'
            placeholder='Enter old password'
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* New Password */}
        <div className='mb-4'>
          <label
            htmlFor='new-password'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            New Password
          </label>
          <input
            type='password'
            id='new-password'
            placeholder='Enter new password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* Confirm Password */}
        <div className='mb-6'>
          <label
            htmlFor='confirm-password'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Confirm Password
          </label>
          <input
            type='password'
            id='confirm-password'
            placeholder='Enter confirm password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            // className='mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            className='border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* Actions */}
        <div className='flex justify-center space-x-4'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200'
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
