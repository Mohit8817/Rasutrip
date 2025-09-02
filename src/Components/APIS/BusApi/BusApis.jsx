// src/APIS/BusApi/BusApis.js
import axios from "axios";
import baseURL from "../../../Services/Config";
import {
  calculateVendorCommission,
  calculatePriceWithCommission,
  calculateFareFromBlockSeatResponse,
  extractCommissionPercentage
} from "../../Bus/vendorCommissionUtils";

const BusServices = {
  fetchCities: `${baseURL}/bus/search-city`,
  searchResults: `${baseURL}/busservice/search`,
  seatLayout: `${baseURL}/busservice/seatlayout`,
  boardingDroppingPoints: `${baseURL}/busservice/boardingpoint`,
  specialOffers: `${baseURL}/user/special-offer`,
  applyCoupon: `${baseURL}/airservice/apply-coupon`,
  blockSeat: `${baseURL}/busservice/blockseat`,
  createOrder: `${baseURL}/busservice/create-order`,
  validatePayment: `${baseURL}/busservice/validate`,
  bookBus: `${baseURL}/busservice/book`,
  downloadInvoice: `${baseURL}/busservice/invoice`,
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Helper function to create auth headers
const createAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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
// 🚌 Fetch bus search results with vendor commission processing
// ─────────────────────────────────────────────────────────────
export const fetchBusResults = async (DateOfJourney, OriginId, DestinationId, UserIp) => {
  try {
    const response = await axios.post(BusServices.searchResults, {
      DateOfJourney,
      OriginId,
      DestinationId,
      UserIp,
    });

    // Process the response to include vendor commission calculations
    if (response.data?.Result) {
      response.data.Result = response.data.Result.map(bus => {
        const commissionPercentage = extractCommissionPercentage(bus);
        const basePrice = bus.BusPrice?.PublishedPrice || 0;
        const fareDetails = calculatePriceWithCommission(basePrice, commissionPercentage);

        return {
          ...bus,
          // Add calculated fare details to the bus object
          fareDetails: {
            originalBasePrice: basePrice,
            vendorCommissionPercentage: commissionPercentage,
            vendorCommissionAmount: fareDetails.commissionAmount,
            totalPriceWithCommission: fareDetails.totalPrice,
            priceBreakdown: {
              base: basePrice,
              commission: fareDetails.commissionAmount,
              taxes: bus.BusPrice?.Tax || 0,
              otherCharges: bus.BusPrice?.OtherCharges || 0,
              gst: bus.BusPrice?.GST ?
                (bus.BusPrice.GST.CGSTAmount + bus.BusPrice.GST.SGSTAmount + bus.BusPrice.GST.IGSTAmount) : 0
            }
          }
        };
      });
    }

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
// 🔒 Block Seat API with vendor commission processing
// ─────────────────────────────────────────────────────────────
export const blockSeats = async ({
  UserIp,
  SearchTokenId,
  ResultIndex,
  BoardingPointId,
  DroppingPointId,
  OriginId,
  DestinationId,
  Passenger, // Array of passenger objects with seat information
  originalCommissionPercentage = 0 // Pass this from the original search result
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

    // Process the response to include vendor commission calculations
    if (response.data?.Result?.Passenger) {
      const fareBreakdown = calculateFareFromBlockSeatResponse(response.data, originalCommissionPercentage);

      // Add fare breakdown to the response
      response.data.fareBreakdown = fareBreakdown;
      response.data.vendorCommissionDetails = {
        commissionPercentage: originalCommissionPercentage,
        commissionAmount: fareBreakdown?.vendorCommissionAmount || 0,
        totalWithCommission: fareBreakdown?.totalAmount || 0
      };
    }

    return response.data;
  } catch (error) {
    console.error("❌ Failed to block seats:", error.response?.data || error.message);
    throw error;
  }
};


// ───────────────────────────────────────────────
// 📍 Get special offers (coupon list)
// ───────────────────────────────────────────────
export const fetchSpecialOffers = async () => {
  try {
    console.log("🔄 Fetching special offers from:", BusServices.specialOffers);

    const response = await axios.get(BusServices.specialOffers, {
      headers: createAuthHeaders(),
      timeout: 10000, // 10 second timeout
    });

    console.log("✅ Special offers response:", response.data);

    // Handle different response structures
    if (response.data && response.data.success) {
      return response.data.data || response.data.offers || response.data;
    }

    return response.data || [];

  } catch (err) {
    console.error("❌ Error fetching special offers:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      url: BusServices.specialOffers
    });

    // Return empty array instead of throwing to prevent component crash
    return [];
  }
};

// ───────────────────────────────────────────────
// 🎟 Apply coupon with commission-aware amount calculation
// ───────────────────────────────────────────────
export const applyBusCoupon = async (couponCode, totalAmountWithCommission) => {
  try {
    // Validate inputs
    if (!couponCode || couponCode.trim() === '') {
      throw new Error('Coupon code is required');
    }

    if (!totalAmountWithCommission || totalAmountWithCommission <= 0) {
      throw new Error('Valid amount is required');
    }

    const payload = {
      couponCode: couponCode.trim(), // Ensure no extra spaces
      amount: Number(totalAmountWithCommission), // Ensure it's a number
    };

    console.log("🎫 Applying coupon with payload:", payload);
    console.log("🌐 API endpoint:", BusServices.applyCoupon);
    console.log("🔑 Headers:", createAuthHeaders());

    const response = await axios.post(
      BusServices.applyCoupon,
      payload,
      {
        headers: createAuthHeaders(),
        timeout: 15000, // 15 second timeout
      }
    );

    console.log("🎉 Apply coupon response:", response.data);

    // Handle different success response structures
    if (response.data) {
      // If API returns success: false, treat as error
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Coupon application failed');
      }

      return response.data;
    }

    return response.data;

  } catch (err) {
    console.error("❌ Error applying coupon:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      url: BusServices.applyCoupon,
      payload: { couponCode, amount: totalAmountWithCommission }
    });

    // Enhanced error handling
    if (err.response) {
      // Server responded with error status
      const errorMessage = err.response.data?.message ||
        err.response.data?.error ||
        `Server error: ${err.response.status}`;
      throw new Error(errorMessage);
    } else if (err.request) {
      // Request made but no response received
      throw new Error('Network error: Unable to reach server');
    } else {
      // Something else happened
      throw new Error(err.message || 'Failed to apply coupon');
    }
  }
};
// _____________________________________________________
// ✅ Create bus Razorpay order with commission-inclusive amount
// _____________________________________________________
export const createBusOrder = async (orderData) => {
  try {
    console.log('📦 Creating bus order with data:', orderData);

    const headers = createAuthHeaders();

    // Extract amount from orderData or use it directly if it's just amount
    const amount = typeof orderData === 'object' ? orderData.amount : orderData;

    const payload = {
      amount: amount, // This should already include vendor commission
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

// ________________________________________________
// ✅ Create bus payment order (alias for createBusOrder)
// ________________________________________________
export const createBusPaymentOrder = async (orderData) => {
  return createBusOrder(orderData);
};

// ________________________________________________
// ✅ Validate bus payment with vendor commission details
// ________________________________________________
export const validateBusPayment = async (paymentData) => {
  try {
    console.log('🔍 Validating bus payment with payload:', paymentData);

    const headers = createAuthHeaders();

    // Construct payload exactly as per your Postman structure
    const payload = {
      amount: paymentData.amount, // This should include vendor commission
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
        Passenger: paymentData.Bus.Passenger,
        // Add vendor commission details if available
        VendorCommissionAmount: paymentData.Bus.VendorCommissionAmount || 0,
        VendorCommissionPercentage: paymentData.Bus.VendorCommissionPercentage || 0
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

// ________________________________________________
// ✅ Book bus api with commission details
// ________________________________________________
export const bookBus = async (bookingData) => {
  try {
    console.log('📝 Booking bus with payload:', bookingData);

    const headers = createAuthHeaders();

    const response = await axios.post(
      BusServices.bookBus,
      bookingData,
      { headers }
    );

    console.log('✅ bookBus Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ bookBus Error:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ Download Invoice API - Sends invoice to user's email
export const downloadBusInvoice = async (invoiceData) => {
  try {
    console.log('📧 Sending bus invoice to email with payload:', invoiceData);

    const headers = createAuthHeaders();

    // Construct payload as per your Postman structure
    const payload = {
      UserIp: invoiceData.UserIp || "122.161.64.143",
      SearchTokenId: invoiceData.SearchTokenId,
      BookingId: invoiceData.BookingId,
      receiverEmail: invoiceData.receiverEmail
    };

    console.log('📤 Sending invoice email payload:', payload);

    const response = await axios.post(
      BusServices.downloadInvoice,
      payload,
      { headers }
    );

    console.log('✅ downloadBusInvoice Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ downloadBusInvoice Error:', error.response?.data || error.message);
    throw error;
  }
};

// ______________________________________________________
// 🔧 Helper functions for vendor commission calculations
// ______________________________________________________

/**
 * Calculate total booking amount including vendor commission
 * @param {object} blockSeatResponse - Response from block seat API
 * @param {number} commissionPercentage - Vendor commission percentage
 * @returns {object} - Total amount breakdown
 */
export const calculateBookingTotal = (blockSeatResponse, commissionPercentage = 0) => {
  if (!blockSeatResponse?.Result?.Passenger) {
    return { totalAmount: 0, commissionAmount: 0 };
  }

  let baseAmount = 0;
  blockSeatResponse.Result.Passenger.forEach(passenger => {
    baseAmount += passenger.Seat?.Price?.PublishedPrice || 0;
  });

  const commissionAmount = calculateVendorCommission(baseAmount, commissionPercentage);
  const totalAmount = baseAmount + commissionAmount;

  return {
    baseAmount,
    commissionAmount,
    commissionPercentage,
    totalAmount
  };
};

/**
 * Prepare payment data with vendor commission included
 * @param {object} paymentInfo - Basic payment information
 * @param {object} fareBreakdown - Fare breakdown including commission
 * @returns {object} - Payment data ready for validation API
 */
export const preparePaymentDataWithCommission = (paymentInfo, fareBreakdown) => {
  return {
    ...paymentInfo,
    amount: fareBreakdown.totalAmount, // Include commission in payment amount
    Bus: {
      ...paymentInfo.Bus,
      VendorCommissionAmount: fareBreakdown.vendorCommissionAmount,
      VendorCommissionPercentage: fareBreakdown.vendorCommissionPercentage,
      BaseAmount: fareBreakdown.basePrice
    }
  };
};