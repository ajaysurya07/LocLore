import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




export const searchOnMapRoutes = createAsyncThunk(
   'search/searchOnMapRoutes',
   async (payload: any, thunkApi) => {
      try {
         console.log("payloaf on searchOnMapRoutes : ", payload);
         const response = await axios.get('http://localhost:5000/searchOnMap/', { params: { q: payload } })

         console.log(response.data)
         return response.data;

      } catch (error) {
         console.log("error on fetchNearbyPlaces : ", error);
         return thunkApi.rejectWithValue(error)
      }
   }
)