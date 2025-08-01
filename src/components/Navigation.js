import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Swal from 'sweetalert2';
import { BsPeopleFill } from "react-icons/bs";
import { FaFile } from "react-icons/fa6";
import {
  FaHome,
  FaBuilding,
  FaUser,
  FaSignOutAlt,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaRegFolderOpen,
  FaDotCircle,
  FaFileSignature 
} from "react-icons/fa";
import { MdArrowDropDown } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import { RiLayout4Line } from "react-icons/ri";
import { GoHome } from "react-icons/go";
import { HiOutlineUserGroup } from "react-icons/hi";
import logo from '../Assets/logo-neo.png';
import NeoModal from "./NeoModal";
import NeoProject from "../pages/NeoProject";
import axios from "axios";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showName, setShowName] = useState(false);
  const [roleFeatures, setRoleFeatures] = useState(null);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [roles, setRoles] = useState([]);

  // Fetch all roles and user's specific role
  useEffect(() => {
    const fetchRolesAndUserRole = async () => {
      if (user && user.role) {
        try {
          const API_URL = process.env.REACT_APP_API_URL || "http://13.200.200.137:7000";
          
          // Fetch all roles
          const rolesResponse = await axios.get(`${API_URL}/api/roles`);
          setRoles(rolesResponse.data);
          
          // Fetch user's specific role
          const userRoleResponse = await axios.get(`${API_URL}/api/roles/${user.role}`);
          setUserRole(userRoleResponse.data);
          setRoleFeatures(userRoleResponse.data.features || []);
          
          console.log('User role data:', userRoleResponse.data);
          console.log('User role features:', userRoleResponse.data.features);
        } catch (error) {
          console.error('Error fetching roles:', error);
          setRoleFeatures([]);
          setUserRole(null);
        } finally {
          setFeaturesLoading(false);
        }
      } else {
        setRoleFeatures([]);
        setUserRole(null);
        setFeaturesLoading(false);
      }
    };
    fetchRolesAndUserRole();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  const isProjectActive = (projectId) => {
    if (projectId) {
      return location.pathname.startsWith(`/NeoTemplates/${projectId}`);
    }
    return location.pathname.startsWith('/NeoTemplates');
  };

  const isDocumentActive = (projectId) => {
    if (projectId) {
      return location.pathname.startsWith(`/NeoDocements/${projectId}`);
    }
    return location.pathname.startsWith('/NeoDocements');
  };

  const isNeoTemplatesActive = () => {
    const hash = location.hash || '';
    return hash.startsWith('#/NeoTemplates');
  };

  const handleProjects = () => {
    navigate(`/projects`);
  };

  const handleClients = () => {
    navigate("/clients");
  };

  const handleTemplates = () => {
    navigate(`/NeoTemplates`);
  };

  const handleDocuments = () => {
    navigate(`/NeoDocements`);
  };

  const gotoHome = () => {
    navigate("/Home");
  };

  const handleUserManage = () => {
    navigate("/UserManage");
  };

  const handleRoleFeatureManagement = () => {
    navigate("/RoleFeatureManagement");
  };

  const handleProjectsTemplates = (project) => {
    navigate(`/projects/${project._id}`, { state: { data: project } });
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    navigate(`/projects`);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Enhanced logout handler with SweetAlert
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
        // Show success message
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
          // Perform logout and redirect
          logout();
          navigate('/');
        });
      }
    });
  };

  // Helper function to check if user has a specific feature
  const hasFeature = (featureKey) => {
    // Admin users have access to all features
    if (isAdminOrSuperAdmin()) {
      return true;
    }
    return roleFeatures && roleFeatures.includes(featureKey);
  };

  // Helper function to check if user is Admin or Super Admin
  const isAdminOrSuperAdmin = () => {
    if (!userRole) return false;
    const roleName = userRole.name.toLowerCase();
    return roleName.includes('admin') || roleName.includes('super');
  };

  // Helper function to render navigation items
  const NavItem = ({ to, onClick, icon: Icon, label, projectSpecific = false, projectId = null, featureKey, active, adminOverride = false }) => {
    const isActiveNav = typeof active === 'boolean'
      ? active
      : (projectSpecific
          ? isProjectActive(projectId)
          : isActive(to) || (to === "/projects" && location.pathname.startsWith("/projects/") && !projectId));
    
    // Admin users can see all navigation items, or check if user has feature
    const shouldShow = !featureKey || hasFeature(featureKey) || (adminOverride && isAdminOrSuperAdmin()) || isAdminOrSuperAdmin();
    
    // Only render if user has the feature or is admin
    if (!shouldShow) return null;

    return (
      <li className="w-full flex justify-center">
        <div
          onClick={onClick || (() => navigate(to))}
          className={`
            flex flex-col items-center rounded-lg cursor-pointer w-full transition duration-200
            hover:bg-blue-100 
            ${isActiveNav ? "shadow-md shadow-blue-300 bg-blue-50" : ""}
            p-1 sm:p-2
          `}
          title={isMobile ? label : ''}
        >
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${!isMobile ? 'mb-1' : ''} ${isActiveNav ? "text-blue-600" : "text-gray-700"}`} />
          {!isMobile && (
            <span className={`text-xs font-semibold text-center ${isActiveNav ? "text-blue-600" : "text-gray-700"}`}>
              {label}
            </span>
          )}
        </div>
      </li>
    );
  };

  if (featuresLoading) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <div
      className={`
        fixed top-0 left-0 z-30
        border-r border-white
        flex flex-col
        h-screen
        overflow-y-auto overflow-x-hidden
        bg-white
        text-white
        transition-all duration-300
        w-20
        no-scrollbar
        border-2 border-gray-200
        
      `}
    >
      {/* Logo Section */}
     

      {/* Main Navigation Items */}
      <nav className={`flex flex-col items-center flex-1 ${isMobile ? 'py-2 space-y-2' : 'py-4 space-y-4'}`}>
        <ul className={`w-full flex flex-col items-center ${isMobile ? 'space-y-1' : 'space-y-2'}`}>
          {/* Navigation based on role features - Ordered as requested */}
          <NavItem to="/dashboard" icon={FaHome} label="Dashboard" />
          <NavItem to="/projects" onClick={handleProjects} icon={FaRegFolderOpen} label="Projects" featureKey="Projects" />
          <NavItem to="/clients" onClick={handleClients} icon={HiOutlineUserGroup} label="Clients" featureKey="Clients" />
          <NavItem to="/NeoTemplates" onClick={handleTemplates} icon={RiLayout4Line} label="Templates" featureKey="Templates" />
          <NavItem to="/NeoDocements" onClick={handleDocuments} icon={FaFile} label="Documents" featureKey="Documents" />
          <NavItem to="/UserManage" onClick={handleUserManage} icon={BsPeopleFill} label="Users" featureKey="Users" />
          <NavItem to="/RoleFeatureManagement" onClick={handleRoleFeatureManagement} icon={FaUser} label="Roles" featureKey="Roles" />

          {/* Additional features based on user's role features */}
         
        </ul>
        
      </nav>

      {/* Logout Section at the bottom */}
      <div className={`w-full border-t border-gray-300 flex justify-center ${isMobile ? 'py-2' : 'py-4'}`}>
        <div
          onClick={handleLogout}
          className='flex flex-col items-center p-2 rounded-lg cursor-pointer w-full hover:bg-red-100 transition duration-200 group'
        >
          <FaSignOutAlt className='w-5 h-5 mb-1 text-gray-700 group-hover:text-red-600 transition-colors duration-200' />
          {!isMobile && (
            <span className='text-xs font-semibold text-center text-gray-700 group-hover:text-red-600 transition-colors duration-200'>
              Logout
            </span>
          )}
        </div>
      </div>

      {/* Modal for New Project */}
      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NeoProject
          mode={"add"}
          project={""}
          onSave={handleSave}
          handleClose={handleCancel}
        />
      </NeoModal>
    </div>
  );
};

export default Navigation;