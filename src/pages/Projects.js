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

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [projects, setProjects] = useState([]);
  const [project, setProject] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const { projects } = useContext(ProjectContext);

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
    //setProject(updatedProject);
    setIsModalOpen(false);
    //setProjects(projects);
    // fetchProjects();
  };

  const handleEdit = (project) => {
    console.log(project);
    setProject(project);
    setIsModalOpen(true);
    //fetchProjects();
  };

  const handleCancel = () => {
    setProject("");
    setIsModalOpen(false);
  };

  return (
    <div className="App">
      {/* <div className="flex text-gray-400 text-xs p-3 ml-4"> Projects</div> */}
     
    
      <div className="w-full p-2 f ">
        <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-4 text-center ml-8 ">Projects</h2>
        <button
          className="bg-indigo-500 hover:bg-blue-700 text-white font-normal py-2 px-4 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <MdAssignmentAdd className="inline" /> Add Project
        </button>
        </div>

        <div className="flex justify-between items-center mb-4 ml-8 mt-4">
          {loading && <div>Loading...</div>}
          <ProjectCards projects={projects} onEdit={handleEdit} />
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
