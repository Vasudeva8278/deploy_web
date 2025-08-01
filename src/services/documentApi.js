import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api`,
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status === 500) {
      console.error('Server error (500)');
    }
    
    return Promise.reject(error);
  }
);

// Create Document
export const createDocument = async (formData) => {
  try {
    const response = await api.post(`/projects`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while creating document", error);
    throw error;
  }
};

// Update Document
export const updateDocument = async (projectId, formData) => {
  try {
    const response = await api.put(`/projects/${projectId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while updating document", error);
    throw error;
  }
};

// Delete Document
export const deleteDocument = async (projectId, documentId) => {
  try {
    const response = await api.delete(
      `/projectDocs/${projectId}/documents/delete-doc/${documentId}`
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error("Failed to delete document", error);
    throw error;
  }
};

// Update Document Highlight Text
export const updateDocHighlightText = async (documentId, updatedDoc) => {
  try {
    // Validate input parameters
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    if (!updatedDoc || typeof updatedDoc !== 'object') {
      throw new Error('Updated document data is required');
    }

    // Validate highlights structure
    if (!updatedDoc.highlights || !Array.isArray(updatedDoc.highlights)) {
      throw new Error('Highlights array is required');
    }

    // Sanitize the data before sending
    const sanitizedDoc = {
      ...updatedDoc,
      highlights: updatedDoc.highlights.map(highlight => ({
        id: highlight.id || highlight._id || '',
        label: highlight.label || highlight.name || '',
        text: highlight.text || '',
        type: highlight.type || 'text',
        name: highlight.name || highlight.label || highlight.id || ''
      })).filter(highlight => highlight.id && highlight.label) // Remove invalid highlights
    };

    console.log('Sending sanitized data to API:', sanitizedDoc);

    const response = await api.put(
      `/documents/updatedoc/${documentId}`,
      sanitizedDoc
    );
    
    return response.status === 200 ? response.data : null;
  } catch (error) {
    console.error("Failed to update document highlight text", error);
    
    // Log additional error details for debugging
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    // Don't throw the error - let the component handle it gracefully
    return null;
  }
};

// Get All Documents (Projects)
export const getAllDocuments = async () => {
  try {
    const response = await api.get("/projects");
    return response.data;
  } catch (error) {
    console.error("Error while fetching all documents", error);
    throw error;
  }
};

// Get Document by ID
export const getDocumentById = async (documentId) => {
  try {
    const response = await api.get(`/documents/view-document/${documentId}`);
    return response.data;
  } catch (error) {
    console.error("Error while fetching document by ID", error);
    throw error;
  }
};

// Get Documents by Template ID
export const getDocumentsByTemplateId = async (templateId) => {
  try {
    const response = await api.get(
      `/documents/template-documents/${templateId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error while fetching documents by template ID", error);
    throw error;
  }
};

// Get Documents by Template ID
export const getDocumentsListByTemplateId = async (projectId, templateId) => {
  try {
    const response = await api.get(
      `/projectDocs/${projectId}/template-documents/${templateId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error while fetching documents by template ID", error);
    throw error;
  }
};

// Get Home Page Documents
export const getHomePageDocuments = async (projectId) => {
  try {
    const response = await api.get(
      `/projectDocs/${projectId}/documents/documents-with-template-names`
    );
    return response.data;
  } catch (error) {
    console.error("Error while fetching home page documents", error);
    throw error;
  }
};

// Get Documents with Template Names
export const getDocumentsWithTemplateNames = async () => {
  try {
    const response = await api.get(
      `documents/documents-with-template-names`
    );
    return response.data;
  } catch (error) {
    console.error("Error while fetching documents with template names", error);
    throw error;
  }
};

// Download Document
export const downloadDocument = async (documentId, fileName) => {
  try {
    const response = await api.post(
      `/projectDocs/${documentId}/download`,
      null,
      {
        responseType: "blob",
      }
    );
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName.trim()}.docx`);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return "Success";
  } catch (error) {
    console.error("Error while downloading document", error);
    throw error;
  }
};

// Update Document Content
export const updateDocumentContent = async (documentId, content) => {
  try {
    const response = await api.put(
      `/projectDocs/update-content/${documentId}`,
      { content },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error while updating document content", error);
    throw error;
  }
};

// Delete Document (Alternative method)
export const deleteDocument1 = async (documentId) => {
  try {
    const response = await api.delete(`/documents/delete-doc/${documentId}`);
    return response;
  } catch (error) {
    console.error("Failed to delete document", error);
    throw error;
  }
};

// Add New Document
export const addNewDocument = async (newDoc) => {
  try {
    const response = await api.post(`/projectDocs/add-document`, newDoc);
    return response.data;
  } catch (error) {
    console.error("Error while adding new document", error);
    throw error;
  }
};

// Generate Zip File
export const generateZipFile = async (documentObj, filename) => {
  try {
    const response = await api.post(
      `/projectDocs/generate-documents`,
      documentObj,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    console.log("Documents zipped successfully.");
    return "Success";
  } catch (error) {
    console.error("Error while generating zip file", error);
    throw error;
  }
};

// Export Document
export const exportDocument = async (documentId) => {
  try {
    const response = await api.post(`/documents/${documentId}`, null, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while exporting document", error);
    throw error;
  }
};

// Download Document (Alternative method)
export const downloadDocument1 = async (documentId) => {
  try {
    const response = await api.post(`/documents/${documentId}/download`, null, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error while downloading document", error);
    throw error;
  }
};

export const createDocsMultipleTemplates = async (requestData) => {
  try {
    console.log('Sending request data to API:', requestData);
    
    // Validate request data
    if (!requestData) {
      throw new Error('Request data is required');
    }
    
    // Handle both old and new request formats
    let apiData;
    if (requestData.templates && Array.isArray(requestData.templates)) {
      // New format with additional metadata
      apiData = {
        templates: requestData.templates,
        documentName: requestData.documentName,
        projectId: requestData.projectId,
        clientId: requestData.clientId,
        clientName: requestData.clientName
      };
    } else if (Array.isArray(requestData)) {
      // Old format - just templates array
      apiData = {
        templates: requestData
      };
    } else {
      throw new Error('Invalid request data format');
    }
    
    // Validate templates structure
    if (!apiData.templates || !Array.isArray(apiData.templates) || apiData.templates.length === 0) {
      throw new Error('Templates array is required and cannot be empty');
    }
    
    // Validate each template
    apiData.templates.forEach((template, index) => {
      if (!template._id) {
        throw new Error(`Template at index ${index} is missing _id`);
      }
      if (!template.docName) {
        throw new Error(`Template at index ${index} is missing docName`);
      }
      if (!template.highlights || !Array.isArray(template.highlights)) {
        throw new Error(`Template at index ${index} is missing highlights array`);
      }
      
      // Validate each highlight in the template
      template.highlights.forEach((highlight, highlightIndex) => {
        if (!highlight || typeof highlight !== 'object') {
          throw new Error(`Template at index ${index} has invalid highlight at index ${highlightIndex}`);
        }
        if (!highlight.label && !highlight.name) {
          throw new Error(`Template at index ${index} has highlight at index ${highlightIndex} missing label/name`);
        }
        if (highlight.text === undefined || highlight.text === null) {
          throw new Error(`Template at index ${index} has highlight at index ${highlightIndex} with invalid text`);
        }
      });
    });
    
    // Validate project ID if provided
    if (apiData.projectId && typeof apiData.projectId !== 'string') {
      throw new Error('Project ID must be a string');
    }
    
    // Validate document name if provided
    if (apiData.documentName && typeof apiData.documentName !== 'string') {
      throw new Error('Document name must be a string');
    }
    
    console.log('Validated API data:', apiData);
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });
    
    const apiPromise = api.post("/projectDocs/create-multiDocs", apiData);
    
    // Race between timeout and API call
    const response = await Promise.race([apiPromise, timeoutPromise]);
    
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error while creating multiple documents", error);
    
    // Check if it's a timeout error
    if (error.message === 'Request timeout') {
      console.error("Create documents request timed out");
      throw new Error('Request timed out. Please try again.');
    }
    
    // Check if it's a validation error
    if (error.message.includes('is required') || error.message.includes('Invalid request data') || error.message.includes('missing') || error.message.includes('invalid')) {
      console.error('Validation error:', error.message);
      throw new Error(`Validation error: ${error.message}`);
    }
    
    // Log additional error details for debugging
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      
      // Handle specific HTTP status codes
      if (error.response.status === 400) {
        const errorMessage = error.response.data?.message || 'Bad request - invalid data provided';
        throw new Error(errorMessage);
      }
      
      if (error.response.status === 500) {
        throw new Error('Server error occurred. Please try again later.');
      }
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

export const sendDocumentViaEmail = async (documentId) => {
  try {
    const response = await api.get(`/projectDocs/email-document/${documentId}`);
    console.log(response.data);
    return response;
  } catch (error) {
    console.error("Error while emailing document", error);
    throw error;
  }
};
