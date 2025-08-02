import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EyeIcon } from "@heroicons/react/outline";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import { deleteClient } from "../services/clientsApi";

const ViewClient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { client } = location.state; // Retrieve the client object passed from Clients page
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  console.log("ViewClient rendered with client:", client);

  const handlePreviewDocument = (id, templateId) => {
    navigate(`/docview/${id}?templateId=${templateId}`);
  };

  const handleAddDocument = (projectId, projectName) => {
    console.log("Add Document clicked for:", { projectId, projectName, client });
    const projectData = { _id: projectId, projectName: projectName };
    navigate(`/viewAllHighlights`, { state: { project: projectData, client: client } });
  };

  const handleDeleteClient = async () => {
    if (!window.confirm(`Are you sure you want to delete client "${client.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteClient(client._id);
      // Navigate back to clients list on successful deletion
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      setDeleteError(error.message || 'Failed to delete client. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Group documents by projectId
  const groupedDocuments = client?.documents?.reduce((acc, doc) => {
    try {
      const projectId = doc.templateId?.projectId?._id || 'unknown';
      const projectName = doc.templateId?.projectId?.projectName || 'Unknown Project';

      if (!acc[projectId]) {
        acc[projectId] = { projectName, documents: [] };
      }

      acc[projectId].documents.push(doc);
      return acc;
    } catch (error) {
      console.error("Error processing document:", doc, error);
      return acc;
    }
  }, {}) || {};

  console.log("Client data:", client);
  console.log("Grouped documents:", groupedDocuments);

  return (
    <div className="max-w-8xl mx-auto p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Client Details</h2>
       
      </div>

      {deleteError && (
        <div className="mb-4 p-4 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-500 text-xl mr-2">⚠️</div>
            <div>
              <h4 className="text-sm font-medium text-red-800">Delete Failed</h4>
              <p className="text-sm text-red-600">{deleteError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
         
        </div>

        <div className="mt-6 space-y-8">
          {Object.entries(groupedDocuments).length > 0 ? (
            Object.entries(groupedDocuments).map(([projectId, projectData]) => (
              <div key={projectId} className="p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold text-gray-800">{client.name}</h4>
                  <button
                    onClick={() => handleAddDocument(projectId, projectData.projectName)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center shadow-md"
                  >
                    <IoIosAddCircleOutline className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Add Document</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {projectData.documents.length > 0 ? (
                    projectData.documents.map((doc) => (
                      <div
                        key={doc.documentId}
                        className="border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <p className="text-gray-600 text-sm mb-3 font-medium">
                          {(() => {
                            const name = doc.templateId.fileName || '';
                            if (name.length <= 2) return name;
                            const half = Math.ceil(name.length / 2);
                            return name.slice(0, half) + '...';
                          })()}
                        </p>
                        <button
                          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                          onClick={() =>
                            handlePreviewDocument(doc.documentId, doc.templateId._id)
                          }
                        >
                          <EyeIcon className="w-5 h-5 mr-2" />
                          <span>Preview</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <p>No documents in this project yet.</p>
                      <p className="text-sm mt-2">Click "Add Document" to create your first document.</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Fallback section when no documents exist
            <div className="p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold text-gray-800">{client.name}</h4>
                <button
                  onClick={() => handleAddDocument('default', 'Default Project')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center shadow-md"
                >
                  <IoIosAddCircleOutline className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Add Document</span>
                </button>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>No documents found for this client.</p>
                <p className="text-sm mt-2">Click "Add Document" to create your first document.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewClient;