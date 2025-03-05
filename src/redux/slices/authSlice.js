import { createSlice } from "@reduxjs/toolkit";

// Retrieve stored values from sessionStorage
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
      state.refresh_token = action.payload.refresh;
    },
    logout: (state) => {
      state.access_token = null;
      state.user_role = null;
      state.cart_id = null;
      state.refresh_token = null;

      // Remove stored data
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("cart_id");
    },
    setCartId: (state, action) => {
      state.cart_id = action.payload; // ✅ Store cart_id in Redux
      sessionStorage.setItem("cart_id", action.payload); // ✅ Persist in sessionStorage
    },
  },
});

export const { login, logout, setCartId } = authSlice.actions;
export default authSlice.reducer;
