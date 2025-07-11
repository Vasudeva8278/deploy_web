import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineSetting, AiOutlineSearch } from 'react-icons/ai'
const Header = () => {
  return (
    <header className="bg-white text-gray-800 shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">

          <h1 className="text-2xl font-semibold">My Application</h1>
        </div>
        <div className="relative flex-1 mx-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded transition duration-200">
            <FaUserCircle size={24} />
            <span>Profile</span>
          </button>
          <button className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded transition duration-200">
            <AiOutlineSetting size={24} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
