import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




export const GetFriendsId = createAsyncThunk(
   '/SetupGeoTrigger',
   async (payload: { userID: string }, thunkApi) => {
      try {
         console.log(" SetupFriendsLoc payload :: ", payload)
         const response = await axios.get("http://localhost:5000/friend/getIds", {
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


export const postFriendsReq = createAsyncThunk(
   '/postFriendsReq',
   async (payload: { userID: string }, thunkApi) => {
      console.log("postFriendsReq payload : ", payload)
      try {
         console.log(" SetupFriendsLoc payload :: ", payload)
         const response = await axios.post("http://localhost:5000/friend/postReq",
            { userID: payload },
            {
               headers: {
                  'Content-Type': 'application/json'
               }
            });
         console.log("responcsse on SetupFriendsLoc :  ", response.data);
         return response.data;
      } catch (error) {
         return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Unknown error")
      }
   }
);

export const acceptFriendsReq = createAsyncThunk(
   '/acceptFriendsReq',
   async (payload: { userID: string, roomId: string }, thunkApi) => {
      try {
         console.log("  acceptFriendsReq :: ", payload)
         const response = await axios.post("http://localhost:5000/friend/acceptReq",
            payload,
            {
               headers: {
                  'Content-Type': 'application/json'
               }
            });
         console.log("responcsse on SetupFriendsLoc :  ", response.data);
         return response.data;
      } catch (error) {
         return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Unknown error")
      }
   }
)