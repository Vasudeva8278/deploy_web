import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllProjects } from '../../services/projectApi';

const initialState = {
    projects: [],
    loading: false,
    error: null,
};

// Async thunk to fetch projects
export const fetchProjects = createAsyncThunk(
  'getprojects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllProjects();
      return data; // Should be an array
      console.log(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const getProjectsSlice = createSlice({
    name: 'getprojects',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchProjects.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchProjects.fulfilled, (state, action) => {
          state.loading = false;
          state.projects = action.payload;
        })
        .addCase(fetchProjects.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch projects';
        });
    },
});

export default getProjectsSlice.reducer;
