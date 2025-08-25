import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define hotel-related service endpoints
const HotelServices = {
  searchCities: `${baseURL}/hotel/search-city`,
  searchHotels: `${baseURL}/hotelservice/search`,
  hotelInfo: `${baseURL}/hotelservice/gethotelinfo`,
  roomInfo: `${baseURL}/hotelservice/getroominfo`,
  blockRoom: `${baseURL}/hotelservice/blockroom`,
  createOrder: `${baseURL}/hotelservice/create-order`,
  validate: `${baseURL}/hotelservice/validate`,
  book: `${baseURL}/hotelservice/book`,
  downloadInvoice: `${baseURL}/hotelservice/invoice`,
};



// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Helper function to create auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
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


export const blockRoom = async (payload) => {
  try {
    const res = await axios.post(`${baseURL}/hotelservice/blockroom`, payload);
    return res.data;
  } catch (error) {
    console.error("blockRoom API error:", error);
    throw error;
  }
};




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


export const sendHotelInvoiceEmail = async (invoiceData) => {
  try {
    if (!invoiceData?.SearchTokenId || !invoiceData?.BookingId) {
      throw new Error('SearchTokenId and BookingId are required');
    }

    const payload = {
      ...invoiceData,
      UserIp: invoiceData.UserIp || "122.161.64.143",
      BookingId: String(invoiceData.BookingId).trim(),
      receiverEmail: invoiceData.receiverEmail || "",
      emailOnly: true
    };

    console.log('📧 Sending invoice email...', payload);

    const response = await axios.post(HotelServices.downloadInvoice, payload, {
      headers: {
        ...createAuthHeaders(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });

    return {
      success: true,
      emailSent: true,
      message: 'Invoice email sent successfully',
      data: response.data
    };

  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to send invoice email');
  }
};
