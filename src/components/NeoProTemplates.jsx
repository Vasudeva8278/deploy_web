import React, { useState, useRef, useEffect } from "react";
import { LuCreditCard } from "react-icons/lu";
import { FaTable } from "react-icons/fa";
import { FileText, Sparkles } from 'lucide-react';
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

const NeoProTemplates = () => {
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
  const projectData = location.state?.data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id: currentProjectId } = useParams();

  useEffect(() => {
    if (projectData && projectData._id) {
      fetchTemplates();
      fetchDocuments();
    }
  }, [projectData]);

  const fetchDocuments = async () => {
    if (!projectData || !projectData._id) return;
    try {
      const response = await getHomePageDocuments(projectData._id);
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
    if (!projectData || !projectData._id) return;
    try {
      const response = await getHomePageTemplates(projectData._id);
      const data = response;
      console.log(data);
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
    location.pathname === `/projects/${projectId}`;

  const isDocumentActive = (docId) =>
    location.pathname === `/document/${docId}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Main Content Container with Consistent Vertical Alignment */}
        <div className="flex flex-col space-y-12">
          
          {/* Templates Section */}
          <section className="w-full">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-foreground ml-4">
           Templates of {projectData && projectData.projectName ? projectData.projectName : 'Unnamed Project'}
            </h2>
              {/* Action Button - Aligned to left edge */}
            <button
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md"
              onClick={handleGenerateDocs}
              disabled={documents?.length === 0}
            >
                <Sparkles className="w-4 h-4" />
                Generate Documents
            </button>
            </div>

              {/* Section Title - Aligned to left edge */}
             
              
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
             
              
              {/* Content Area - Full width, aligned to left edge */}
              <div className="w-full">
               
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NeoProTemplates;