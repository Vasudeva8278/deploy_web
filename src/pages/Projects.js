import React, { useState, useEffect, useContext } from "react";
import NeoProject from "./NeoProject"; // Import your NeoProject component
import NeoModal from "../components/NeoModal"; // Import the Modal component
import ProjectCards from "../components/Project/ProjectCards";
//import { getAllProjects } from "../services/projectApi";
import SearchBar from "../components/SearchBar";
import SearchHeader from "../components/SearchHeader";
import { MdAssignmentAdd } from "react-icons/md";
import { ProjectContext } from "../context/ProjectContext";
//import { getAllProjects } from "../context/ProjectContext";
import folderIcon from '../Assets/folder.png'; // Use your folder icon
import { deleteProject } from '../services/projectApi';
/// vasudev
const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [projects, setProjects] = useState([]);
  const [project, setProject] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const { projects } = useContext(ProjectContext);
  const [isAddMode, setIsAddMode] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  /*useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getAllProjects();
      const data = response;
      console.log(data);
      setProjects(data);
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };*/
  const handleSave = (updatedProject) => {
    // Only check for duplicate name and capitalize on add (not edit)
    if (isAddMode) {
      if (updatedProject && updatedProject.projectName) {
        // Capitalize first letter
        updatedProject.projectName = updatedProject.projectName.charAt(0).toUpperCase() + updatedProject.projectName.slice(1);
      }
      // Check for unique project name (case-insensitive)
      const nameExists = projects && projects.some(
        (proj) =>
          proj.projectName &&
          proj.projectName.trim().toLowerCase() === updatedProject.projectName.trim().toLowerCase()
      );
      if (nameExists) {
        setError('A project with the same name already exists.');
        return;
      }
    }
    setError("");
    setIsModalOpen(false);
    //setProjects(projects);
    // fetchProjects();
  };

  const handleEdit = (project) => {
    console.log(project);
    setProject(project);
    setIsAddMode(false);
    setIsModalOpen(true);
    //fetchProjects();
  };

  const handleCancel = () => {
    setProject("");
    setIsModalOpen(false);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to delete the project "${project.projectName}"?`)) return;
    setDeletingProjectId(project._id);
    setDeleteError("");
    try {
      await deleteProject(project._id);
      // Optionally, update the context or refetch projects here
      // For now, just filter out the deleted project if using local state
      // setProjects(projects.filter(p => p._id !== project._id));
    } catch (err) {
      setDeleteError("Failed to delete project. Please try again.");
    } finally {
      setDeletingProjectId(null);
    }
  };

  return (
    <div className="App">
      
    
      <div className="w-full p-2 ">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-center md:ml-12 sm:ml-[-1rem]">Projects</h2>
        <button
          className="bg-indigo-500 hover:bg-blue-700 text-white font-normal py-2 px-4 rounded-lg"
          onClick={() => {
            setError(""); // Clear error on open
            setIsAddMode(true);
            setProject({});
            setIsModalOpen(true);
          }}
        >
          <MdAssignmentAdd className="inline" /> Add Project
        </button>
        </div>

        {/* Show error if duplicate name */}
        {error && <div className="text-red-500 text-sm ml-6">{error}</div>}
        {/* Show error if delete fails */}
        {deleteError && <div className="text-red-500 text-sm ml-6 mb-2">{deleteError}</div>}

        <div className="flex justify-between items-center ml-4 sm:ml-q">
          {loading && <div>Loading...</div>}
          <ProjectCards projects={projects} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NeoProject
          mode={project._id ? "edit" : "add"}
          project={project}
          onSave={handleSave}
          handleClose={handleCancel}
        />
      </NeoModal>
    </div>
  );
};

export default Projects;
