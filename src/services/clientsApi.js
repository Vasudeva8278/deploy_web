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

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 400) {
        console.error('Bad request error:', data);
        // Don't show alert for 400 errors, let the component handle it
        return Promise.reject(new Error(data?.message || 'Bad request error occurred'));
      }
      
      if (status === 500) {
        console.error('Server error:', data);
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
      
      if (status === 401) {
        console.error('Unauthorized:', data);
        return Promise.reject(new Error('Authentication failed. Please login again.'));
      }
      
      if (status === 403) {
        console.error('Forbidden:', data);
        return Promise.reject(new Error('Access denied.'));
      }
      
      if (status === 404) {
        console.error('Not found:', data);
        return Promise.reject(new Error('Resource not found.'));
      }
    }
    
    // Network or other errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    if (error.message.includes('Client has been destroyed')) {
      console.log('Client destroyed error (likely Chrome extension):', error.message);
      return Promise.reject(new Error('Connection interrupted. Please try again.'));
    }
    
    // Default error handling
    console.error('API error:', error);
    return Promise.reject(error);
  }
);

export const getAllClients = async (signal) => {
  try {
    const response = await api.get("/clients", { signal });
    // The backend returns { success: true, message: "...", data: clients }
    return response.data.data || [];
  } catch (error) {
    // Check if it's an abort error
    if (error.name === 'AbortError') {
      console.log('Clients request was aborted');
      throw error;
    }
    
    // Check if it's a network error
    if (error.code === 'ERR_NETWORK' || error.message.includes('Client has been destroyed')) {
      console.log('Network error or client destroyed:', error.message);
      throw new Error('Network error. Please check your connection.');
    }
    
    console.error("Error while fetching clients", error);
    throw error;
  }
};

export const getClientDetails = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error while fetching client details", error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });
    
    const deletePromise = api.delete(`/clients/${id}`);
    
    // Race between timeout and delete operation
    const response = await Promise.race([deletePromise, timeoutPromise]);
    
    return response.data;
  } catch (error) {
    // Check if it's a timeout error
    if (error.message === 'Request timeout') {
      console.error("Delete client request timed out");
      throw new Error('Request timed out. Please try again.');
    }
    
    // Check if it's a network error
    if (error.code === 'ERR_NETWORK' || error.message.includes('Client has been destroyed')) {
      console.log('Network error during delete:', error.message);
      throw new Error('Network error. Please check your connection.');
    }
    
    console.error("Error while deleting client", error);
    throw error;
  }
};
