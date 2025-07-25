import React, { useContext, useEffect, useState } from "react";
// import SearchHeader from "../components/SearchHeader";
import { getAllClients } from "../services/clientsApi";
// import folder from "../assets/folder.jpg";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaFolder, FaEllipsisV, FaSearch } from "react-icons/fa";
import { ProjectContext } from "../context/ProjectContext";
import NeoModal from "../components/NeoModal";
import { motion } from "framer-motion";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { projects } = useContext(ProjectContext);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getAllClients();
        setClients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleClientClick = (client) => {
    navigate('/viewclient', { state: { client } });
  };

  const handleCreateClient = (projectData) => {
    navigate('/viewAllHighlights', {
      state: { project: projectData },
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-auto border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Clients</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-8xl w-full p-2 ">
          <div className="md:flex justify-between items-center" >
        <h2 className="text-xl font-bold md:mb-4 text-left md:ml-6">Clients</h2>
        <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
              >
                <FaUserPlus className="w-5 h-5" />
                Add Client
              </button>
        </div>

          
            <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-1 sm:mt-5 2xl:mr-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 sm:mt-0 ml-6">
                {filteredClients.map(client => (
                  <motion.div
                    key={client._id}
                    className="bg-white rounded-lg shadow p-4 sm:p-6 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
                    onClick={() => handleClientClick(client)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FaFolder className="h-6 w-6 text-blue-500" />
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <FaEllipsisV />
                      </button>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{client.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {client.documents.length} Documents
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 sm:p-6 w-full max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Client</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Project
              </label>
              <select
                id="projectSelect"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setSelectedProject(e.target.value)}
                value={selectedProject}
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={JSON.stringify(project)}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => selectedProject && handleCreateClient(JSON.parse(selectedProject))}
                disabled={!selectedProject}
              >
                Create Client
              </motion.button>
            </div>
          </div>
        </div>
      </NeoModal>
    </>
  );
};

export default Clients;