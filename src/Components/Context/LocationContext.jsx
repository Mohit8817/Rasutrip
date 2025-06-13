// LocationContext.js
import { createContext, useState } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [locationData, setLocationData] = useState({
    fromCity: 'Delhi',
    toCity: 'Mumbai',
    fromAirport: 'DEL',
    toAirport: 'BOM',
    departDate: null,
    returnDate: null,
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'ANY',
    tripType: 'oneway',
  });

  return (
    <LocationContext.Provider value={{ locationData, setLocationData }}>
      {children}
    </LocationContext.Provider>
  );
};
