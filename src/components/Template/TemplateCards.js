import React, { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { FaFileAlt, FaEdit, FaDownload, FaTrash, FaEllipsisV } from 'react-icons/fa';

import thumbnailImg from '../../Assets/thumbnail.png'

import NeoModal from '../NeoModal';



const Card = ({ docObj, documentId, name, thumbnail,content, handleDelete, handleDownload, template, projectId }) => {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const [deleteTemplateModal,setDeleteTemplateModal] = useState(false);



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



  const handleCreateDocuments = (docId) => {

    navigate(`/export/${docId}?projectId=${projectId}`);

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

    <div className="border p-4 rounded-lg shadow-md flex flex-col justify-between w-full sm:w-48 relative">

        <div className="flex justify-end ">

        <div ref={menuRef} className="absolute z-10">

          <button

            className="flex items-center px-2 py-2  mt-1 text-gray-600 rounded hover:bg-gray-300 hover:text-white" style={{fontSize:'14px'}}

            onClick={toggleMenu}

          >

            <FaEllipsisV />

          </button>

          {menuOpen && (

            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10" style={{fontSize:'14px'}} >

              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">

                {!template && (

                  <button

                    className="flex items-center w-full px-4 py-2 text-gray-500 "

                    onClick={() => handleCreateDocuments(documentId)}

                  >

                    <FaFileAlt className="mr-2" /> Create Document

                  </button>

                )}

                {template && (

                  <button

                    className="flex items-center w-full px-4 py-2 text-gray-500 "

                    onClick={() => handleView(documentId)}

                  >

                    <FaFileAlt className="mr-2" /> View

                  </button>

                )}

                {!template && (

                  <button

                    className="flex items-center w-full px-4 py-2 text-gray-500 "

                    onClick={() => handleEdit(documentId)}

                  >

                    <FaEdit className="mr-2" /> Edit

                  </button>

                )}

                {template && (

                  <button

                    className="flex items-center w-full px-4 py-2 text-gray-500 "

                    onClick={() => handleDocumentDocument(docObj)}

                  >

                    <FaDownload className="mr-2" /> Download

                  </button>

                )}

                <button

                  className="flex items-center w-full px-4 py-2 text-gray-500 "

                  onClick={() => promptForDeletion(documentId)}

                >

                  <FaTrash className="mr-2" /> Delete

                </button>

              </div>

            </div>

          )}

        </div>



      </div>

      <div className="flex-1" id="template-card">

         <div

         

          style={{

            height: '150px',

            zoom: '0.6',

            border: '1px solid #ccc',

            padding: '5px',

            backgroundColor: 'white',

            borderRadius: '50px',

            overflow: 'hidden',

          }}>

         {/*  dangerouslySetInnerHTML={{ __html: content }} */}

          { thumbnail && (thumbnail!==null ||  thumbnail!=undefined) ? <img  src={`data:image/png;base64,${thumbnail}`}/> : <img src={thumbnailImg}/>}

        </div>

       

       

            <NeoModal isOpen={deleteTemplateModal} onClose={()=>setDeleteTemplateModal(false)} handleDelete={()=>handleDelete(documentId)}>

      {

       <div className="p-6 bg-white rounded-lg shadow-lg max-w-sm mx-auto">

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

    

      <div className="flex-1 mt-4">

        <div className="text-sm font-semibold mb-2 truncate text-center">{name}</div>

      </div>

    </div>

  );

};



const TemplateCards = ({ documents, handleDeleteTemplate, handleDownload, template = false, projectId}) => {

  return (

    <div id="cardContainer" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

      {documents.map((doc) => (

        <Card

          docObj={doc}

          key={doc._id}

          documentId={doc._id}

          name={doc.fileName}

          thumbnail = {doc.thumbnail}

          handleDelete={handleDeleteTemplate}

          handleDownload={handleDownload}

          template={template}

          projectId = {projectId}

        />

      ))}



      

    </div>



  );

};



export default TemplateCards;