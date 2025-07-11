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

export const getAllClients = async () => {
  try {
    const response = await api.get("/clients");
    return response.data.data;
  } catch (error) {
    console.error("Error while fetching projects", error);
    throw error;
  }
};

export const getClientDetails = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error while fetching projects", error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error while deleting client", error);
    throw error;
  }
};
