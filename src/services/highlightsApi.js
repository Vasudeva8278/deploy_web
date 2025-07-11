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

// Create Highlight
export const createHighlight = async (formData) => {
  try {
    const response = await api.post(`/projects`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while creating highlight", error);
    throw error;
  }
};

// Update Highlight
export const updateHighlight = async (projectId, formData) => {
  try {
    const response = await api.put(`/projects/${projectId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while updating highlight", error);
    throw error;
  }
};

// Save or Update Highlights
export const saveOrUpdateHighlights = async (templateId, updatedObj) => {
  try {
    const response = await api.put(
      `/templates/add-highlights/${templateId}`,
      updatedObj,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error while saving or updating highlights", error);
    throw error;
  }
};

// Save or Update Highlights
export const saveTemplateContent = async (templateId, updatedObj) => {
  try {
    const response = await api.put(
      `/templates/update-content/${templateId}`,
      updatedObj,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error while saving or updating template content", error);
    throw error;
  }
};

// Delete Highlight
export const deleteHighlight = async (templateId, highlightId, content) => {
  try {
    const response = await api.delete(
      `/templates/delete-highlight/${templateId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          highlightId,
          content,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete highlight", error);
    throw error;
  }
};

// Get All Highlights (Projects)
export const getAllHighlight = async () => {
  try {
    const response = await api.get("/projects");
    return response.data;
  } catch (error) {
    console.error("Error while fetching highlights", error);
    throw error;
  }
};

// Upload Image
export const uploadImg = async (highlightId, formData) => {
  try {
    const response = await api.post(
      `/image/uploadImage?highlightId=${highlightId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error while uploading image", error);
    throw error;
  }
};

// Upload Image for Document
export const uploadImgforDocument = async (
  documentId,
  highlightId,
  formData
) => {
  try {
    const response = await api.post(`/image/uploadImage`, formData, {
      params: { documentId, highlightId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error while uploading image for document", error);
    throw error;
  }
};

// Get Image Link
export const getImgLink = async (newImgName) => {
  return `${process.env.REACT_APP_BASE_URL}/api/image/${newImgName}`;
};
