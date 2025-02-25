import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  access_token: null,
  refresh_token: null,
  user_role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.access_token = action.payload.access;
      state.refresh_token = action.payload.refresh;
      state.user_role = action.payload.role;
    },
    logout: (state) => {
      state.access_token = null;
      state.refresh_token = null;
      state.user_role = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
