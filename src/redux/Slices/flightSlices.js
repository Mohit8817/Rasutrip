// src/redux/slices/flightSlice.js
import { createSlice } from '@reduxjs/toolkit';

const flightSlice = createSlice({
  name: 'flights',
  initialState: {
    flights: [],
  },
  reducers: {
    setFlights: (state, action) => {
      state.flights = action.payload;
    },
    clearFlights: (state) => {
      state.flights = [];
    },
  },
});

export const { setFlights, clearFlights } = flightSlice.actions;

export default flightSlice.reducer;
