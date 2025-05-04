import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'en',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setTheme, setLanguage } = appSlice.actions;
export default appSlice.reducer; 