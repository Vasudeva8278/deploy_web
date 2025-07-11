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

const Card = ({ docObj, documentId, name, thumbnail,content, handleDelete, handleDownload, template, projectId }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [deleteTemplateModal,setDeleteTemplateModal] = useState(false);

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
    if(projectId) {
      goTo=`/document/${docId}?projectId=${projectId}`
    }else{
      goTo=`/document/${docId}`
    }
    navigate(goTo);
  };

  const promptForDeletion = (documentId) => {
    // if(!template) {
       setDeleteTemplateModal(true)
    // }else {
     // handleDelete(documentId);
    //}
  }

  const handleCreateDocuments = async (docId) => {
    // Always use docObj.projectId for templates
    console.log('Template data:', docObj);
    console.log('projectId used for Create Document:', docObj.projectId);
    if (!docObj.projectId || docObj.projectId === 'undefined') {
      toast.error('Project ID is missing!');
      return;
    }
    try {
      // Check if documents exist for this template
      const res = await api.get(`/projectDocs/${docObj.projectId}/template-documents/${docId}`);
      if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        toast.info('No documents found for this template.');
        return; // Do not navigate
      }
      // If successful and documents exist, proceed to create document
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

  const handleDocumentDocument=(docObj) =>{
    setMenuOpen(false);
    handleDownload(docObj)
  }

  const confirmDelete = () => {
    setDeleteTemplateModal(false);
    handleDelete(documentId)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>

      
      <div 
        className="bg-white border border-gray-200 rounded-2xl shadow flex flex-col justify-between w-full sm:w-64 h-[340px] p-0 relative transition hover:shadow-lg group"
        style={{
          backgroundImage: `url(${leafyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      <ToastContainer />
        <div className="flex justify-end p-2 ">
          <div ref={menuRef} className="relative z-10 -500 w-10 rounded-full">
            <button
              className="flex items-center px-2 py-2 text-gray-600 rounded-full hover:text-gray-800 w-15 bg-gray-200"
              style={{ fontSize: '18px' }}
              onClick={toggleMenu}
            >
              <FaEllipsisV />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 text-sm ">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {!template && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleCreateDocuments(documentId)}
                    >
                      <FaFileAlt className="mr-1" /> Create Document
                    </button>
                  )}
                  {template && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleView(documentId)}
                    >
                      <FaFileAlt className="mr-2" /> View
                    </button>
                  )}
                  {!template && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleEdit(documentId)}
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                  )}
                  {template && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDocumentDocument(docObj)}
                    >
                      <FaDownload className="mr-2" /> Download
                    </button>
                  )}
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => promptForDeletion(documentId)}
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
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
            className="mb-2"
          >
            {thumbnail && (thumbnail !== null || thumbnail !== undefined) ? (
              <img src={`data:image/png;base64,${thumbnail}`} className="object-contain h-full w-full" />
            ) : (
              <img src={thumbnailImg} className="object-contain h-full w-full" />
            )}
          </div>
          <NeoModal isOpen={deleteTemplateModal} onClose={()=>setDeleteTemplateModal(false)} handleDelete={()=>handleDelete(documentId)}>
        {
         <div className="p-6 bg-white  max-w-sm mx-auto">
         <h5 className="text-lg font-semibold text-center mb-4">Are you sure?</h5>
        
         <p className="text-center mb-6">You want to delete the {!template?'template':'document'}?</p>
         
         <div className="flex justify-center space-x-4">
           <button
             className="inline-flex justify-center px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
             onClick={() => setDeleteTemplateModal(false)}
           >
             Cancel
           </button>
           <button
             className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
             onClick={() => confirmDelete()}
           >
             Yes
           </button>
         </div>
       </div>
        }
      </NeoModal>
        </div>
        {/* Card Bottom (Title & Folder) */}
        <div className="flex-1 flex flex-col justify-between px-4 pb-4 pt-2 bg-white rounded-b-2xl">
          <div className="text-base font-semibold truncate text-gray-800 mb-1">{docObj.fileName}</div>
          {/* For template cards, print all data as JSON for debugging */}
          {docObj.type === 'template' && (
            <pre className="text-xs bg-gray-50 rounded p-2 mt-2 overflow-x-auto max-h-32 border border-gray-100">
              {JSON.stringify(docObj, null, 2)}
            </pre>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
    
            {docObj.type === 'template' && (
              <>
                <button
                  className="btn-option"
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
                <button className="btn-option" onClick={() => alert('Edit Template')}>Edit</button>
                <button className="btn-option" onClick={() => alert('Delete Template')}>Delete</button>
              </>
            )}
            {docObj.type === 'project' && (
              <>
                <button className="btn-option" onClick={() => alert('Edit Project')}>Edit</button>
                <button className="btn-option" onClick={() => alert('Delete Project')}>Delete</button>
              </>
            )}
            {docObj.type === 'document' && (
              <>
                <button className="btn-option" onClick={() => alert('View Document')}>View</button>
                <button className="btn-option" onClick={() => alert('Download Document')}>Download</button>
                <button className="btn-option" onClick={() => alert('Delete Document')}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const TemplateCards = ({ documents, handleDeleteTemplate, handleDownload, template = false, projectId}) => {
  console.log("TemplateCards documents:", documents);
  return (
    <div
      id="template-card-container"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-28 p-8 max-w-7xl mx-auto justify-items-center"
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
        />
      ))}
    </div>
  );
};

export default TemplateCards;