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

  const handleTemplateCreated = () => {
    // e.g., refresh templates, show a toast, etc.
    setIsModalOpen(false);
    // Optionally trigger a parent refresh if needed
  };

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  return (
    <div className="w-full p-2 sm:p-6">
      <div className="mb-4 sm:mb-6 relative">
      <div
          className="bg-cover bg-center  overflow-hidden   w-full  mx-auto"
          // max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl 3xl:max-w-7xl h-[250px] rounded-2xl border-2 border-white-200
          // style={{ backgroundImage: `url(${bannerImage})`, height: '250px' }}
        >
        <img src={bannerImage} alt='banner' />
          
        </div>
      </div>

      {/* Modal using the existing NeoModal for consistency */}
      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <React.Suspense fallback={<div className="p-4">Loading...</div>}>
          {(() => {
            try {
              if (displayPage === 'designTemplates') {
                return (
                  <DesignTemplate
                    onClose={() => setIsModalOpen(false)}
                    value={selectedProject}
                    hasProject={hasProject}
                    onTemplateCreated={handleTemplateCreated}
                  />
                );
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