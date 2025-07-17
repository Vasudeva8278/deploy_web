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

export const createAndUpdateProfile = async (formData) => {
  try {
    const response = await api.post(`/profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Important for file uploads
      },
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error while creating project", error);
    throw error;
  }
};

export const fetchProfile = async (userId) => {

  try {
   
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error while fetching profile", error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post(
      "/users/change-password", // Replace with your API endpoint
      {
        currentPassword,
        newPassword,
      }
    );
    return response;
  } catch (error) {
    console.error("Error while creating project", error);
    throw error;
  }
};

export const getProjectById = async (projectId) => {
  const API_URL = process.env.REACT_APP_API_URL || "http://13.200.200.137:7000";
  const response = await axios.get(`${API_URL}/api/projects/${projectId}`);
  return response.data;
};
