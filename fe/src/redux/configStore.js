import { configureStore } from "@reduxjs/toolkit";
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';

// Create a basic reducer
const rootReducer = {
  app: appReducer,
  auth: authReducer,
};

export const store = configureStore({
  reducer: rootReducer,
});
