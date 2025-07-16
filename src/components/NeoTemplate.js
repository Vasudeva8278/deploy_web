import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdArrowDropDown } from "react-icons/md";
import { RiMenuFill, RiLayout4Line } from "react-icons/ri";
import { IoNotifications } from "react-icons/io5";
import { BsSearch } from "react-icons/bs";
import { LuCreditCard } from "react-icons/lu";
import { FaTable } from "react-icons/fa";

import {
  FaUpload,
  FaFileAlt,
  FaRegFolderOpen,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import CanvasThumbnails from "./CanvasThumbnails";
import photo from "../Assets/photo.png";
import * as docx from "docx-preview";
import TemplateCards from "./Template/TemplateCards";
import axios from "axios";
import {
  createNeoTemplate,
  deleteTemplateById,
  getAllTemplates,
} from "../services/templateApi";
import {
  deleteDocument1,
  downloadDocument1,
  getDocumentsWithTemplateNames,
} from "../services/documentApi";
import SearchHeader from "./SearchHeader";
import NeoModal from "./NeoModal";
import DesignTemplate from "./DesignTemplate";
import { Sparkles } from 'lucide-react';

const NeoTemplates= () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [docTemplates, setDocTemplates] = useState([]);
  const contentRef = useRef(null);
  const [conversionStatus, setConversionStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayPage, setDisplayPage] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [tab, setTab] = useState('templates'); // NEW: tab state
  const [viewMode, setViewMode] = useState('card'); // NEW: view mode state

  const openModal = (page, template = null) => {
    setDisplayPage(page);
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDisplayPage("");
    setEditingTemplate(null);
  };

  const handleTemplateCreated = () => {
    setIsModalOpen(false);
    setDisplayPage("");
    setEditingTemplate(null);
    // Optionally refresh templates here if needed
  };

  const handleSelectDocument = (docId) => {
    navigate(`/document/${docId}`);
  };

  const handleExport = (docId) => {
    navigate(`/export/${docId}`);
  };

  const handleProjects = () => {
    navigate(`/projects`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      onGetFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onGetFile(file);
    }
  };

  const onGetFile = async (file) => {
    setFile(file);
    setUploading(true);

    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear previous content

    const options = {
      // className: "docx", //class name/prefix for default and document style classes
      inWrapper: true, //enables rendering of wrapper around document content
      ignoreWidth: false, //disables rendering width of page
      ignoreHeight: false, //disables rendering height of page
      ignoreFonts: false, //disables fonts rendering
      breakPages: true, //enables page breaking on page breaks
      ignoreLastRenderedPageBreak: true, //disables page breaking on lastRenderedPageBreak elements
      // experimental:  false, //enables experimental features (tab stops calculation)
      //trimXmlDeclaration:  true, //if true, xml declaration will be removed from xml documents before parsing
      // useBase64URL: true, //if true, images, fonts, etc. will be converted to base 64 URL, otherwise URL.createObjectURL is used
      // renderChanges: false, //enables experimental rendering of document changes (inserions/deletions)
      renderHeaders: true, //enables headers rendering
      renderFooters: true, //enables footers rendering
      renderFootnotes: true, //enables footnotes rendering
      renderEndnotes: true, //enables endnotes rendering
      // renderComments: true, //enables experimental comments rendering
      // debug: false, //enables additional logging
    };

    try {
      await docx.renderAsync(file, container, null, options);
      console.log("docx: finished");
      console.log(container.innerHTML);

      // Convert all image elements to Base64
      const images = container.querySelectorAll("img");
      if (images.length > 0) {
        for (let img of images) {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const reader = new FileReader();

          reader.onloadend = () => {
            // Convert the image to a JPEG data URL
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const image = new Image();

            image.onload = () => {
              canvas.width = image.width;
              canvas.height = image.height;
              ctx.drawImage(image, 0, 0);
              img.src = canvas.toDataURL("image/png");

              // Call convertFiled after all images are converted
              if (
                [...images].every((image) =>
                  image.src.startsWith("data:image/png")
                )
              ) {
                convertFiled(container.innerHTML, file);
              }
            };

            image.src = reader.result;
          };

          reader.readAsDataURL(blob);
        }
      } else {
        convertFiled(container.innerHTML, file);
      }

      // Ensure the container height matches the document height for pagination
      const pages = container.querySelectorAll(".docx-page");
      if (pages.length > 0) {
        const totalHeight = Array.from(pages).reduce(
          (height, page) => height + page.scrollHeight,
          0
        );
        container.style.height = `${totalHeight}px`;
      }
    } catch (error) {
      console.error("docx rendering error:", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await getDocumentsWithTemplateNames();
      const data = response;
      setDocTemplates(data);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates();
      const data = response;
      setDocuments(data);
      const sortedData = data.sort((a, b) => {
        if (!a.updatedTime) return 1;
        if (!b.updatedTime) return -1;
        return new Date(b.updatedTime) - new Date(a.updatedTime);
      });
      setRecentDocuments(sortedData);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteTemplate = async (docId) => {
    console.log(`Deleting `, docId);
    try {
      const response = await deleteTemplateById(docId);
      if (response) {
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc._id !== docId)
        );
        alert("Document deleted successfully");
      } else {
        throw new Error(`Failed to delete document.`);
      }
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };
  const handleDeleteDocument = async (doc_id) => {
    console.log("deleteing document", doc_id);
    const response = await deleteDocument1(doc_id);
    if (response) {
      fetchTemplates();
      fetchDocuments();
    }
  };
  const convertFiled = async (content, file) => {
    setConversionStatus("Converting...");
    const formData = new FormData();
    formData.append("docxFile", file);
    formData.append("content", content);

    try {
      const response = await createNeoTemplate(formData);
      if (response) {
        setUploading(false);
        const result = response; // await response.json();
        handleSelectDocument(result._id);

        setConversionStatus(
          `Conversion successful! Content: ${result.content}`
        );
      } else {
        setConversionStatus("Conversion failed. Please try again.");
      }
    } catch (error) {
      setConversionStatus("An error occurred during conversion.");
    }
  };

  const handleDocumentDownload = async (docObj) => {
    try {
      const id = docObj._id;
      const fileName = docObj.fileName;
      const response = await downloadDocument1(id);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName.trim() + ".docx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  return (
    <div className='flex w-[100%]'>
      <div className='hidden flex flex-col items-start border-r border-gray-200'>
        <div className='flex items-center w-64 h-20 border-b border-gray-300'>
          <img
            src={photo}
            alt='Profile'
            className='w-12 h-12 rounded-full ml-2'
          />
          <div className='flex flex-col ml-4'>
            <div className='text-sm font-semibold'>Kevin Rangel</div>
            <div className='text-xs'>Admin</div>
          </div>
          <MdArrowDropDown className='w-6 h-6 ml-4' />
        </div>
        <div className='mt-4 w-64 px-3'>
          <div className='flex items-center w-full pl-3 hover:bg-blue-100 rounded-lg'>
            <GoHome className='w-5 h-5' />
            <div className='ml-2 text-sm font-semibold py-2'>Home</div>
          </div>
          <div className='flex items-center w-full pl-3 mt-2 hover:bg-blue-100 rounded-lg'>
            <FaRegFolderOpen className='w-5 h-5' />
            <div
              className='ml-2 text-sm text-gray-700 py-2'
              onClick={handleProjects}
            >
              Projects
            </div>
          </div>
          
        </div>
      </div>

      <div className='flex-1 flex flex-col m-2'>
      
        <div className='flex flex-col p-4 space-y-8'>
          <div className='w-full max-w-screen-2xl mx-auto'>
            <div className="md:flex justify-between items-center w-max-8xl">
              <h1>Templates</h1>
                {/* Card/Grid View Tabs (parent controlled) */}
                <div className="flex space-x-2 mb-4 ml-4">
                <button
                  className={`px-4 py-1 rounded font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setViewMode('card')}
                >
                  <LuCreditCard className="inline-block w-5 h-5" />
                </button>
                <button
                  className={`px-4 py-1 rounded font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FaTable className="inline-block w-5 h-5" />
                </button>
              </div>
           
                <button
                  onClick={() => openModal('designTemplates')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-md text-sm"
                >
                  <FaFileAlt className="w-5 h-5" />
                  Design Template
                </button>
          
            </div>
            <br />
            <div className='flex'>
              {loading && <div>Loading...</div>}
              {tab === 'templates' && (
                <TemplateCards
                  documents={documents}
                  handleDeleteTemplate={handleDeleteTemplate}
                  handleDownload={handleDocumentDownload}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              )}
              {tab === 'documents' && (
                <TemplateCards
                  documents={docTemplates}
                  handleDeleteTemplate={handleDeleteDocument}
                  handleDownload={handleDocumentDownload}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              )}
            </div>
          </div>
          {/* 
  <div className="w-full max-w-4xl">
    <h2 className="text-2xl font-semibold mb-4 text-left">Recent Docs</h2>
    <div className="flex justify-center space-x-6">
    {loading && <div>Loading...</div>}
      <TemplateCards documents={recentDocuments} handleDeleteTemplate={handleDeleteTemplate} />
    </div>
  </div> */}

          
        </div>
      </div>
      {/* Add the Design Template Modal here */}
      <NeoModal isOpen={isModalOpen} onClose={closeModal}>
        <React.Suspense fallback={<div className="p-4">Loading...</div>}>
          {(() => {
            try {
              if (displayPage === 'designTemplates') {
                return (
                  <DesignTemplate
                    onClose={closeModal}
                    value={null}
                    hasProject={false}
                    editingTemplate={editingTemplate}
                    onTemplateCreated={handleTemplateCreated}
                  />
                );
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

export default NeoTemplates;
