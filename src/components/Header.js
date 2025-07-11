import React from 'react';
import { FaBell, FaCaretDown, FaBars } from 'react-icons/fa'; // Using react-icons for the icons
import logo from '../Assets/logo-neo.png';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleNavigation }) => {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 z-40 customBlue shadow-sm h-16 flex items-center" style={{ paddingLeft: '5rem' }}>
            <nav className="py-3  flex justify-between items-center w-full">
                <div className="flex items-center space-x-4 ml-6" >
               
                    <div className="text-xl font-bold w-10" >
                        <a href="/" rel="noopener noreferrer">
                        <img src={logo} alt="Logo" className='logo' />
                         </a>
                   </div>
                </div>
                <div className="flex-1 flex justify-center space-x-4 hidden">
                    <div className="relative pr-4 pl-4 m-2">
                        <button className="text-white flex items-center space-x-1">
                            <span>Generate</span>
                            <FaCaretDown /> {/* Down arrow icon */}
                        </button>
                        {/* Dropdown menu could go here */}
                    </div>
                    <div className="relative pr-4 pl-4 m-2">
                        <button className="text-white flex items-center space-x-1">
                            <span>Business</span>
                            <FaCaretDown /> {/* Down arrow icon */}
                        </button>
                        {/* Dropdown menu could go here */}
                    </div>
                    <div className="relative pr-4 pl-4 m-2">
                        <button className="text-white flex items-center space-x-1">
                            <span>Plans and Pricing</span>
                            <FaCaretDown /> {/* Down arrow icon */}
                        </button>
                        {/* Dropdown menu could go here */}
                    </div>
                    <div className="relative pr-4 pl-4 m-2">
                        <button className="text-white flex items-center space-x-1">
                            <span>Learn</span>
                            <FaCaretDown /> {/* Down arrow icon */}
                        </button>
                        {/* Dropdown menu could go here */}
                    </div>
                </div>
                <div className="flex items-center space-x-4 pr-4">
                    <button
                        className="bg-white text-customBlue px-6 py-2 rounded-lg"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>
                    {/* <button
                        className="bg-white text-customBlue px-4 py-2 rounded-lg"
                        onClick={() => navigate('/signup')}
                    >
                        Signup
                    </button> */}
                    {/* <button className="bg-white text-customBlue px-4 py-2 rounded-lg">Create Design</button> */}
                    <button className="text-white p-3 border rounded-lg"><FaBell /></button>
                </div>
            </nav>
        </header>
    );
}

export default Header;
