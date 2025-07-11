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

export const fetchOrganizations = async () => {
  const { data } = await api.get('/organizations');
  return data;
};

export const createOrganization = async (organization) => {
  const { data } = await api.post('/organizations', organization);
  return data;
};

export const fetchPayments = async (orgId) => {
  const { data } = await api.get(`/payments/${orgId}`);
  return data;
};

export const fetchUser = async (userId) => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
};


export const forgotPassword = async (email) => {
  const response = await api.post('/users/forgotPassword', {email:email});
  return response.data;
};

export const getAllUsers = async () => {
  try{
    const response = await api.get('/users');
    return response.data; 
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try{
    const response = await api.put(`/users/role/${userId}`, {role: newRole});
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try{
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
export default api;
