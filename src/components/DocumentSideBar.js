import React, { useState, useEffect, useContext } from 'react';
import { FileText, Trash2, Plus, Folder, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAllProjects } from '../services/projectApi';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useParams } from 'react-router-dom';
import { getAllTemplates } from "../services/templateApi";

const NEO_EXPERT_ROLE_ID = "68621581db15fbb9bbd2f836";
const NEO_EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";

const DocumentSideBar = () => {
  const [projectDocuments, setProjectDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: activeProjectId } = useParams();

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  // Function to check if a project is active based on current route
  const isProjectActive = (projectId) => selectedProjectId === projectId;

  // Helper to determine if a project or 'All' is active
  const isActiveProject = (projectId) => {
    if (projectId === 'all') {
      return location.pathname === '/NeoDocements';
    }
    return location.pathname === `/NeoDocements/${projectId}`;
  };

  const isNeoTemplatesActive = () => {
    const hash = location.hash || '';
    return hash.startsWith('#/projects');
  };

  // Function to get role display name
  const getRoleDisplayName = (roleId) => {
    switch (roleId) {
      case NEO_EXPERT_ROLE_ID:
        return "NEO Expert";
      case NEO_EXECUTIVE_ROLE_ID:
        return "NEO Executive";
      default:
        return "User";
    }
  };

  // Check if user has restricted access
  const isRestrictedUser = user?.role === NEO_EXPERT_ROLE_ID || user?.role === NEO_EXECUTIVE_ROLE_ID;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProjects();
        setProjects(data);
      } catch (err) {
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchAllProjectDocuments = async () => {
      // If user is restricted, don't fetch projects
      if (isRestrictedUser) {
        setLoading(false);
        return;
      }

      if (!projects || projects.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || "http://13.200.200.137:7000";
        const projectDocsPromises = projects.map(async (project) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/projectDocs/${project._id}/documents/documents-with-template-names`
            );
            const documents = (response.data || []).map((doc) => ({
              ...doc,
              projectId: project._id,
              projectName: project.projectName
            }));
            return {
              projectId: project._id,
              projectName: project.projectName,
              documents,
              expanded: false
            };
          } catch (err) {
            console.error(`Error fetching documents for project ${project.projectName}:`, err);
            return {
              projectId: project._id,
              projectName: project.projectName,
              documents: [],
              expanded: false
            };
          }
        });
        const results = await Promise.all(projectDocsPromises);
        setProjectDocuments(results);
        const projectsWithDocs = results.filter(project => project.documents.length > 0);
        setProjectDocuments(projectsWithDocs);
        setError(null);
      } catch (err) {
        console.error('Error fetching project documents:', err);
        setError('Failed to load documents');
        setProjectDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    if (projects && !isRestrictedUser) {
      fetchAllProjectDocuments();
    }
  }, [projects, isRestrictedUser]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getAllTemplates();
        setTemplates(res);
      } catch (err) {
        setTemplateError('Failed to fetch templates');
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const toggleProject = (projectId, event) => {
    event.stopPropagation();
    setProjectDocuments(prev =>
      prev.map(project =>
        project.projectId === projectId
          ? { ...project, expanded: !project.expanded }
          : project
      )
    );
  };

  const handleProjectClick = (projectId, projectData) => {
    navigate(`/NeoDocements/${projectId}`, {
      state: {
        data: {
          _id: projectId,
          projectName: projectData.projectName
        }
      }
    });
  };

  const handleDocumentClick = (documentId) => {
    navigate(`/NeoDocements/${documentId}`);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const totalDocuments = projectDocuments.reduce((sum, project) => sum + project.documents.length, 0);

  if (isRestrictedUser) {
    return (
      <div className={`fixed top-0 left-20 z-20 h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-40'
      }`}>
        {/* Header */}
        <div className="p-2 border-b border-gray-200 flex-shrink-0"></div>
        {/* Role and Authorization Message */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col">
          <div className="text-center py-4">
            <div className="mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-gray-600 font-bold text-sm">
                  {user?.role === NEO_EXPERT_ROLE_ID ? "E" : "X"}
                </span>
              </div>
            </div>
            {!isCollapsed && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    You are not authorized to view projects. Please contact your administrator for access.
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Role: {getRoleDisplayName(user?.role || "")}
                </div>
              </>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 p-2 flex-shrink-0">
          <div className="flex items-center px-1 py-1.5 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
            <Trash2 className="w-3 h-3 mr-1 text-gray-600 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs text-gray-700 flex-1">Trash</span>}
          </div>
        </div>
      </div>
    );
  }

  let filteredProjects = projectDocuments;
  if (filteredProjects.length === 0) return null;

  return (
    <div className={` flex-1 p-2 overflow-auto bg-gray-50 mt-16 border-2 border-gray-200 mr-2 ml-2 fixed top-0 left-20 z-20 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden rounded-3xl transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-40'
    }`}>
      {/* Toggle Button */}
     
      {/* Projects and Documents - Main content area that can grow */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-gray-800 mb-2 flex-shrink-0">
            Projects
          </h3>
        )}
        <hr />
        {/* Scrollable projects/documents list with fixed height */}
        <div className="flex flex-col space-y-1 flex-1 overflow-y-auto h-40 rounded-lg">
          {/* All Button */}
          <div
            className={`flex items-center px-1 py-1.5 rounded cursor-pointer transition-colors duration-200 mb-1 ${
              isActiveProject('all') ? "bg-blue-100 font-bold text-blue-700" : "hover:bg-gray-100 text-gray-800"
            }`}
            onClick={() => {
              setSelectedProjectId("all");
              navigate('/NeoDocements');
            }}
            title="Show all documents"
          >
            <span className="text-xs font-medium flex-1 truncate">All</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-xs text-red-500 text-center py-2">{isCollapsed ? '!' : error}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-2">{isCollapsed ? '?' : 'No projects found'}</div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.projectId} className="flex-shrink-0">
                {/* Project Header with Active State */}
                <div
                  className={`flex items-center px-1 py-1.5 rounded cursor-pointer transition-colors duration-200 ${
                    isActiveProject(project.projectId)
                      ? 'bg-blue-100 font-bold text-blue-700' 
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                  onClick={() => {
                    setSelectedProjectId(project.projectId);
                    handleProjectClick(project.projectId, project);
                  }}
                  title={`Open ${project.projectName} project`}
                >
                  {!isCollapsed && (
                    <>
                      <span className="text-xs font-medium flex-1 truncate">
                        {project.projectName}
                      </span>
                      {project.documents.length > 0 && (
                        <span className="text-xs text-gray-500 ml-1">({project.documents.length})</span>
                      )}
                    </>
                  )}
                </div>
                {/* Project Documents */}
                {!isCollapsed && project.expanded && project.documents.length > 0 && (
                  <div className="ml-3 space-y-1">
                    {project.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center px-1 py-1 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-200"
                        title={`Open ${doc.templateName || doc.name}`}
                        onClick={() => handleDocumentClick(doc._id)}
                      >
                        <FileText className="w-2.5 h-2.5 mr-1 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 flex-1 truncate">
                          {doc.templateName || doc.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Show "No documents" message for projects without documents when expanded */}
                {!isCollapsed && project.expanded && project.documents.length === 0 && (
                  <div className="ml-3 text-xs text-gray-400 italic px-1 py-1">
                    No documents yet
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <hr />
      </div>
      <hr />
    </div>
  );
};

export default DocumentSideBar;
