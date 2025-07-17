import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaEdit, FaDownload, FaTrash, FaEllipsisV } from 'react-icons/fa';
import thumbnailImg from '../../Assets/thumbnail.png'
import leafbg from '../../Assets/leafy-bg.png';
const Card = ({ project, thumbnail, onEdit }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleEditProject = () => {
    onEdit(project);
  };

  const closeProject = () => {
    console.log("closing project")
  }

  const viewTemplates = (project) => {
    navigate(`/projects/${project._id}`, { state: { data: project } });
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col w-full relative overflow-hidden"
      
    >
     <div 
     style={{
      backgroundImage: `url(${leafbg})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'rgba(255,255,255,0.95)',
    }}>
      <div className="flex justify-end p-2">
        <div ref={menuRef} className="relative z-15">
          <button
            className="flex items-center justify-center w-6 h-8 text-gray-500 rounded-full bg-gray-100 hover:text-gray-700 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="More options"
          >
            <FaEllipsisV className="text-sm" />
          </button>
          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-1  ml-4 w-39 bg-white rounded-md shadow-lg border border-gray-200 z-30 overflow-hidden">
              <div className="py-3" role="menu" aria-orientation="vertical" >
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                  onClick={() => {
                    handleEditProject(project._id);
                    setMenuOpen(false);
                  }}
                >
                  <FaEdit className="mr-3 text-gray-400" />
                  Edit
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                  onClick={() => {
                    viewTemplates(project);
                    setMenuOpen(false);
                  }}
                >
                  <FaFileAlt className="mr-3 text-gray-400" />
                  View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Section */}
      <div className="flex-1 px-4 pb-2">
        <div
          className="w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
          style={{
            height: '120px',
            minHeight: '120px',
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {thumbnail && (thumbnail !== null && thumbnail !== undefined) ? (
              <img
                src={`data:image/png;base64,${thumbnail}`}
                alt={`${project.projectName} thumbnail`}
                className="w-full h-full object-cover"
                style={{ transform: 'scale(0.9)' }}
              />
            ) : (
              <img
                src={thumbnailImg}
                alt="Default thumbnail"
                className="w-full h-full object-cover opacity-60"
                style={{ transform: 'scale(0.9)' }}
              />
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Project Name and Folder */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-gray-900 text-center truncate">
          {project.projectName}
        </h3>
        <div className="flex items-center justify-center mt-1">
          <svg className="w-4 h-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
          <span className="text-xs text-gray-600 truncate">Testing Folder</span>
        </div>
      </div>
    </div>
  );
};

const ProjectCards = ({ projects, onEdit }) => {
  // Handle empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:mr-10">
        <FaFileAlt className="text-gray-300 text-6xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500 text-center max-w-md">
          Create your first project to get started with templates and documents.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        id="cardContainer" 
        className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8"
      >
        {projects.map((project) => (
          <Card
            project={project}
            key={project._id}
            projectId={project._id}
            name={project.fileName}
            thumbnail={project.thumbnail}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCards;