  // src/APIS/BusApi/BusApis.js
  import axios from "axios";
  import baseURL from "../../../Services/Config";

  const BusServices = {
    fetchCities: `${baseURL}/bus/search-city`,
    searchResults: `${baseURL}/busservice/search`,
    seatLayout: `${baseURL}/busservice/seatlayout`,
    boardingDroppingPoints: `${baseURL}/busservice/boardingpoint`,
    blockSeat: `${baseURL}/busservice/blockseat`,
    createOrder: `${baseURL}/busservice/create-order`,
    validatePayment: `${baseURL}/busservice/validate`,
    bookBus: `${baseURL}/busservice/book`,
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

// ─────────────────────────────────────────────────────────────
// 📍 Fetch cities for autocomplete/search
// ─────────────────────────────────────────────────────────────
export const fetchBusCities = async (cityName) => {
  try {
    const response = await axios.get(`${BusServices.fetchCities}?city_name=${cityName}`);
    return response.data;
  } catch (err) {
    console.error("❌ Error fetching bus cities:", err);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// 🚌 Fetch bus search results
// ─────────────────────────────────────────────────────────────
export const fetchBusResults = async (DateOfJourney, OriginId, DestinationId, UserIp) => {
  try {
    const response = await axios.post(BusServices.searchResults, {
      DateOfJourney,
      OriginId,
      DestinationId,
      UserIp,
    });

    return response.data;
  } catch (err) {
    console.error("❌ Failed to fetch bus results:", err);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// 💺 Fetch bus seat layout for a selected bus
// ─────────────────────────────────────────────────────────────
export const fetchSeatLayout = async ({
  SearchTokenId,
  ResultIndex,
  UserIp,
  OriginId,
  DestinationId,
}) => {
  try {
    console.log("📡 Calling Seat Layout API with:", {
      SearchTokenId,
      ResultIndex,
      UserIp,
      OriginId,
      DestinationId,
    });

    const response = await axios.post(BusServices.seatLayout, {
      SearchTokenId,
      ResultIndex,
      UserIp,
      OriginId,
      DestinationId,
    });

    console.log("✅ Seat Layout API Response:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Seat layout fetch error:", err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
// 🚌 Fetch Boarding / Dropping points
// ─────────────────────────────────────────────────────────────
export const fetchBoardingDroppingPoints = async ({
  UserIp,
  SearchTokenId,
  ResultIndex,
  OriginId,
  DestinationId,
}) => {
  try {
    const payload = {
      UserIp,
      SearchTokenId,
      ResultIndex,
    };

    console.log("🔍 Sending Boarding/Dropping API Payload:", payload);

    const response = await axios.post(BusServices.boardingDroppingPoints, payload);

    console.log("✅ Boarding/Dropping Response:", response.data);

    return {
      BoardingPointsDetails: response.data?.data?.BoardingPointsDetails || [],
      DroppingPointsDetails: response.data?.data?.DroppingPointsDetails || [],
    };
  } catch (error) {
    console.error("❌ Failed to fetch boarding/dropping points:", error.response?.data || error.message);

    return {
      BoardingPointsDetails: [],
      DroppingPointsDetails: [],
    };
  }
};

// ─────────────────────────────────────────────────────────────
// 🔒 Block Seat API - Temporarily lock selected seats
// ─────────────────────────────────────────────────────────────
export const blockSeats = async ({
  UserIp,
  SearchTokenId,
  ResultIndex,
  BoardingPointId,
  DroppingPointId,
  OriginId,
  DestinationId,
  Passenger // Array of passenger objects with seat information
}) => {
  try {
    const payload = {
      UserIp,
      SearchTokenId,
      ResultIndex,
      BoardingPointId,
      DroppingPointId,
      OriginId,
      DestinationId,
      Passenger
    };

    console.log("🔒 Blocking seats with payload:", payload);

    const response = await axios.post(BusServices.blockSeat, payload);

    console.log("✅ Block Seat API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to block seats:", error.response?.data || error.message);
    throw error;
  }
};




// ✅ FIXED: Create bus Razorpay order
export const createBusOrder = async (orderData) => {
  try {
    console.log('📦 Creating bus order with data:', orderData);

    const headers = createAuthHeaders();

    // Extract amount from orderData or use it directly if it's just amount
    const amount = typeof orderData === 'object' ? orderData.amount : orderData;

    const payload = {
      amount: amount,
      currency: 'INR',
      booking_type: 'bus',
      ...(typeof orderData === 'object' && orderData)
    };

    const response = await axios.post(
      BusServices.createOrder,
      payload,
      { headers }
    );

    console.log('✅ createBusOrder Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ createBusOrder Error:', error.response?.data || error.message);
    throw error;
  }
};




// ✅ FIXED: Create bus payment order (alias for createBusOrder)
export const createBusPaymentOrder = async (orderData) => {
  return createBusOrder(orderData);
};

// ✅ NEW: Validate bus payment with exact structure as per your Postman
export const validateBusPayment = async (paymentData) => {
  try {
    console.log('🔍 Validating bus payment with payload:', paymentData);

    const headers = createAuthHeaders();

    // Construct payload exactly as per your Postman structure
    const payload = {
      amount: paymentData.amount,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      bookingType: "BUS",
      Bus: {
        ResultIndex: paymentData.Bus.ResultIndex,
        BoardingPointId: paymentData.Bus.BoardingPointId,
        DroppingPointId: paymentData.Bus.DroppingPointId,
        SearchTokenId: paymentData.Bus.SearchTokenId,
        CouponDiscount: paymentData.Bus.CouponDiscount || 0,
        Passenger: paymentData.Bus.Passenger
      }
    };

    console.log('📤 Sending validate payment payload:', payload);

    const response = await axios.post(
      BusServices.validatePayment,
      payload,
      { headers }
    );

    console.log('✅ validateBusPayment Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ validateBusPayment Error:', error.response?.data || error.message);
    throw error;
  }
};


