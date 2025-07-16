import { configureStore } from '@reduxjs/toolkit';
import getAllDocReducer from './slice/getalldoc.slice';
import getProjectsReducer from './slice/getproject.Slice';
const store = configureStore({
  reducer: {
    getalldoc: getAllDocReducer,
    getprojects:getProjectsReducer,
  },
});

export default store;
