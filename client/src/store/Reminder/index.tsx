import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




export const submitReminderForm = createAsyncThunk(
 '/submitReminderForm',
   async (payload: any, thunkApi) => {
      try {
         console.log("payload on submitReminderForm : ", payload);
         const response = await axios.post('http://localhost:5000/reminderForm'   , payload , { headers: {
               'Content-Type': 'application/json'
            }})

         console.log(response.data);
         return response.data;

      } catch (error) {
         console.log("error on submitReminderForm : ", error);
         return thunkApi.rejectWithValue(error)
      }
   }
)