import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}/api/users`,
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

export const getAllUsers = async () => {
   try{
    const response = await api.get('/');
    return response.data;
   } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
   }
}


export const updateUser = async (id, userData) => {
    try{
        const response = await api.put(`role/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}


export const deleteUser = async (id) => {
    try{
        const response = await api.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

