import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




export const SetupFriendsLoc = createAsyncThunk(
   '/SetupGeoTrigger',
   async (payload: { userID: string }, thunkApi) => {
      try {
         console.log(" SetupFriendsLoc payload :: ", payload)
         const response = await axios.get("http://localhost:5000/getFriends/Id", {
            params: {
               // userID: "106122007" ,
                userID: payload.userID,
            },
            withCredentials: true,
         });
         console.log("responcsse on SetupFriendsLoc :  ", response.data);
         return response.data;
      } catch (error) {
         return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Unknown error")
      }
   }
)