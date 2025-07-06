import { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const defaultLocation = {
    fromCity: '',
    toCity: '',
    fromAirport: '',
    toAirport: '',
    fromCode: '',
    toCode: '',
    departDate: null,
    returnDate: null,
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 1,
    tripType: 'oneway',
    bookingType: '', // ✅ Add booking type
  };

  const [locationData, setLocationData] = useState(() => {
    const saved = sessionStorage.getItem('locationData');
    return saved ? JSON.parse(saved) : defaultLocation;
  });

  useEffect(() => {
    sessionStorage.setItem('locationData', JSON.stringify(locationData));
  }, [locationData]);

  return (
    <LocationContext.Provider value={{ locationData, setLocationData }}>
      {children}
    </LocationContext.Provider>
  );
};
