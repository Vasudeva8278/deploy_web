import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EyeIcon } from "@heroicons/react/outline";
import { IoIosAddCircleOutline } from "react-icons/io";

const ViewClient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { client } = location.state; // Retrieve the client object passed from Clients page

  const handlePreviewDocument = (id, templateId) => {
    navigate(`/docview/${id}?templateId=${templateId}`);
  };

  const handleAddDocument = (projectId, projectName) => {
    const projectData = { _id: projectId, projectName: projectName };
    navigate(`/viewAllHighlights`, { state: { project: projectData, client: client } });
  };

  // Group documents by projectId
  const groupedDocuments = client.documents.reduce((acc, doc) => {
    const projectId = doc.templateId.projectId._id;
    const projectName = doc.templateId.projectId.projectName;

    if (!acc[projectId]) {
      acc[projectId] = { projectName, documents: [] };
    }

    acc[projectId].documents.push(doc);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Details</h2>
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">Name: {client.name}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Number of Documents: <span className="font-medium">{client.documents.length}</span>
        </p>

        <div className="mt-6 space-y-8">
          {Object.entries(groupedDocuments).map(([projectId, projectData]) => (
            <div key={projectId} className="bg-gray-100 p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold text-gray-800">{projectData.projectName}</h4>
                <button
                  onClick={() => handleAddDocument(projectId, projectData.projectName)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
                >
                  <IoIosAddCircleOutline className="w-6 h-6 mr-2" />
                  <span className="text-sm font-medium">Add Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectData.documents.map((doc) => (
                  <div
                    key={doc.documentId}
                    className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow"
                  >
                    <p className="text-gray-600 text-sm mb-3 font-medium">
                      {doc.templateId.fileName}
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewClient;
