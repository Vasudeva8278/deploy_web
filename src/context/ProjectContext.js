// src/context/ProjectContext.js
import React, { createContext, useState, useEffect } from "react";
import {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
} from "../services/projectApi";

// Create the context
export const ProjectContext = createContext();

// Create a provider component
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects();
        setProjects(response.projects || []);
      } catch (error) {
        console.log("Failed to fetch projects", error);
      }
    };
    fetchProjects();
  }, []);

  const addProject = async (newProject) => {
    try {
      const createdProject = await createProject(newProject);
      setProjects((prevProjects) => [createdProject, ...prevProjects]);
      // setProjects(newProjectsList);
      //  console.log(newProject);
    } catch (error) {
      console.log("Failed to add project", error);
    }
  };

  const editProject = async (id, updatedProject) => {
    try {
      const updatedProj = await updateProject(id, updatedProject);
      console.log(updatedProj);
      const updatedProjects = projects.map((project) =>
        project._id === updatedProj._id ? updatedProj : project
      );
      setProjects(updatedProjects);
    } catch (error) {
      console.log("Failed to update project", error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects(
        (prevProjects) =>
          prevProjects.filter((project) => project._id !== projectId) // Use _id instead of id
      );
    } catch (error) {
      console.log("Failed to delete project", error);
    }
  };
  return (
    <ProjectContext.Provider
      value={{ projects, addProject, editProject, deleteProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
