import { configureStore } from "@reduxjs/toolkit";
import fetchNearPlacesReducer from "./Home"; 
import AuthReducer from "./Auth";


export const store = configureStore({
  reducer: {
    nearPlaces: fetchNearPlacesReducer, 
    auth : AuthReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;