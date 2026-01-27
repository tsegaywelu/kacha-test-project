import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  currentuser: any;
  accessToken: string | null;
  error: any;
  loading: boolean;
}

const initialState: UserState = {
  currentuser: null,
  accessToken: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signinStart: (state) => {
      state.loading = true;
    },
    signinSuccess: (state, action) => {
      state.loading = false;
      state.currentuser = action.payload;
      state.error = null;
    },
    signinFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setToken: (state, action) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.currentuser = null;
      state.accessToken = null;
    },
    signoutsuccess: (state, action) => {
      state.loading = false;
      state.currentuser = null;
      state.accessToken = null;
      state.error = null;
    },
    signoutfailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  signinStart,
  signinSuccess,
  signinFailure,
  setToken,
  logout,
  // signoutstart,
  signoutsuccess,
  signoutfailure,
} = userSlice.actions; 
export default userSlice.reducer;

