import React, { useContext, useEffect, useState } from "react";
// import SearchHeader from "../components/SearchHeader";
import { getAllClients, deleteClient } from "../services/clientsApi";
// import folder from "../assets/folder.jpg";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaFolder, FaEllipsisV, FaSearch, FaTrash } from "react-icons/fa";
import { LuCreditCard } from "react-icons/lu";
import { FaTable } from "react-icons/fa";
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
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // NEW: view mode state
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

  const handleDeleteClient = async (clientId, clientName, event) => {
    event.stopPropagation(); // Prevent card click when clicking delete button
    
    if (!window.confirm(`Are you sure you want to delete client "${clientName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingClientId(clientId);
    setDeleteError(null);

    try {
      await deleteClient(clientId);
      // Remove the client from the local state
      setClients(prevClients => prevClients.filter(client => client._id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
      setDeleteError(error.message || 'Failed to delete client. Please try again.');
    } finally {
      setDeletingClientId(null);
    }
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
        <div className="flex justify-between items-center gap-4">
          <div>
          <button
            className={`px-4 py-1 rounded font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setViewMode('card')}
          >
            <LuCreditCard className="inline-block w-5 h-5" />
          </button>
          <button
            className={`px-4 py-1 rounded font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setViewMode('table')}
          >
            <FaTable className="inline-block w-5 h-5" />
          </button>
          </div>
        <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
              >
                <FaUserPlus className="w-5 h-5" />
                Add Client
              </button>
        </div>
        </div>

          
            <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-1 sm:mt-5 2xl:mr-20">
              {viewMode === 'card' ? (
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
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                            onClick={(e) => handleDeleteClient(client._id, client.name, e)}
                            disabled={deletingClientId === client._id}
                            title="Delete client"
                          >
                            {deletingClientId === client._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <FaTrash className="w-4 h-4" />
                            )}
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <FaEllipsisV />
                          </button>
                        </div>
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
              ) : (
                <div className="mt-4 sm:mt-0 ml-6">
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Number of Docs
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Update Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map(client => (
                          <tr 
                            key={client._id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleClientClick(client)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaFolder className="h-5 w-5 text-blue-500" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {client.documents.length} Documents
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {client.documents.length > 0 ? 
                                client.documents[0]?.templateId?.projectId?.projectName || 'N/A' : 
                                'No Project'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date().toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button 
                                  className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                                  onClick={(e) => handleDeleteClient(client._id, client.name, e)}
                                  disabled={deletingClientId === client._id}
                                  title="Delete client"
                                >
                                  {deletingClientId === client._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                  ) : (
                                    <FaTrash className="w-4 h-4" />
                                  )}
                                </button>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <FaEllipsisV />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
      {deleteError && (
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-500 text-xl mr-2">⚠️</div>
            <div>
              <h4 className="text-sm font-medium text-red-800">Delete Failed</h4>
              <p className="text-sm text-red-600">{deleteError}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Clients; 