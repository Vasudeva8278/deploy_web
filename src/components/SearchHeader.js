import React, { useEffect, useState, useContext } from 'react';
import DesignTemplate from './DesignTemplate';
import NeoModal from './NeoModal';
import GenerateDocument from './GenerateDocument';
import { Search, FileText, Sparkles, ChevronRight, User } from 'lucide-react';
import bannerImage from "../Assets/Banner.jpg";
import { FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";

const SearchHeader = ({ projectId, hasProject = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayPage, setDisplayPage] = useState("");
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const { user } = useContext(AuthContext);

  const openModal = (page) => {
    setDisplayPage(page);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  return (
    <div className="w-full max-w-8xl mx-auto p-2 sm:p-6">
      <div className="mb-4 sm:mb-6 relative">
        <div 
          className="bg-cover bg-center rounded-2xl overflow-hidden border-2 border-white-200"
          style={{ backgroundImage: `url(${bannerImage})`, height: '250px' }}
        >
          <div className="flex items-center justify-between p-2 sm:p-8 relative h-full bg-opacity-30">
            {/* Arrows for banner or additional content can go here */}
          </div>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="flex flex-col sm:flex-row items-center gap-2 justify-end">
        {!(user && user.role === EXECUTIVE_ROLE_ID) && (
          <button
            onClick={() => openModal('designTemplates')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-md text-sm"
          >
            <FileText className="w-5 h-5" />
            Design Template
          </button>
        )}
        <button
          onClick={() => openModal('generateDocs')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md text-sm"
        >
          <Sparkles className="w-5 h-5" />
          Generate Documents
        </button>
      </div>
    
      {/* Modal using the existing NeoModal for consistency */}
      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <React.Suspense fallback={<div className="p-4">Loading...</div>}>
          {(() => {
            try {
              if (displayPage === 'designTemplates') {
                return <DesignTemplate onClose={() => setIsModalOpen(false)} value={selectedProject} hasProject={hasProject} />;
              }
              if (displayPage === 'generateDocs') {
                return <GenerateDocument onClose={() => setIsModalOpen(false)} value={selectedProject} hasProject={hasProject} />;
              }
              return <div className="p-4 text-gray-500">No content selected.</div>;
            } catch (err) {
              console.error('Error rendering modal content:', err);
              return <div className="p-4 text-red-500">An error occurred while loading the modal content.</div>;
            }
          })()}
        </React.Suspense>
      </NeoModal>
    </div>
  );
};

export default SearchHeader;