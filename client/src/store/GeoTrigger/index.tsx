import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




export const SetupGeoTrigger = createAsyncThunk(
   '/SetupGeoTrigger',
   async (payload: { userID: string, lat: number, lng: number }, thunkApi) => {
      try {
         const response = await axios.get('http://localhost:5000/getGeoTrigger/', {
            params: {
               userID: payload.userID,
               lat: payload.lat,
               lng: payload.lng
            }
         })
         return response.data;
      } catch (error) {
         return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Unknown error")
      }
   }
)