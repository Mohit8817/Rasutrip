// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import flightReducer from './Slices/flightSlices';
import passengersReducer from './Slices/PassengersSlice'
import selectedFlightsReducer from './Slices/SelectedFlight';
export const store = configureStore({
  reducer: {
    flight: flightReducer,
       passengersData: passengersReducer,
          selectedFlights: selectedFlightsReducer,

  },
});
