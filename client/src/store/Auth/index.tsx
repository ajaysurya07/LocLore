import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


interface AuthInterface {
  id: string;
  userName: string,
  isAuth: boolean,
}

interface initialInterface {
  isLoading: boolean,
  user: AuthInterface
}



const initialState: initialInterface = {
  isLoading: false,
  user: {
    id: "",
    userName: "",
    isAuth: false,
  }

}

interface SignUpForm {
  userName: string,
  email: string,
  password: string,
  confirmPassword: string,
}

interface LoginForm {
  email: string,
  password: string,
}



export const SetSiguUp = createAsyncThunk(
  '/auth/SetSiguUp ',
  async (payload: SignUpForm, thunkApi) => {
    try {
      console.log("payloaad on SetSiguUp  : ", payload);
      const response = await axios.post("http://localhost:5000/auth/signUp", payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // console.log(response.data);
      return response.data;

    } catch (error) {
      console.log("error on SetSiguUp  : ", error);
      return thunkApi.rejectWithValue(error)
    }
  }
)

export const SetLogin = createAsyncThunk(
  '/auth/SetLogin',
  async (payload: { email: string; password: string }, thunkApi) => {
    try {
      const response = await axios.get("http://localhost:5000/auth/login", {
        params: {
          email: payload.email,
          password: payload.password,
        },
        withCredentials: true,
      });

      // console.log("Login response:", response.data);
      return response.data;

    } catch (error) {
      console.error("Login error:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const CheckAuth = createAsyncThunk(
  '/auth/CheckAuth',
  async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/me", {
        withCredentials: true,
      });
      // console.log("CheckAuth  response:", response);
      return response.data;

    } catch (error) {
      console.error("CheckAuth  error:", error);
    }
  }
);



const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(SetSiguUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(SetSiguUp.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isLoading = false;
        // console.log("action.payload.data; : " , action.payload.data);
      })
      .addCase(SetSiguUp.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(SetLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(SetLogin.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isLoading = false;
        // console.log("action.payload.data; : " , action.payload);
      })
      .addCase(SetLogin.rejected, (state) => {
        state.isLoading = false;
      })
            .addCase(CheckAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(CheckAuth.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isLoading = false;
        // console.log("action.payload.data; : " , action.payload);
      })
      .addCase(CheckAuth.rejected, (state) => {
        state.isLoading = false;
      });
  },
});


export default AuthSlice.reducer;

export type {
  SignUpForm,
  LoginForm,
}