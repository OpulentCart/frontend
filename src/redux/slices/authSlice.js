import { createSlice } from "@reduxjs/toolkit";

// Clear sessionStorage on page reload (Ensures everything is null after restart)
sessionStorage.removeItem("refresh_token");

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
      sessionStorage.setItem("refresh_token", action.payload.refresh);
    },
    logout: (state) => {
      state.access_token = null;
      state.user_role = null;
      sessionStorage.removeItem("refresh_token"); // Clear refresh token
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
