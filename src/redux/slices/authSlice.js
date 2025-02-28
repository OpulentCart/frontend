import { createSlice } from "@reduxjs/toolkit";

// Retrieve stored cart_id and refresh_token from sessionStorage
const storedCartId = sessionStorage.getItem("cart_id");
const storedRefreshToken = sessionStorage.getItem("refresh_token");

const initialState = {
  access_token: null,  
  user_role: null,     
  cart_id: storedCartId || null,  
  refresh_token: storedRefreshToken || null,  
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.access_token = action.payload.access;
      state.user_role = action.payload.role;
      state.cart_id = action.payload.cart_id; 
      state.refresh_token = action.payload.refresh;

      // Store refresh_token & cart_id in sessionStorage
      sessionStorage.setItem("refresh_token", action.payload.refresh);
      sessionStorage.setItem("cart_id", action.payload.cart_id);
    },
    logout: (state) => {
      state.access_token = null;
      state.user_role = null;
      state.cart_id = null;
      state.refresh_token = null;

      // Remove stored refresh_token & cart_id
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("cart_id");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
