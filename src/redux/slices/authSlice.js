import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: !!localStorage.getItem("access_token"),
  userRole: localStorage.getItem("user_role") || "",
  accessToken: localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.userRole = action.payload.role;
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;

      localStorage.setItem("access_token", action.payload.access_token);
      localStorage.setItem("refresh_token", action.payload.refresh_token);
      localStorage.setItem("user_role", action.payload.role);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userRole = "";
      state.accessToken = null;
      state.refreshToken = null;

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
