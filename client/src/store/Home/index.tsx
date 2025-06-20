import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


interface PlaceInterface {
   id: number;
   type: string;
   position: Position;
   tags: {
      [key: string]: string;
      name?: string;
      amenity?: string;
      cuisine?: string;
      opening_hours?: string;
   };
   name: string;
}

interface fetchNearPlacesInterface  {
   isLoading: boolean,
   places: PlaceInterface[]
}

const initialState: fetchNearPlacesInterface  = {
   isLoading: false,
   places: [],
}


type Position = [number, number];

export const fetchNearbyPlaces = createAsyncThunk(
   '/Home/fetchNearbyPlaces',
   async (payload: { center: Position, radiusInMeters: number }, thunkApi) => {
      try {
         // console.log("payloaf on fetchNearbyPlaces : ", payload);
         const response = await axios.post("http://localhost:5000/fectchNearPlaces", payload, {
            headers: {
               'Content-Type': 'application/json'
            }
         });
         // console.log(response.data);
         return response.data;

      } catch (error) {
         console.log("error on fetchNearbyPlaces : ", error);
         return thunkApi.rejectWithValue(error)
      }
   }
)



const fetchNearPlacesSlice = createSlice({
   name: "nearPlaces",
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(fetchNearbyPlaces.pending, (state) => {
            state.isLoading = true;
         })
         .addCase(fetchNearbyPlaces.fulfilled, (state, action) => {
            state.places = action.payload.data;
            state.isLoading = false;
         })
         .addCase(fetchNearbyPlaces.rejected, (state) => {
            state.isLoading = false;
         });
   },
});


export default fetchNearPlacesSlice.reducer;

export type {
   fetchNearPlacesInterface 
   , PlaceInterface
}