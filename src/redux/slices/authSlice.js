import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  access_token: null,
  user_role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.access_token = action.payload.access;
      state.user_role = action.payload.role;
      sessionStorage.setItem("refresh_token", action.payload.refresh); // Store refresh token in sessionStorage
    },
    logout: (state) => {
      state.access_token = null;
      state.user_role = null;
      sessionStorage.removeItem("refresh_token"); // Remove refresh token on logout
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
