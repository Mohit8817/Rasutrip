// src/Components/APIS/HotelApi/HotelAPi.jsx
import axios from "axios";
import baseURL from "../../../Services/Config";

const HotelServices = {
  searchCities: `${baseURL}/hotel/search-city`,
  searchHotels: `${baseURL}/hotelservice/search`,
};

export const fetchHotelCities = async (destination) => {
  try {
    const res = await axios.get(
      `${HotelServices.searchCities}?destination=${destination}`
    );
    return res.data?.results || [];
  } catch (err) {
    console.error("Error fetching hotel cities:", err);
    return [];
  }
};

export const fetchHotels = async (payload) => {
  try {
    const res = await axios.post(HotelServices.searchHotels, payload);
    return res.data;
  } catch (err) {
    console.error("❌ Hotel API Call Failed:", err);
    return null;
  }
};
