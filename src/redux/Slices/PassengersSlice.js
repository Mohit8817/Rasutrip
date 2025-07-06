// passengersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = [
    {
        type: '',
        Title: '',
        FirstName: '',
        LastName: '',
        PaxType: '',
        DateOfBirth: '',
        Gender: '',
        PassportNo: '',
        PassportExpiry: '',
        Nationality: '',
        PassportIssue: '',
        PAN: '',
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        CountryCode: '',
        CountryName: '',
        ContactNo: '',
        Email: '',
        IsLeadPax: '',
        FFAirline: '',
        FFNumber: '',
        documentId: '',
        Baggage: [],
        Meal: [],
        Seat: [],
        GSTCompanyName: '',
        GSTCompanyAddress: '',
        GSTCompanyContactNumber: '',
        GSTNumber: '',
        GSTCompanyEmail: ''
    }
];

const passengersSlice = createSlice({
    name: 'passengersData',
    initialState,
    reducers: {
        setPassengers: (state, action) => {
            return action.payload;
        },

        updatePassenger: (state, action) => {
            const { type, index, field, value } = action.payload;
            const filteredByType = state.filter(p => p.type === type);

            if (filteredByType.length > index) {
                const globalIndex = state.findIndex(
                    (p, i, arr) =>
                        p.type === type &&
                        arr.filter((x, j) => x.type === type && j <= i).length - 1 === index
                );

                if (globalIndex !== -1) {
                    state[globalIndex][field] = value;
                }
            }
        },

        addPassenger: (state, action) => {
            state.push(action.payload);
        },

        // New reducer for updating Meal
        updatePassengerMeal: (state, action) => {
            const { passengerId, meal } = action.payload;
            const passengerIndex = state.findIndex(p =>
                p.FirstName === passengerId.firstName &&
                p.LastName === passengerId.lastName &&
                p.type === passengerId.type
            );

            if (passengerIndex !== -1) {
                state[passengerIndex].Meal = [meal];
            }
        },

        // New reducer for updating Baggage
        updatePassengerBaggage: (state, action) => {
            const { passengerId, baggage } = action.payload;
            const passengerIndex = state.findIndex(p =>
                p.FirstName === passengerId.firstName &&
                p.LastName === passengerId.lastName &&
                p.type === passengerId.type
            );

            if (passengerIndex !== -1) {
                state[passengerIndex].Baggage = [baggage];
            }
        },

        // New reducer for updating Seat
        updatePassengerSeat: (state, action) => {
            const { passengerId, seat } = action.payload;
            const passengerIndex = state.findIndex(p =>
                p.FirstName === passengerId.firstName &&
                p.LastName === passengerId.lastName &&
                p.type === passengerId.type
            );

            if (passengerIndex !== -1) {
                state[passengerIndex].Seat = [seat];
            }
        },

        // New reducer for updating all add-ons at once
        updatePassengerAddons: (state, action) => {
            const { passengerId, meal, baggage, seat } = action.payload;
            const passengerIndex = state.findIndex(p =>
                p.FirstName === passengerId.firstName &&
                p.LastName === passengerId.lastName &&
                p.type === passengerId.type
            );
            if (passengerIndex !== -1) {
                if (meal) state[passengerIndex].Meal = [meal];
                if (baggage) state[passengerIndex].Baggage = [baggage];
                if (seat) state[passengerIndex].Seat = [seat];
            }
        }
    }
});

export const {
    setPassengers,
    updatePassenger,
    addPassenger,
    updatePassengerMeal,
    updatePassengerBaggage,
    updatePassengerSeat,
    updatePassengerAddons
} = passengersSlice.actions;

export default passengersSlice.reducer;