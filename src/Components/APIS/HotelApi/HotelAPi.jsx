import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define hotel-related service endpoints
const HotelServices = {
  searchCities: `${baseURL}/hotel/search-city`,
  searchHotels: `${baseURL}/hotelservice/search`,
  hotelInfo: `${baseURL}/hotelservice/gethotelinfo`,
  roomInfo: `${baseURL}/hotelservice/getroominfo`,
  blockRoom: `${baseURL}/hotelservice/blockroom`,
  applyCoupon: `${baseURL}/airservice/apply-coupon`,
  specialOffers: `${baseURL}/user/special-offer`,
  createOrder: `${baseURL}/hotelservice/create-order`,
  validate: `${baseURL}/hotelservice/validate`,
  book: `${baseURL}/hotelservice/book`,
  sendInvoice: `${baseURL}/hotelservice/invoice`,
};

// ✅ Get User IP dynamically
export const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    console.log('✅ Fetched User IP:', data.ip);
    return data.ip;
  } catch (error) {
    console.error('❌ Failed to get IP:', error);
    return '0.0.0.0'; // Return fallback IP
  }
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken') ||
    localStorage.getItem('userToken') ||
    sessionStorage.getItem('token');
};

// ✅ Updated createAuthHeaders with token validation
const createAuthHeaders = () => {
  if (!validateToken()) {
    throw new Error('Authentication token is missing or expired. Please login again.');
  }

  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ✅ Fetch hotel cities for autocomplete or destination suggestions
export const fetchHotelCities = async (destination, countryCode = 'IN') => {
  try {
    const res = await axios.get(
      `${HotelServices.searchCities}?destination=${destination}&country_code=${countryCode}`
    );
    return res.data?.results || [];
  } catch (err) {
    console.error("❌ Error fetching hotel cities:", err.response?.data || err.message);
    return [];
  }
};

// ✅ Search hotels using user input with DYNAMIC IP (FIXED CASING)
export const fetchHotels = async (payload) => {
  try {
    // Get dynamic user IP
    const userIP = await getUserIP();
    
    // ✅ FIXED: Use UserIp (lowercase 'p') to match backend expectation
    const updatedPayload = {
      ...payload,
      UserIp: userIP || '0.0.0.0'
    };

    console.log('🔄 Searching hotels with dynamic IP:', userIP);
    console.log('📤 Full payload:', JSON.stringify(updatedPayload, null, 2));
    
    const res = await axios.post(HotelServices.searchHotels, updatedPayload);
    return res.data;
  } catch (err) {
    console.error("❌ Hotel search failed:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Get full hotel info with DYNAMIC IP (FIXED CASING)
export const fetchHotelInfo = async (payload) => {
  try {
    const userIP = await getUserIP();
    
    const updatedPayload = {
      ...payload,
      UserIp: userIP || '0.0.0.0'  // ✅ FIXED: lowercase 'p'
    };

    const res = await axios.post(HotelServices.hotelInfo, updatedPayload);
    return res.data?.Result || null;
  } catch (err) {
    console.error("❌ Failed to fetch hotel info:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Get available room info with DYNAMIC IP (FIXED CASING)
export const fetchRoomInfo = async (payload) => {
  try {
    const userIP = await getUserIP();
    
    const updatedPayload = {
      ...payload,
      UserIp: userIP || '0.0.0.0'  // ✅ FIXED: lowercase 'p'
    };

    const res = await axios.post(HotelServices.roomInfo, updatedPayload);
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch room info:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Block room before final booking with DYNAMIC IP (FIXED CASING)
export const blockRoom = async (payload) => {
  try {
    const userIP = await getUserIP();
    
    const updatedPayload = {
      ...payload,
      UserIp: userIP || '0.0.0.0'  // ✅ FIXED: lowercase 'p'
    };

    const res = await axios.post(`${baseURL}/hotelservice/blockroom`, updatedPayload);
    return res.data;
  } catch (error) {
    console.error("blockRoom API error:", error);
    throw error;
  }
};

export const applyCouponCode = async (couponCode) => {
  try {
    const headers = createAuthHeaders();
    const payload = { code: couponCode };

    const res = await axios.post(HotelServices.applyCoupon, payload, { headers });

    return {
      success: true,
      data: res.data,
      message: res.data?.message || "Coupon applied successfully!",
    };
  } catch (err) {
    console.error("❌ Failed to apply coupon:", err.response?.data || err.message);

    if (err.response?.status === 401 || err.response?.data?.error === "Please authenticate.") {
      return {
        success: false,
        data: null,
        message: "Please login to apply coupon code",
        authError: true
      };
    }

    return {
      success: false,
      data: null,
      message: err.response?.data?.message || "Invalid coupon code or coupon has expired",
    };
  }
};

export const fetchSpecialOffers = async () => {
  try {
    const headers = createAuthHeaders();

    console.log("🔄 Fetching special offers with token:", getAuthToken() ? "Token found" : "No token");

    const res = await axios.get(HotelServices.specialOffers, { headers });

    console.log("✅ Special offers response:", res.data);

    let offersData = [];

    if (res.data?.offers) {
      offersData = res.data.offers;
    } else if (Array.isArray(res.data)) {
      offersData = res.data;
    } else if (res.data?.data) {
      offersData = res.data.data;
    }

    return {
      success: true,
      data: { offers: offersData },
      message: "Special offers loaded successfully"
    };
  } catch (err) {
    console.error("❌ Failed to fetch offers:", err.response?.data || err.message);

    if (err.response?.status === 401 || err.response?.data?.error === "Please authenticate.") {
      console.error("🚫 Authentication required for special offers");
      return {
        success: false,
        data: [],
        message: "Please login to view special offers",
        authError: true
      };
    }

    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Failed to load special offers",
    };
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

export const bookHotel = async (bookingPayload) => {
  try {
    const headers = createAuthHeaders();

    console.log('🔄 Sending booking request with headers:', {
      'Authorization': headers.Authorization ? 'Bearer [TOKEN_PRESENT]' : 'Missing',
      'Content-Type': headers['Content-Type']
    });

    console.log('📝 Booking payload:', JSON.stringify(bookingPayload, null, 2));

    const res = await axios.post(HotelServices.book, bookingPayload, { headers });

    console.log('✅ Hotel Booking API Success:', res.data);
    return res.data;

  } catch (err) {
    console.error('❌ Hotel booking API error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });

    throw err;
  }
};

const validateToken = () => {
  const token = getAuthToken();

  if (!token) {
    console.error('❌ No authentication token found');
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      console.error('❌ Token has expired');
      return false;
    }

    console.log('✅ Token is valid, expires at:', new Date(payload.exp * 1000));
    return true;

  } catch (error) {
    console.error('❌ Invalid token format:', error);
    return false;
  }
};

export const sendHotelInvoice = async (invoicePayload) => {
  try {
    console.log('📧 Sending invoice with payload:', invoicePayload);

    const headers = createAuthHeaders();

    const response = await axios.post(HotelServices.sendInvoice, invoicePayload, { headers });

    console.log('📧 Invoice sent successfully:', response.data);
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Invoice sent successfully'
    };

  } catch (error) {
    console.error('❌ Error sending invoice:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data || error.message,
      message: error.response?.data?.message || 'Failed to send invoice'
    };
  }
};

export default HotelServices;