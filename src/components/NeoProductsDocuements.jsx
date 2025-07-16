import React, { useState, useRef, useEffect } from "react";
import { LuCreditCard } from "react-icons/lu";
import { FaTable } from "react-icons/fa";

import {
  FaUpload,
  FaFileAlt,
  FaRegFolderOpen,
  FaDownload,
  FaTrash,
  FaMagic,
} from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CanvasThumbnails from "./CanvasThumbnails";

import * as docx from "docx-preview";
import TemplateCards from "./Template/TemplateCards";
import axios from "axios";
import {
  createTemplate,
  deleteTemplate,
  getHomePageTemplates,
} from "../services/templateApi";
import {
  deleteDocument,
  downloadDocument,
  getHomePageDocuments,
} from "../services/documentApi";
import SearchHeader from "./SearchHeader";
import ViewTemplatesHighlights from "./Template/ViewTemplatesHighlights";
import NeoModal from "./NeoModal";
import { getAllProjects } from "../services/projectApi";

const NeoProjectDocuments = () => {
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
  const location = useLocation();
  const { id: currentProjectId } = useParams();
  const [projectData, setProjectData] = useState(location.state?.data || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectDataLoading, setProjectDataLoading] = useState(!location.state?.data);

  useEffect(() => {
    // If projectData is not present, fetch it using the projectId from the route
    if (!projectData && currentProjectId) {
      setProjectDataLoading(true);
      getAllProjects()
        .then((projects) => {
          const found = (projects || []).find((p) => p._id === currentProjectId);
          setProjectData(found || null);
        })
        .catch(() => setProjectData(null))
        .finally(() => setProjectDataLoading(false));
    }
  }, [currentProjectId, projectData]);

  useEffect(() => {
    if (projectData && projectData._id) {
      fetchTemplates(projectData._id);
      fetchDocuments(projectData._id);
    }
  }, [projectData]);

  const fetchDocuments = async (projectId) => {
    if (!projectId) return;
    try {
      const response = await getHomePageDocuments(projectId);
      setDocTemplates(response);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async (projectId) => {
    if (!projectId) return;
    try {
      const response = await getHomePageTemplates(projectId);
      setDocuments(response);
      const sortedData = response.sort((a, b) => {
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
      const response = await deleteTemplate(projectData._id, docId);
      if (response.status === 204) {
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

  const handleGenerateDocs = () => {
    navigate(`/viewAllHighlights`, {
      state: {
        project: projectData,
      },
    });
  };

  const handleDeleteDocument = async (doc_id) => {
    console.log("deleteing document", doc_id);
    const response = await deleteDocument(projectData._id, doc_id);
    if (response) {
      fetchTemplates();
      fetchDocuments();
    }
  };

  const handleDocumentDownload = async (docObj) => {
    try {
      const id = docObj._id;
      const fileName = docObj.fileName;
      const response = await downloadDocument(id, fileName);

      const blob = new Blob([response], {
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

  const isProjectActive = (projectId) =>
    location.pathname === `/NeoDocuments/${projectId}`;

  const isDocumentActive = (docId) =>
    location.pathname === `/NeoDocuments/${docId}`;

  if (projectDataLoading) {
    return <div className="flex justify-center items-center h-full">Loading project...</div>;
  }
  if (!projectData) {
    return <div className="flex justify-center items-center h-full text-red-500">Project not found.</div>;
  }
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading documents...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Content Container with Consistent Vertical Alignment */}
        <div className="flex flex-col space-y-12">
          
          {/* Templates Section */}
          <section className="w-full">
            <div className="flex flex-col space-y-6">
              {/* Action Button - Aligned to left edge */}
              <button
                className="self-start bg-white text-green-600 font-medium py-3 px-6 rounded-lg shadow-md hover:bg-green-50 transition-colors duration-200 flex items-center gap-3 border border-green-200"
                onClick={handleGenerateDocs}
                disabled={documents?.length === 0}
              >
                <FaMagic className="w-4 h-4" />
                Generate Client Documents
              </button>

              {/* Section Title - Aligned to left edge */}
              <h2 className="text-3xl font-bold text-foreground">
                Templates for {projectData && projectData.projectName ? projectData.projectName : 'Unnamed Project'}
              </h2>
              
              {/* Content Area - Full width, aligned to left edge */}
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-muted-foreground">Loading templates...</div>
                  </div>
                ) : (
                  <TemplateCards
                    documents={documents}
                    handleDeleteTemplate={handleDeleteTemplate}
                    projectId={projectData?._id}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Documents Section */}
          <section className="w-full">
            <div className="flex flex-col space-y-6">
              {/* Section Title - Aligned to left edge */}
              <h2 className="text-3xl font-bold text-foreground">
                Documents with Template Names
              </h2>
              
              {/* Content Area - Full width, aligned to left edge */}
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-muted-foreground">Loading documents...</div>
                  </div>
                ) : (
                  <TemplateCards
                    projectId={projectData?._id}
                    documents={docTemplates}
                    template={true}
                    handleDeleteTemplate={handleDeleteDocument}
                    handleDownload={handleDocumentDownload}
                    className="border border-border p-4 rounded-lg shadow-sm bg-card"
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NeoProjectDocuments;