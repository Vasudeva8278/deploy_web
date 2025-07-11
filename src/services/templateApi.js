import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createTemplate = async (selectedProject, formData) => {
  try {
    const response = await api.post(`/project/${selectedProject}/templates/converted`, formData);
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.log("Error while creating template", error);
    throw error;
  }
};

export const updateTemplate = async (projectId, formData) => {
  try {
    const response = await api.put(`/projects/${projectId}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error while updating template', error);
    throw error;
  }
};

export const deleteTemplate = async (projectId, templateId) => {
  try {
    const response = await api.delete(`/project/${projectId}/templates/${templateId}`);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Failed to delete template', error);
    throw error;
  }
};

export const getAllTemplates = async () => {
  try {
    const response = await api.get('/templates/homePageTemplates');
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.log("Error while fetching all templates", error);
    throw error;
  }
};

export const getTemplatesById = async (projectId, id) => {
  try {
    const response = await api.get(`/project/${projectId}/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error while fetching template by ID', error);
    throw error;
  }
};

export const getHomePageTemplates = async (projectId) => {
  try {
    const response = await api.get(`/project/${projectId}/templates/homePageTemplates`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.log("Error while fetching homepage templates", error);
    throw error;
  }
};


export const getTemplatesByProjectId = async (projectId) => {
  try {
    const response = await api.get(`/project/${projectId}/templates/templatesList`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.log("Error while fetching homepage templates", error);
    throw error;
  }
};


// Converted getTemplates to use axios instead of fetch
export const getTemplates = async () => {
  try {
    const response = await api.get('/templates');
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.log("Error while fetching templates", error);
    throw error;
  }
};

export const deleteTemplateById = async (templateId) => {
  try {
    const response = await api.delete(`/templates/${templateId}`);
    return response;
  } catch (error) {
    console.error('Error while deleting template by ID', error);
    throw error;
  }
};

export const createNeoTemplate = async (formData) => {
  try {
    const response = await api.post(`/templates/converted`, formData);
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.log("Error while creating NeoTemplate", error);
    throw error;
  }
};
