import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




export const SetupFriendsLoc = createAsyncThunk(
   '/SetupGeoTrigger',
   async (payload: { userID: string}, thunkApi) => {
      try {
         const response = await axios.get('http://localhost:5000/getFriendsID/', {
            params: {
               userID: payload.userID,   
            }
         })
         return response.data;
      } catch (error) {
         return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Unknown error")
      }
   }
)