import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define hotel-related service endpoints
const HotelServices = {
  searchCities: `${baseURL}/hotel/search-city`,
  searchHotels: `${baseURL}/hotelservice/search`,
  hotelInfo: `${baseURL}/hotelservice/gethotelinfo`,
  roomInfo: `${baseURL}/hotelservice/getroominfo`,
  createOrder: `${baseURL}/hotelservice/create-order`,
  validate: `${baseURL}/hotelservice/validate`,
  book: `${baseURL}/hotelservice/book`,
};

// ✅ Fetch hotel cities for autocomplete or destination suggestions
export const fetchHotelCities = async (destination) => {
  try {
    const res = await axios.get(
      `${HotelServices.searchCities}?destination=${destination}`
    );
    return res.data?.results || [];
  } catch (err) {
    console.error("❌ Error fetching hotel cities:", err.response?.data || err.message);
    return [];
  }
};

// ✅ Search hotels using user input
export const fetchHotels = async (payload) => {
  try {
    const res = await axios.post(HotelServices.searchHotels, payload);
    return res.data;
  } catch (err) {
    console.error("❌ Hotel search failed:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Get full hotel info (images, amenities, etc.)
export const fetchHotelInfo = async (payload) => {
  try {
    const res = await axios.post(HotelServices.hotelInfo, payload);
    return res.data?.Result || null;
  } catch (err) {
    console.error("❌ Failed to fetch hotel info:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Get available room info
export const fetchRoomInfo = async (payload) => {
  try {
    const res = await axios.post(HotelServices.roomInfo, payload);
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch room info:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Generic hotel POST helper (used optionally)
export const postHotel = async (data, endpoint) => {
  try {
    const res = await axios.post(`${baseURL}${endpoint}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ postHotel Error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Create hotel Razorpay order

export const createHotelOrder = async (amount) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ Auth token is missing in localStorage.');
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await axios.post(
      HotelServices.createOrder,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ createHotelOrder Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ createHotelOrder Error:', error.response?.data || error.message);
    throw error;
  }
};
// ✅ Validate Razorpay payment
export const validateHotelPayment = async (payload) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token not found");

    const res = await axios.post(
      HotelServices.validate,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("❌ validateHotelPayment Error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Final Hotel Booking API Call
export const bookHotel = async (bookingPayload) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(HotelServices.book, bookingPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('✅ Hotel Booking API Success:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Error booking hotel:', err.response?.data || err.message);
    return null;
  }
};
