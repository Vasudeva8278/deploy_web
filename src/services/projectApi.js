import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createProject = async (formData) => {
  try {
    const response = await api.post(`/projects`, formData);
    return response.data;
  } catch (error) {
    console.error("Error while creating project", error);
    throw error;
  }
};

export const updateProject = async (projectId, formData) => {
  try {
    const response = await api.put(`/projects/${projectId}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error while updating project", error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error while deleting project", error);
    throw error;
  }
};

// Get all projects
export const getAllProjects = async () => {
  try {
    const response = await api.get("/projects");
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error("Error while fetching projects", error);
    throw error;
  }
};

// Get subprojects for a specific project
export const getSubprojects = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/subprojects`);
    return response.data;
  } catch (error) {
    console.error("Error while fetching subprojects", error);
    throw error;
  }
};

export const getTemplatesAndHighlightsWithinProject = async (projectId) => {
  try {
    const response = await api.get(`/projects/templateHighlights/${projectId}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error while fetching subprojects", error);
    throw error;
  }
};

export const getExistingLabelsInProject = async (projectId) => {
  try {
    console.log(projectId);
    const response = await api.get(`/projects/get-labels/${projectId}`);
    console.log("getExistingLabelsInProject:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error while fetching subprojects", error);
    throw error;
  }
};
