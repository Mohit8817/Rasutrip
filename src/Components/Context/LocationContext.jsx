// LocationContext.js
import { createContext, useState } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [locationData, setLocationData] = useState({
    fromCity: 'Delhi',
    toCity: 'Mumbai',
    fromAirport: 'DEL',
    toAirport: 'BOM',
    departDate: null, // ⬅️ Add departDate here
  });

  return (
    <LocationContext.Provider value={{ locationData, setLocationData }}>
      {children}
    </LocationContext.Provider>
  );
};
