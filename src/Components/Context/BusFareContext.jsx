import { createContext, useContext, useState } from "react";

const BusFareContext = createContext();

export const useBusFare = () => useContext(BusFareContext);

export const BusFareProvider = ({ children }) => {
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedSeats, setSelectedSeats] = useState([]);

    return (
        <BusFareContext.Provider value={{ totalPrice, setTotalPrice, selectedSeats, setSelectedSeats }}>
            {children}
        </BusFareContext.Provider>
    );
};
