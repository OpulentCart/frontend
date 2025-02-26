import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 0, // Default to 0 notifications
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.count = action.payload;
    },
    clearNotifications: (state) => {
      state.count = 0;
    },
  },
});

export const { setNotifications, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
