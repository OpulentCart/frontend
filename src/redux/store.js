import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import storage from "redux-persist/lib/storage"; // Use localStorage
import { persistStore, persistReducer } from "redux-persist";
import notificationReducer from "./slices/notificationSlice"; // Ensure this exists

const persistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notifications: notificationReducer,
  },
});

export const persistor = persistStore(store);
