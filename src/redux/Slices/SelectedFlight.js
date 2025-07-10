// src/redux/slices/selectedFlightsSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Helper function to safely parse JSON
const getLocalStorageItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error parsing localStorage item "${key}":`, error);
        return null;
    }
};

const initialState = {
    onward: getLocalStorageItem('selectedOnwardFlight'),
    return: getLocalStorageItem('selectedReturnFlight'),
    selectedOnwardFare: getLocalStorageItem('selectedOnwardFare'),
    selectedReturnFare: getLocalStorageItem('selectedReturnFare'),
    // selectedOnwardIndex: Number(localStorage.getItem('selectedOnwardIndex')) || null,
    // selectedReturnIndex: Number(localStorage.getItem('selectedReturnIndex')) || null,
};

console.log("initialState Redux ",initialState)

const selectedFlightsSlice = createSlice({
    name: 'selectedFlights',
    initialState,
    reducers: {
        setOnwardFlight: (state, action) => {
            state.onward = action.payload;
            localStorage.setItem('selectedOnwardFlight', JSON.stringify(action.payload));
        },
        setReturnFlight: (state, action) => {
            state.return = action.payload;
            localStorage.setItem('selectedReturnFlight', JSON.stringify(action.payload));
        },
        setSelectedOnwardFare: (state, action) => {
            state.selectedOnwardFare = action.payload;
            console.log("selected Onwared Fare", action.payload)

            // localStorage.setItem('selectedOnwardFare', JSON.stringify(action.payload));
        },
        setSelectedReturnFare: (state, action) => {
            state.selectedReturnFare = action.payload;
            console.log("selected returend Fare", action.payload)
            // localStorage.setItem('selectedReturnFare', JSON.stringify(action.payload));
        },

        clearSelectedFlights: (state) => {
            state.onward = null;
            state.return = null;
            state.selectedOnwardFare = null;
            state.selectedReturnFare = null;
            state.selectedOnwardIndex = null;
            state.selectedReturnIndex = null;
            localStorage.removeItem('selectedOnwardFlight');
            localStorage.removeItem('selectedReturnFlight');
            localStorage.removeItem('selectedOnwardFare');
            localStorage.removeItem('selectedReturnFare');
            localStorage.removeItem('selectedOnwardIndex');
            localStorage.removeItem('selectedReturnIndex');
        },
    },
});

export const {
    setOnwardFlight,
    setReturnFlight,
    setSelectedOnwardFare,
    setSelectedReturnFare,
    setSelectedOnwardIndex,
    setSelectedReturnIndex,
    clearSelectedFlights,
} = selectedFlightsSlice.actions;

export default selectedFlightsSlice.reducer;
