// LocationContext.js
import { createContext, useState } from 'react';

export const PassengersContext = createContext();

export const PassengersProvider = ({ children }) => {
    const [PassengersData, setPassengersData] = useState([]);

    return (    
        <PassengersContext.Provider value={{ PassengersData, setPassengersData }}>
            {children}
        </PassengersContext.Provider>
    );
};
