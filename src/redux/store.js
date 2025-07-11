import { configureStore } from '@reduxjs/toolkit';
import getAllDocReducer from './slice/getalldoc.slice';

const store = configureStore({
  reducer: {
    getalldoc: getAllDocReducer,
  },
});

export default store;
