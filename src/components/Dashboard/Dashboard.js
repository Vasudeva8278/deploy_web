import React, { useEffect, useState } from 'react';
import { getAllProjects } from '../../services/projectApi';
import SearchHeader from '../SearchHeader';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import * as docx from 'docx-preview';
import { getDocumentsWithTemplateNames, deleteDocument1, downloadDocument1 } from '../../services/documentApi';
import { getAllTemplates, deleteTemplateById, createNeoTemplate } from '../../services/templateApi';
import TemplateCards from '../Template/TemplateCards';
import Buttonspage from '../Buttons';
import ProjectCards from '../Project/ProjectCards';
const Dashboard = () => {
  const [projects, setProjects] = useState([]);
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectsData = await getAllProjects();
        const formatted = projectsData.map(p => ({
          ...p,
          fileName: p.name || p.fileName,
          thumbnail: p.thumbnail || '',
          type: 'project',
        }));
        setProjects(formatted);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
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
  const [activeTab, setActiveTab] = useState('projects');

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
    <div>
      <SearchHeader />
      
    <div className='md:flex justify-between'>
      
    <div className="rounded-lg p-0 w-full max-w-4xl 2xl:max-w-6xl mx-auto mt-8 flex justify-start items-start">
  <div className="flex justify-center border-b ">
    {['Projects', 'Templates', 'Documents'].map(tab => (
      <button
        key={tab}
        className={`px-8 py-3 font-semibold text-base focus:outline-none transition 
          ${activeTab === tab.toLowerCase()
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'border-b-2 border-transparent text-gray-600 hover:text-blue-600'}
        `}
        onClick={() => setActiveTab(tab.toLowerCase())}
      >
        {tab}
      </button>
    ))}
  </div>
  {/* Tab content below */}
</div>
      <div >
        <Buttonspage />
      </div>
</div>
      {activeTab === 'projects' && (
        <div className='py-4 ml-0'>

          {loading && <div>Loading...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="w-full ml-2 overflow-auto ">
            <ProjectCards projects={projects} onEdit={() => {}} />
          </div>
        </div>
      )}
      {activeTab === 'templates' && (
        <div className='flex flex-col p-4 space-y-8'>
          <div className='w-full'>
           
            <div className='flex justify-center'>
              {loading && <div>Loading...</div>}
             
                <TemplateCards
                  documents={documents}
                  handleDeleteTemplate={handleDeleteTemplate}
                />

            </div>
          </div>
        </div>
      )}
      {activeTab === 'documents' && (
        <div className='flex flex-col p-4 space-y-8'>
          <div className='w-full max-w-8xl space-y-4'>
            
            <div className='mr-4'>
            <TemplateCards
                  documents={docTemplates}
                  template={true}
                  handleDeleteTemplate={handleDeleteDocument}
                  handleDownload={handleDocumentDownload}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                />

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

