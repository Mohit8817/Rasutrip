import axios from "axios";
import baseURL from "../../../Services/Config";



// ✅ Define hotel-related service endpoints
const HotelServices = {
  searchCities: `${baseURL}/hotel/search-city`,
  searchHotels: `${baseURL}/hotelservice/search`,
  hotelInfo: `${baseURL}/hotelservice/gethotelinfo`,
  roomInfo: `${baseURL}/hotelservice/getroominfo`,
  createOrder: `${baseURL}/hotelservice/create-order`,
  validate: `${baseURL}/hotelservice/validate`, // ✅ Added validate endpoint
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
    return res.data;
  } catch (err) {
    console.error("❌ Room Info Fetch Failed:", err);
    return null;
  }
};

// ✅ Hotel Razorpay order creation with authentication headers
export const postHotel = async (data, endpoint) => {
  try {
    const res = await axios.post(`${baseURL}${endpoint}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ postHotel Error:", error.response?.data || error.message);
    throw error;
  }
};





export const createHotelOrder = async (amount) => {
  try {
    const token = localStorage.getItem('token');
    console.log("🔐 Sending token:", token); // Check token exists

    const res = await axios.post(
      `${HotelServices.createOrder}`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}` // ✅ Must be exactly this format
        }
      }
    );

    return res.data;
  } catch (error) {
    console.error("❌ createHotelOrder Error:", error.response?.data || error.message);
    throw error;
  }
};



// ✅ Validate hotel payment after Razorpay success
export const validateHotelPayment = async (payload) => {
  try {
    const token = localStorage.getItem('token'); // 👈 Get token

    const res = await axios.post(
      `${baseURL}/hotelservice/validate-payment`, // 🔁 Replace with your actual endpoint
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 Pass token in header
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("❌ validateHotelPayment Error:", error.response?.data || error.message);
    throw error;
  }
};