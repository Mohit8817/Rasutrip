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
      // ✅ Pass country code as parameter
      const res = await axios.get(
        `${HotelServices.searchCities}?destination=${destination}&country_code=${countryCode}`
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







  // ✅ Block room before final booking
  export const blockRoom = async (payload) => {
    try {
      const res = await axios.post(`${baseURL}/hotelservice/blockroom`, payload);
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

      // Handle authentication errors specifically
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

  // ✅ Fetch Special Offers with Authentication
  export const fetchSpecialOffers = async () => {
    try {
      const headers = createAuthHeaders();

      console.log("🔄 Fetching special offers with token:", getAuthToken() ? "Token found" : "No token");

      const res = await axios.get(HotelServices.specialOffers, { headers });

      console.log("✅ Special offers response:", res.data);

      // Handle different response structures
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

      // Handle authentication errors
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

  // ✅ Updated bookHotel function with consistent authentication
  export const bookHotel = async (bookingPayload) => {
    try {
      // Use the same auth header creation as other functions
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

      // Re-throw the error so the calling function can handle it properly
      throw err;
    }
  };



  // ✅ Enhanced token validation function
  const validateToken = () => {
    const token = getAuthToken();

    if (!token) {
      console.error('❌ No authentication token found');
      return false;
    }

    try {
      // Basic JWT token validation (check if it's not expired)
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



  // ✅ NEW: Send invoice to customer email after successful booking
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

      // Return error details for handling
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Failed to send invoice'
      };
    }
  };

  export default HotelServices;