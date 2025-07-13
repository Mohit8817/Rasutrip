import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define hotel-related service endpoints
const HotelServices = {
  searchCities: `${baseURL}/hotel/search-city`,
  searchHotels: `${baseURL}/hotelservice/search`,
  hotelInfo: `${baseURL}/hotelservice/gethotelinfo`,
  roomInfo: `${baseURL}/hotelservice/getroominfo`, // ✅ Added for fetching room details
};

// ✅ Fetch hotel cities for autocomplete or destination suggestions
export const fetchHotelCities = async (destination) => {
  try {
    const res = await axios.get(
      `${HotelServices.searchCities}?destination=${destination}`
    );
    return res.data?.results || [];
  } catch (err) {
    console.error("❌ Error fetching hotel cities:", err);
    return [];
  }
};

// ✅ Search hotels using user input (city, check-in, check-out, guests, etc.)
export const fetchHotels = async (payload) => {
  try {
    const res = await axios.post(HotelServices.searchHotels, payload);
    return res.data;
  } catch (err) {
    console.error("❌ Hotel API Call Failed:", err);
    return null;
  }
};

// ✅ Get full hotel info (images, amenities, description, etc.)
export const fetchHotelInfo = async (payload) => {
  try {
    const res = await axios.post(HotelServices.hotelInfo, payload);
    return res.data?.Result || null;
  } catch (err) {
    console.error("❌ Hotel Info Fetch Failed:", err);
    return null;
  }
};

// ✅ Get available room info for a selected hotel
export const fetchRoomInfo = async (payload) => {
  try {
    const res = await axios.post(`${baseURL}/hotelservice/getroominfo`, payload);
    return res.data; // ✅ Return full response (not just .Result)
  } catch (err) {
    console.error("❌ Room Info Fetch Failed:", err);
    return null;
  }
};
