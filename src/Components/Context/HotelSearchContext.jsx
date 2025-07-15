// HotelSearchContext.js
import React, { createContext, useState } from 'react';

export const HotelSearchContext = createContext();

export const HotelSearchProvider = ({ children }) => {
  const [hotelSearchData, setHotelSearchData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
    nights: 1,
  });

  return (
    <HotelSearchContext.Provider value={{ hotelSearchData, setHotelSearchData }}>
      {children}
    </HotelSearchContext.Provider>
  );
};
