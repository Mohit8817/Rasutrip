// HotelSearchContext.js
import React, { createContext, useState } from 'react';

export const HotelSearchContext = createContext();

export const HotelSearchProvider = ({ children }) => {
  const [hotelSearchData, setHotelSearchData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    nights: 1,
    guests: 1,
    rooms: 1,
    adultsCount: 1,
    childrenCount: 0,
    roomDetails: [
      { adults: 1, children: 0 } // Default single room setup
    ]
  });

  return (
    <HotelSearchContext.Provider value={{ hotelSearchData, setHotelSearchData }}>
      {children}
    </HotelSearchContext.Provider>
  );
};
