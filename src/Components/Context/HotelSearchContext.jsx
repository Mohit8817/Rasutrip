// src/Context/HotelSearchContext.js

import React, { createContext, useState } from "react";

// ✅ Default values for hotel search context
const defaultValues = {
    city: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    rooms: '',
    nights: '',
};

// ✅ Create context
export const HotelSearchContext = createContext();

// ✅ Provider component
export const HotelSearchProvider = ({ children }) => {
    const [hotelSearchData, setHotelSearchData] = useState(defaultValues);

    return (
        <HotelSearchContext.Provider value={{ hotelSearchData, setHotelSearchData }}>
            {children}
        </HotelSearchContext.Provider>
    );
};
