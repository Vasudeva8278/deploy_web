import React, { useState, useRef, useEffect, useContext } from "react";
import { LuCreditCard } from "react-icons/lu";
import { FaTable } from "react-icons/fa";

import { MdKeyboardArrowDown, MdArrowDropDown } from "react-icons/md";
import { RiMenuFill, RiLayout4Line } from "react-icons/ri";
import { IoNotifications } from "react-icons/io5";
import { BsSearch } from "react-icons/bs";
import {
  FaUpload,
  FaFileAlt,
  FaRegFolderOpen,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { FileText, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
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
  getHomePageDocuments,
} from "../services/documentApi";
import SearchHeader from "./SearchHeader";
import DesignTemplate from './DesignTemplate';
import GenerateDocument from './GenerateDocument';
import NeoModal from './NeoModal';
import { AuthContext } from "../context/AuthContext";
import DocumentSideBar from './DocumentSideBar';
import { getAllProjects } from "../services/projectApi";

const NeoDocements = () => {
  const { user } = useContext(AuthContext);
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
  
  // Modal states for design template functionality
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayPage, setDisplayPage] = useState("");
  const [selectedProject, setSelectedProject] = useState('');
  
  const EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";
  const EXPERT_ROLE_ID = "68621581db15fbb9bbd2f836";
  const isExecutive = user && user.role === EXECUTIVE_ROLE_ID;
  const isExpert = user && user.role === EXPERT_ROLE_ID;

  const openModal = (page) => {
    setDisplayPage(page);
    setIsModalOpen(true);
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

  const [viewMode, setViewMode] = useState('card'); // Add viewMode state
  const [selectedTemplateFileName, setSelectedTemplateFileName] = useState(null);
  const { id: selectedProjectId } = useParams();
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const filteredDocs = selectedTemplateFileName
    ? docTemplates.filter(doc =>
        Array.isArray(doc.templates) && doc.templates.includes(selectedTemplateFileName)
      )
    : docTemplates;

  useEffect(() => {
    setLoading(true);
    setSelectedTemplateFileName(null); // Reset template filter on project change
    if (!selectedProjectId) {
      getDocumentsWithTemplateNames()
        .then((docs) => {
          setDocuments(docs);
          console.log("All docs:", docs);
        })
        .catch(() => setDocuments([]))
        .finally(() => setLoading(false));
    } else {
      getHomePageDocuments(selectedProjectId)
        .then((docs) => {
          setDocuments(docs);
          console.log("Project docs:", docs);
        })
        .catch(() => setDocuments([]))
        .finally(() => setLoading(false));
    }
  }, [selectedProjectId]);

  if (isExecutive || isExpert) {
    return (
      <div className='flex flex-row w-full'>
        <DocumentSideBar onTemplateSelect={setSelectedTemplateFileName} />
        <div className='flex flex-col w-full'>
          <div className='w-full max-w-8xl w-full p-2 '>
            <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
                Templates
              </span>
  <div>
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
                  onClick={() => openModal('generateDocs')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Documents
                </button>
          
            </div>
            <div className="w-full max-w-8xl mx-auto sm:px-6 lg:px-8 mr-2">
              <div className='rounded-xl p-6 mr-2'>
                <TemplateCards
                  documents={filteredDocs}
                  template={true}
                  handleDeleteTemplate={handleDeleteDocument}
                  handleDownload={handleDocumentDownload}
                  cardHeight="h-[420px]" cardWidth="max-w-[320px]"
                  viewMode={viewMode}
                />
              </div>
            </div>
          </div>
          <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <React.Suspense fallback={<div className="p-4">Loading...</div>}>
              {(() => {
                try {
                  if (displayPage === 'generateDocs') {
                    return <GenerateDocument onClose={() => setIsModalOpen(false)} projectId={selectedProjectId || null} templateId={selectedTemplateId || null} />;
                  }
                  if (displayPage === 'designTemplates') {
                    return <DesignTemplate onClose={() => setIsModalOpen(false)} value={selectedProject} hasProject={false} />;
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
      </div>
    );
  }
  return (
    <div className='flex flex-col w-full'>
      <div className='w-full max-w-8xl w-full p-2'>
        <div className="md:flex justify-between items-center">
          <span className="text-2xl font-bold ml-10">
            Documents
          </span>
        <div className="flex justify-between items-center gap-4">
          <div>
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
            onClick={() => openModal('generateDocs')}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <Sparkles className="w-5 h-5" />
            Generate Documents
          </button>
          </div>
        </div>
        {/* Card/Grid Tabs for non-executive/expert users */}
       
        <div className="w-full max-w-8xl h-35 mx-auto sm:px-6 lg:px-8 py-6 ">
          <div className='rounded-xl mb-8 h-30 2xl:mr-18 max-w-full'>
            <TemplateCards
              documents={docTemplates}
              template={true}
              handleDeleteTemplate={handleDeleteDocument}
              handleDownload={handleDocumentDownload}
              cardHeight="h-[420px]" cardWidth="max-w-[320px]"
              viewMode={viewMode}
            />
          </div>
          
        </div>
      </div>
      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <React.Suspense fallback={<div className="p-4">Loading...</div>}>
          {(() => {
            try {
              if (displayPage === 'designTemplates') {
                return <DesignTemplate onClose={() => setIsModalOpen(false)} value={selectedProject} hasProject={false} />;
              }
              if (displayPage === 'generateDocs') {
                return <GenerateDocument onClose={() => setIsModalOpen(false)} value={selectedProject} hasProject={false} />;
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

export default NeoDocements;

