import { configureStore } from "@reduxjs/toolkit";
import fetchNearPlacesReducer from "./Home"; 
export const store = configureStore({
  reducer: {
    nearPlaces: fetchNearPlacesReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;