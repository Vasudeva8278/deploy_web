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

export const fetchProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error) {
    console.error("Error while updating project", error);
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
