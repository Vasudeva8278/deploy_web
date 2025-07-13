
import React, { useState, useEffect, useContext } from 'react';
import { FileText, Trash2, Plus, Folder, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProjectContext } from '../context/ProjectContext';

interface TemplatesSidebarProps {
  // Remove isVisible prop since it's now permanent
}

interface DocumentData {
  _id: string;
  name: string;
  templateName?: string;
  createdAt?: string;
  projectId: string;
  projectName: string;
}

interface ProjectDocuments {
  projectId: string;
  projectName: string;
  documents: DocumentData[];
  expanded: boolean;
}

const TemplatesSidebar: React.FC<TemplatesSidebarProps> = () => {
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocuments[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projects } = useContext(ProjectContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllProjectDocuments = async () => {
      if (!projects || projects.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || "http://13.200.200.137:7000";
        
        const projectDocsPromises = projects.map(async (project: any) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/projectDocs/${project._id}/documents/documents-with-template-names`
            );
            
            const documents = (response.data || []).map((doc: any) => ({
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
        
        // Store all projects (including those without documents)
        setAllProjects(results);
        
        // Store projects with documents for the document count display
        const projectsWithDocs = results.filter(project => project.documents.length > 0);
        setProjectDocuments(projectsWithDocs);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching project documents:', err);
        setError('Failed to load documents');
        setAllProjects([]);
        setProjectDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch documents when projects are available - no isVisible check
    if (projects) {
      fetchAllProjectDocuments();
    }
  }, [projects]); // Removed isVisible dependency

  const toggleProject = (projectId: string, event: React.MouseEvent) => {
    // Stop propagation to prevent project navigation when clicking the expand arrow
    event.stopPropagation();
    setAllProjects(prev => 
      prev.map(project => 
        project.projectId === projectId 
          ? { ...project, expanded: !project.expanded }
          : project
      )
    );
  };

  const handleProjectClick = (projectId: string, projectData: any) => {
    // Navigate to the project page with project data in state
    navigate(`/projects/${projectId}`, { 
      state: { 
        data: {
          _id: projectId,
          projectName: projectData.projectName
        }
      }
    });
  };

  const handleDocumentClick = (documentId: string) => {
    // Navigate to document view page
    navigate(`/document/${documentId}`);
  };

  const handleCreateProject = () => {
    // Navigate to create project page
    navigate('/projects');
  };

  // Calculate total documents across all projects
  const totalDocuments = projectDocuments.reduce((sum, project) => sum + project.documents.length, 0);

  return (
    <div className="fixed top-0 left-20 z-20 h-screen bg-white border-r border-gray-200 w-40 flex flex-col overflow-hidden">
        {/* Header */}
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center mr-1">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <h1 className="text-xs font-bold text-gray-800">NEO</h1>
        </div>
        </div>

        {/* Action Buttons */}
      <div className="p-2 space-y-1 border-b border-gray-200 flex-shrink-0">
        
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-2 rounded text-xs transition-colors duration-200 flex items-center justify-center font-medium">
       
          Upgrade
          </button>
        </div>

      {/* Projects and Documents - Main content area that can grow */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col">
        <h3 className="text-xs font-semibold text-gray-800 mb-2 flex-shrink-0">
          All Projects ({allProjects.length}) • {totalDocuments} docs
        </h3>
        <div className="flex flex-col space-y-1 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-xs text-red-500 text-center py-2">{error}</div>
          ) : allProjects.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-2">No projects found</div>
          ) : (
            allProjects.map((project) => (
              <div key={project.projectId} className="flex-shrink-0">
                {/* Project Header */}
                <div
                  className="flex items-center px-1 py-1.5 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200"
                  onClick={() => handleProjectClick(project.projectId, project)}
                  title={`Open ${project.projectName} project`}
                >
                  {project.expanded ? 
                    <FolderOpen className="w-3 h-3 mr-1 text-blue-600 flex-shrink-0" /> :
                    <Folder className="w-3 h-3 mr-1 text-blue-600 flex-shrink-0" />
                  }
                  <span className="text-xs font-medium text-gray-800 flex-1 truncate">
                    {project.projectName}
                  </span>
                  {project.documents.length > 0 && (
                    <span className="text-xs text-gray-500 ml-1">({project.documents.length})</span>
                  )}
                 
                </div>
                
                {/* Project Documents */}
                {project.expanded && project.documents.length > 0 && (
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
                {project.expanded && project.documents.length === 0 && (
                  <div className="ml-3 text-xs text-gray-400 italic px-1 py-1">
                    No documents yet
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        </div>

        {/* Footer */}
      <div className="border-t border-gray-200 p-2 flex-shrink-0">
        <div className="flex items-center px-1 py-1.5 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
          <Trash2 className="w-3 h-3 mr-1 text-gray-600 flex-shrink-0" />
          <span className="text-xs text-gray-700 flex-1">Trash</span>
        </div>
      </div>
    </div>
  );
};

export default TemplatesSidebar;
