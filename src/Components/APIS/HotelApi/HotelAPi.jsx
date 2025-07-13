// src/APIS/HotelApi/HotelApi.js
import axios from "axios";
import baseURL from "../../../Services/Config";

const HotelServices = {
    searchCities: `${baseURL}/hotel/search-city`,
};

export const fetchHotelCities = async (destination) => {
    try {
        const response = await axios.get(`${HotelServices.searchCities}?destination=${destination}`);
        return response.data?.results || [];
    } catch (error) {
        console.error("Error fetching hotel cities:", error);
        return [];
    }
};
