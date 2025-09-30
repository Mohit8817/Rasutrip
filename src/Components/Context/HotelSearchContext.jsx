// HotelSearchContext.js
import React, { createContext, useState } from "react";

export const HotelSearchContext = createContext();

export const HotelSearchProvider = ({ children }) => {
  const [hotelSearchData, setHotelSearchData] = useState({
    city: "",
    cityId: "",
    checkIn: "",
    checkOut: "",
    nights: 1,
    guests: 2, // ✅ Default 2 guests to match GuestRoomSelector
    rooms: 1,
    adultsCount: 2, // ✅ Default 2 adults to match GuestRoomSelector
    childrenCount: 0,
    country: "India", // ✅ Add default country
    roomDetails: [
      { adults: 2, children: 0 }, // ✅ Default to match GuestRoomSelector
    ],
  });

  return (
    <HotelSearchContext.Provider
      value={{ hotelSearchData, setHotelSearchData }}
    >
      {children}
    </HotelSearchContext.Provider>
  );
};
