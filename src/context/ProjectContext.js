// src/context/ProjectContext.js
import React, { createContext, useState, useEffect, useRef } from "react";
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
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        
        const response = await getAllProjects(abortControllerRef.current.signal);
        // The API returns projects directly, not wrapped in a 'projects' property
        setProjects(response || []);
      } catch (error) {
        // Check if it's an abort error
        if (error.name === 'AbortError') {
          console.log('ProjectContext request was aborted');
          return;
        }
        
        console.log("Failed to fetch projects", error);
        setProjects([]); // Set empty array on error
      }
    };
    fetchProjects();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
