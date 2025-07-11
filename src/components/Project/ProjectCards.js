import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaEdit, FaDownload, FaTrash, FaEllipsisV } from 'react-icons/fa';
import thumbnail from '../../Assets/thumbnail.png'
import table from '../../Assets/table.png';
import image from '../../Assets/image.png';
import imgIcon from '../../Assets/imgIcon.jpg';
import tableIcon from '../../Assets/tableIcon.png';
import thumbnailImg from '../../Assets/thumbnail.png';

const Card = ({ project,thumbnail,onEdit }) => {
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
    //navigate(`/export/${docId}?projectId=${projectId}`);
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow flex flex-col justify-between w-full sm:w-64 h-[340px] p-0 relative transition hover:shadow-lg">
      {/* Card Top (Menu) */}
      <div className="flex justify-end p-2">
        <div ref={menuRef} className="relative z-10">
          <button
            className="flex items-center px-2 py-2 text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-800"
            style={{ fontSize: '18px' }}
            onClick={toggleMenu}
          >
            <FaEllipsisV />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 text-sm">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {project && (
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleEditProject(project._id)}
                  >
                    <FaFileAlt className="mr-2" /> Edit Project
                  </button>
                )}
                {project && (
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => viewTemplates(project)}
                  >
                    <FaFileAlt className="mr-2" /> View Templates
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Card Image/Preview */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div
          style={{
            height: '150px',
            width: '100%',
            backgroundColor: '#f5f6fa',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {thumbnail && (thumbnail !== null || thumbnail !== undefined) ? (
            <img src={`data:image/png;base64,${thumbnail}`} className="object-contain h-full w-full" />
          ) : (
            <img src={thumbnailImg} className="object-contain h-full w-full" />
          )}
        </div>
      </div>
      {/* Card Bottom (Title & Folder) */}
      <div className="px-4 pb-4 pt-2">
        <div className="text-base font-semibold truncate text-gray-800 mb-1">{project.projectName}</div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#6366F1" d="M3 6a2 2 0 0 1 2-2h4.465a2 2 0 0 1 1.414.586l1.535 1.535A2 2 0 0 0 13.828 7H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/></svg>
         
        </div>
      </div>
    </div>
  );
};

const ProjectCards = ({ projects, onEdit}) => {
  return (
    <div id="cardContainer" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects?.map((project) => (
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
  );
};

export default ProjectCards;
