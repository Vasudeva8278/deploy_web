import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://13.201.64.165:7000/api',
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAllDocuments = createAsyncThunk('data/fetchAllDocuments', async () => {
  // You may need to update this endpoint if you have a specific one for documents
  const response = await api.get('/projects', { headers: getAuthHeaders() });
  return response.data;
});

export const fetchAllProjects = createAsyncThunk('data/fetchAllProjects', async () => {
  const response = await api.get('/projects', { headers: getAuthHeaders() });
  return response.data;
});

export const fetchAllTemplates = createAsyncThunk('data/fetchAllTemplates', async () => {
  const response = await api.get('/templates/', { headers: getAuthHeaders() });
  return response.data;
});

const initialState = {
  documents: [],
  projects: [],
  templates: [],
  loading: false,
  error: null,
};

const getAllDocSlice = createSlice({
  name: 'getalldoc',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Documents
      .addCase(fetchAllDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchAllDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Projects
      .addCase(fetchAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Templates
      .addCase(fetchAllTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchAllTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default getAllDocSlice.reducer;
