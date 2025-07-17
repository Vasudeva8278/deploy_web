import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaEdit, FaDownload, FaTrash, FaEllipsisV, FaEye, FaPlus } from 'react-icons/fa';
import thumbnail from '../../Assets/thumbnail.png';
import thumbnailImg from '../../Assets/thumbnail.png';
import NeoModal from '../NeoModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';
import { getAllProjects } from "../../services/projectApi";
import leafyBg from '../../Assets/leafy-bg.png';

const Card = ({ docObj, documentId, name, thumbnail, content, handleDelete, handleDownload, template, projectId, projectMap }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [deleteTemplateModal, setDeleteTemplateModal] = useState(false);

  // Get project name from projectMap
  const getProjectName = (projectId) => {
    if (!projectId) return '';
    return projectMap[projectId] || 'Unknown Project';
  };

  useEffect(() => {
    if (docObj.type === 'template') {
      console.log('Template card data:', docObj);
    }
  }, [docObj]);

  const handleView = (docId) => {
    if (template) {
      navigate(`/docview/${docId}`);
    } else {
      navigate(`/document/${docId}`);
    }
  };

  const handleEdit = (docId) => {
    let goTo;
    if (projectId) {
      goTo = `/document/${docId}?projectId=${projectId}`;
    } else {
      goTo = `/document/${docId}`;
    }
    navigate(goTo);
  };

  const promptForDeletion = (documentId) => {
    setDeleteTemplateModal(true);
  };

  const handleCreateDocuments = async (docId) => {
    console.log('Template data:', docObj);
    console.log('projectId used for Create Document:', docObj.projectId);
    if (!docObj.projectId || docObj.projectId === 'undefined') {
      toast.error('Project ID is missing!');
      return;
    }
    try {
      const res = await api.get(`/projectDocs/${docObj.projectId}/template-documents/${docId}`);
      if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        toast.info('No documents found for this template.');
        return;
      }
      navigate(`/export/${docId}?projectId=${docObj.projectId}`);
    } catch (error) {
      let message = 'Failed to create document. Please try again.';
      if (error.response && error.response.status === 500) {
        message = 'Server error while creating document. Please contact support or try again later.';
      }
      toast(
        <div>
          <div>{message}</div>
          <button
            style={{ marginTop: '8px', padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => navigate('/clients')}
          >
            Create Client and Add Document
          </button>
        </div>,
        { autoClose: 8000 }
      );
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  const handleDocumentDocument = (docObj) => {
    setMenuOpen(false);
    handleDownload(docObj);
  };

  const confirmDelete = () => {
    setDeleteTemplateModal(false);
    handleDelete(documentId);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow flex flex-col justify-between w-full max-w-sm mx-auto h-auto min-h-[320px] sm:min-h-[340px] lg:min-h-[360px] p-0 relative transition hover:shadow-lg group"
       
    >
    <div
    style={{
      backgroundImage: `url(${leafyBg})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'rgba(255,255,255,0.95)',
    }}
    >
      <ToastContainer />
        <div className="flex justify-end p-2">
          <div ref={menuRef} className="relative z-10">
          <button
              className="flex items-center px-2 py-2 text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-800 text-sm sm:text-base"
            onClick={toggleMenu}
          >
            <FaEllipsisV />
          </button>
          {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white rounded-md shadow-lg z-20 text-xs sm:text-sm">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {!template && (
                  <button
                      className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleCreateDocuments(documentId)}
                  >
                      <FaFileAlt className="mr-1 sm:mr-2 text-xs" /> Create Document
                  </button>
                )}
                {template && (
                  <button
                      className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleView(documentId)}
                  >
                      <FaFileAlt className="mr-1 sm:mr-2 text-xs" /> View
                  </button>
                )}
                {!template && (
                  <button
                      className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleEdit(documentId)}
                  >
                      <FaEdit className="mr-1 sm:mr-2 text-xs" /> Edit
                  </button>
                )}
                {template && (
                  <button
                      className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleDocumentDocument(docObj)}
                  >
                      <FaDownload className="mr-1 sm:mr-2 text-xs" /> Download
                  </button>
                )}
                <button
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => promptForDeletion(documentId)}
                >
                    <FaTrash className="mr-1 sm:mr-2 text-xs" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Image/Preview */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4">
        <div
          style={{
              height: '120px',
              width: '100%',
            backgroundColor: '#f5f6fa',
              borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            className="mb-2 sm:h-[140px] lg:h-[150px] sm:rounded-2xl"
        >
          {thumbnail && (thumbnail !== null || thumbnail !== undefined) ? (
              <img src={`data:image/png;base64,${thumbnail}`} className="object-contain h-full w-full" />
            ) : (
              <img src={thumbnailImg} className="object-contain h-full w-full" />
          )}
        </div>
      </div>
      </div>

        {/* Card Bottom (Title & Project) */}
        <div className="flex-1 flex flex-col justify-between px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
        <div className="text-sm sm:text-base font-semibold truncate text-gray-800 mb-1 leading-tight">
          {docObj.fileName}
        </div>
        
          {/* Display project name if available */}
          {docObj.projectId && (
            <div className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
              Project: {getProjectName(docObj.projectId)}
            </div>
          )}
          
          {/* For template cards, print all data as JSON for debugging */}
        {docObj.type === 'template' && (
            <pre className="text-xs bg-gray-50 rounded p-2 mt-2 overflow-x-auto max-h-20 sm:max-h-32 border border-gray-100 hidden sm:block">
            {JSON.stringify(docObj, null, 2)}
          </pre>
        )}
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-4">
          {docObj.type === 'template' && (
            <>
              <button
                  className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => {
                  if (!docObj.projectId) {
                    alert('This template is not linked to a project. You cannot create a document without a project.');
                    return;
                  }
                  handleCreateDocuments(documentId);
                }}
                disabled={!docObj.projectId}
                style={!docObj.projectId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                title={!docObj.projectId ? 'Cannot create document: No project linked.' : ''}
              >
                  Create Document
              </button>
                <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" onClick={() => alert('Edit Template')}>
                Edit
              </button>
                <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onClick={() => alert('Delete Template')}>
                Delete
              </button>
            </>
          )}
          {docObj.type === 'project' && (
            <>
                <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" onClick={() => alert('Edit Project')}>
                Edit
              </button>
                <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onClick={() => alert('Delete Project')}>
                Delete
              </button>
            </>
          )}
          {docObj.type === 'document' && (
            <>
                <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" onClick={() => alert('View Document')}>
                View
              </button>
                <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" onClick={() => alert('Download Document')}>
                Download
              </button>
                <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onClick={() => alert('Delete Document')}>
                Delete
              </button>
            </>
          )}
          </div>
        </div>

        <NeoModal isOpen={deleteTemplateModal} onClose={() => setDeleteTemplateModal(false)} handleDelete={() => handleDelete(documentId)}>
          <div className="p-4 sm:p-6 bg-white max-w-xs sm:max-w-sm mx-auto">
            <h5 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4">Are you sure?</h5>
            <p className="text-sm sm:text-base text-center mb-4 sm:mb-6">You want to delete the {!template ? 'template' : 'document'}?</p>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              <button
                className="inline-flex justify-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setDeleteTemplateModal(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex justify-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => confirmDelete()}
              >
                Yes
              </button>
            </div>
          </div>
        </NeoModal>
      </div>
    </>
  );
};

const TableRow = ({ doc, handleDeleteTemplate, handleDownload, template, projectMap }) => {
  const navigate = useNavigate();
  const [deleteTemplateModal, setDeleteTemplateModal] = useState(false);

  const handleView = () => {
    if (template) {
      navigate(`/docview/${doc._id}`);
    } else {
      navigate(`/document/${doc._id}`);
    }
  };

  const handleEdit = () => {
    navigate(`/document/${doc._id}`);
  };

  const handleCreateDoc = () => {
    navigate(`/export/${doc._id}?projectId=${doc.projectId}`);
  };

  const handleDownloadDoc = () => {
    handleDownload && handleDownload(doc);
  };

  const confirmDelete = () => {
    setDeleteTemplateModal(false);
    handleDeleteTemplate(doc._id);
  };

  // Get project name from projectMap
  const getProjectName = (projectId) => {
    if (!projectId) return 'Unknown';
    return projectMap[projectId] || 'Unknown';
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
          <div className="truncate max-w-[120px] sm:max-w-none">{doc.fileName}</div>
        </td>
        <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
          <div className="truncate max-w-[100px] sm:max-w-none">
            {doc.projectId
              ? getProjectName(doc.projectId)
              : Array.isArray(doc.templates) && doc.templates.length > 0
                ? doc.templates.join(', ')
                : 'No Templates'}
          </div>
        </td>
        <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm hidden sm:table-cell">
          {doc.updatedTime ? new Date(doc.updatedTime).toLocaleDateString() : 'N/A'}
        </td>
        <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
          <div className="flex flex-wrap gap-1">
            {doc.projectId ? (
              <>
                <button
                  className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  title="Create Doc"
                  onClick={handleCreateDoc}
                >
                  <FaPlus className="mr-0 sm:mr-1 text-xs" />
                  <span className="hidden sm:inline">Create</span>
                </button>
                <button
                  className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
                  title="Edit"
                  onClick={handleEdit}
                >
                  <FaEdit className="text-xs" />
                </button>
                <button
                  className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  title="Delete"
                  onClick={() => setDeleteTemplateModal(true)}
                >
                  <FaTrash className="text-xs" />
                </button>
              </>
            ) : (
              <>
                <button
                  className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  title="View"
                  onClick={handleView}
                >
                  <FaEye className="text-xs" />
                </button>
                <button
                  className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  title="Download"
                  onClick={handleDownloadDoc}
                >
                  <FaDownload className="text-xs" />
                </button>
                <button
                  className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  title="Delete"
                  onClick={() => setDeleteTemplateModal(true)}
                >
                  <FaTrash className="text-xs" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      <NeoModal isOpen={deleteTemplateModal} onClose={() => setDeleteTemplateModal(false)} handleDelete={confirmDelete}>
        <div className="p-4 sm:p-6 bg-white max-w-xs sm:max-w-sm mx-auto">
          <h5 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4">Are you sure?</h5>
          <p className="text-sm sm:text-base text-center mb-4 sm:mb-6">You want to delete this document?</p>
          <div className="flex justify-center space-x-2 sm:space-x-4">
            <button
              className="inline-flex justify-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => setDeleteTemplateModal(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex justify-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={confirmDelete}
            >
              Yes
            </button>
          </div>
        </div>
      </NeoModal>
    </>
  );
};

const TemplateCards = ({
  documents,
  handleDeleteTemplate,
  handleDownload,
  template = false,
  projectId,
  viewMode = "card",
}) => {
  const [projectMap, setProjectMap] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects();
        const map = {};
        // Support both .data and direct array
        const projectArr = Array.isArray(response) ? response : response.data;
        if (Array.isArray(projectArr)) {
          projectArr.forEach((p) => {
            map[p._id] = p.projectName || p.name || p.title || 'Unnamed Project';
          });
        }
        setProjectMap(map);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  if (viewMode === "grid") {
    // Table view
  return (
      <div className="overflow-x-auto mb-4 sm:mb-8 w-full">
        <table className="w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                  Date
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <TableRow
                  key={doc._id}
                  doc={doc}
                  handleDeleteTemplate={handleDeleteTemplate}
                  handleDownload={handleDownload}
                  template={template}
                  projectMap={projectMap}
                />
              ))}
            </tbody>
          </table>
        </div>
    );
  }

  // Card view with improved responsive grid
  return (
        <div
          id="template-card-container"
      className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 p-2 sm:p-4 max-w-full mx-auto justify-items-center"
        >
          {documents.map((doc) => (
            <Card
              docObj={doc}
              key={doc._id}
              documentId={doc._id}
              name={doc.fileName}
              thumbnail={doc.thumbnail}
              handleDelete={handleDeleteTemplate}
              handleDownload={handleDownload}
              template={template}
              projectId={doc.projectId}
          projectMap={projectMap}
            />
          ))}
    </div>
  );
};

export default TemplateCards;