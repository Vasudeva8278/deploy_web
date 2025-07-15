import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaEdit, FaDownload, FaTrash, FaEllipsisV } from 'react-icons/fa';
import thumbnail from '../../Assets/thumbnail.png';
import thumbnailImg from '../../Assets/thumbnail.png';
import leafyBg from '../../Assets/leafy-bg.png';
import NeoModal from '../NeoModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';

const Card = ({ docObj, documentId, name, thumbnail, content, handleDelete, handleDownload, template, projectId, cardHeight = "h-[420px]", cardWidth = "max-w-[380px]" }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [deleteTemplateModal, setDeleteTemplateModal] = useState(false);

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
    handleDelete(documentId); // This should trigger the API call
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow flex flex-col justify-between w-full ${cardWidth} mx-auto ${cardHeight} p-0 relative transition-all duration-300 hover:shadow-xl hover:scale-105 group`}
    >
      <ToastContainer />
      
      {/* Menu Section */}
      <div className="flex justify-end p-2 sm:p-3">
        <div ref={menuRef} className="relative z-10 bg-gray-100 rounded-lg shadow-sm">
          <button
            className="flex items-center px-2 py-2 text-gray-600 rounded-lg hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
            style={{ fontSize: '16px' }}
            onClick={toggleMenu}
          >
            <FaEllipsisV />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg z-20 text-sm border border-gray-100">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {!template && (
                  <button
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleCreateDocuments(documentId)}
                  >
                    <FaFileAlt className="mr-2 text-xs sm:text-sm" /> Create Document
                  </button>
                )}
                {template && (
                  <button
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleView(documentId)}
                  >
                    <FaFileAlt className="mr-2 text-xs sm:text-sm" /> View
                  </button>
                )}
                {!template && (
                  <button
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleEdit(documentId)}
                  >
                    <FaEdit className="mr-2 text-xs sm:text-sm" /> Edit
                  </button>
                )}
                {template && (
                  <button
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleDocumentDocument(docObj)}
                  >
                    <FaDownload className="mr-2 text-xs sm:text-sm" /> Download
                  </button>
                )}
                <button
                  className="flex items-center w-full px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => promptForDeletion(documentId)}
                >
                  <FaTrash className="mr-2 text-xs sm:text-sm" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Image/Preview */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4">
        <div
          className="w-full h-[170px] mb-2 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gray-100"
          style={{
            backgroundColor: '#f5f6fa',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {thumbnail && (thumbnail !== null || thumbnail !== undefined) ? (
            <img 
              src={`data:image/png;base64,${thumbnail}`} 
              className="object-contain h-full w-full transition-transform duration-300 hover:scale-105" 
              alt="Document thumbnail"
            />
          ) : (
            <img 
              src={thumbnailImg} 
              className="object-contain h-full w-full transition-transform duration-300 hover:scale-105" 
              alt="Default thumbnail"
            />
          )}
        </div>
      </div>

      {/* Card Bottom Section */}
      <div className="flex-1 flex flex-col justify-between px-3 sm:px-4 pb-3 sm:pb-4 pt-2 bg-white rounded-b-2xl">
        <div className="text-sm sm:text-base font-semibold truncate text-gray-800 mb-1 leading-tight">
          {docObj.fileName}
        </div>
        
        {/* Debug section for templates - only show on larger screens */}
        {docObj.type === 'template' && (
          <pre className="hidden lg:block text-xs bg-gray-50 rounded p-2 mt-2 overflow-x-auto max-h-20 xl:max-h-32 border border-gray-100">
            {JSON.stringify(docObj, null, 2)}
          </pre>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-4">
          {docObj.type === 'template' && (
            <>
              <button
                className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex-1 sm:flex-none"
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
                Create Doc
              </button>
              <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex-1 sm:flex-none" 
                      onClick={() => alert('Edit Template')}>
                Edit
              </button>
              <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex-1 sm:flex-none" 
                      onClick={() => alert('Delete Template')}>
                Delete
              </button>
            </>
          )}
          {docObj.type === 'project' && (
            <>
              <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex-1 sm:flex-none" 
                      onClick={() => alert('Edit Project')}>
                Edit
              </button>
              <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex-1 sm:flex-none" 
                      onClick={() => alert('Delete Project')}>
                Delete
              </button>
            </>
          )}
          {docObj.type === 'document' && (
            <>
              <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex-1 sm:flex-none" 
                      onClick={() => alert('View Document')}>
                View
              </button>
              <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 flex-1 sm:flex-none" 
                      onClick={() => alert('Download Document')}>
                Download
              </button>
              <button className="btn-option text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex-1 sm:flex-none" 
                      onClick={() => alert('Delete Document')}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <NeoModal isOpen={deleteTemplateModal} onClose={() => setDeleteTemplateModal(false)} handleDelete={() => handleDelete(documentId)}>
        <div className="p-4 sm:p-6 bg-white max-w-sm mx-auto">
          <h5 className="text-lg font-semibold text-center mb-4">Are you sure?</h5>
          <p className="text-center mb-6">You want to delete the {!template ? 'template' : 'document'}?</p>
          <div className="flex justify-center space-x-4">
            <button
              className="inline-flex justify-center px-4 sm:px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              onClick={() => setDeleteTemplateModal(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex justify-center px-4 sm:px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              onClick={() => confirmDelete()}
            >
              Yes
            </button>
          </div>
        </div>
      </NeoModal>
    </div>
  );
};

const TemplateCards = ({ documents, handleDeleteTemplate, handleDownload, template = false, projectId, cardHeight, cardWidth = "max-w-[380px]" }) => {
  console.log("TemplateCards documents:", documents);
  
  return (
    <div className="w-full px-2 sm:px-4 lg:px-6">
      <div
        id="template-card-container"
        className="grid grid-cols-1 
                   xs:grid-cols-2 
                   sm:grid-cols-2 
                   md:grid-cols-3 
                   lg:grid-cols-4 
                   xl:grid-cols-5 
                   2xl:grid-cols-6 
                   gap-3 sm:gap-4 md:gap-5 lg:gap-6 
                   auto-rows-fr place-items-center"
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
            cardHeight={cardHeight}
            cardWidth={cardWidth}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateCards;