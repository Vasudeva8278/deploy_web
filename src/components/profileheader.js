import React, { useContext, useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import photo from "../Assets/general_profile.png";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

const ProfileHeader = ({ onSearch }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef(null);

  const getRoleName = (roleId) => {
    if (roleId === "685f9b7d3d988647b344e5ca") return "Admin";
    if (roleId === "68621581db15fbb9bbd2f836") return "Neo Expert";
    if (roleId === "68621597db15fbb9bbd2f838") return "Neo Executive";
    if (roleId === "6870a1c2f0884e1560f8dadf") return "Neo Admin";
    return "User";
  };

  // Print user role information
  useEffect(() => {
    if (user) {
      console.log("ProfileHeader - User Role ID:", user.roleId || user.role);
      console.log("ProfileHeader - User Role Name:", getRoleName(user.roleId || user.role));
      console.log("ProfileHeader - User Profile Pic:", user.profilePic);
      console.log("ProfileHeader - Full User Object:", user);
    }
  }, [user]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg',
        title: 'text-gray-800 font-semibold',
        content: 'text-gray-600',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        cancelButton: 'px-6 py-2 rounded-lg font-medium'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-lg',
            title: 'text-gray-800 font-semibold',
            content: 'text-gray-600'
          }
        }).then(() => {
          logout();
          navigate('/');
        });
      }
    });
  };

  // Handle screen resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center fixed top-0 left-20 z-30 bg-white h-[60px] px-6" style={{ width: "calc(100vw - 80px)" }}>
      {/* Search Bar */}
      <span className="text-2xl font-bold">NEO</span>
      <div className="relative max-w-3xl flex-1 mt-2">
        <input
          type="text"
          placeholder="Search by name or character"
          className="w-full pl-12 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent text-gray-700 bg-[#f5f6fa] border-2 border-gray-200"
          onChange={e => onSearch && onSearch(e.target.value)}
        />
      </div>

      {/* Profile Section */}
      <div className="relative flex items-center gap-2 sm:gap-3 cursor-pointer" ref={dropdownRef}>
        {/* Show name and role on desktop */}
        <div className="hidden sm:block text-right">
          <div className="text-sm font-semibold text-gray-800">
            {user?.name || "User"}
          </div>
          <div className="text-xs text-gray-500">
            {getRoleName(user?.roleId || user?.role)}
          </div>
        </div>

        {/* Profile Icon and Chevron */}
        <div
          className="flex items-center gap-1"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img
            src={user?.profilePic || photo}
            alt="Profile"
            key={user?.profilePic || 'default'} // Force re-render when profilePic changes
            className="w-8 h-8 rounded-full object-cover"
          />
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>

        {/* Dropdown card */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg z-50 px-4 py-3 w-52 sm:w-64">
            <div className="flex flex-col items-start space-y-1 mb-2">
              <span className="font-semibold text-gray-800 text-sm">{user?.name || "User"}</span>
              <span className="text-xs text-gray-500">{getRoleName(user?.roleId || user?.role)}</span>
            </div>
            <hr className="my-2" />
            <button
              className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button
              className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
