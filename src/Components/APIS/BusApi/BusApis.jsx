// // src/APIS/BusApi/BusApis.js
// import axios from "axios";
// import baseURL from "../../../Services/Config";
// import {
//   calculateVendorCommission,
//   calculatePriceWithCommission,
//   calculateFareFromBlockSeatResponse,
//   extractCommissionPercentage
// } from "../../Bus/vendorCommissionUtils";

// const BusServices = {
//   fetchCities: `${baseURL}/bus/search-city`,
//   searchResults: `${baseURL}/busservice/search`,
//   seatLayout: `${baseURL}/busservice/seatlayout`,
//   boardingDroppingPoints: `${baseURL}/busservice/boardingpoint`,
//   specialOffers: `${baseURL}/user/special-offer`,
//   applyCoupon: `${baseURL}/busservice/apply-coupon`,
//   blockSeat: `${baseURL}/busservice/blockseat`,
//   createOrder: `${baseURL}/busservice/create-order`,
//   validatePayment: `${baseURL}/busservice/validate`,
//   bookBus: `${baseURL}/busservice/book`,
//   downloadInvoice: `${baseURL}/busservice/invoice`,
// };

// // Helper function to get auth token
// const getAuthToken = () => {
//   return localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
// };

// // Helper function to create auth headers
// const createAuthHeaders = () => {
//   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//   return {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//     ...(token && { 'Authorization': `Bearer ${token}` })
//   };
// };





// export const getUserIP = async () => {
//   try {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     // return '27.60.0.238'
//     return data.ip;
//     //  // This will be something like "122.161.64.143"
//   } catch (error) {
//     console.error('Failed to get IP:', error);
//     return '';
//   }
// };



// // ─────────────────────────────────────────────────────────────
// // 📍 Fetch cities for autocomplete/search
// // ─────────────────────────────────────────────────────────────
// export const fetchBusCities = async (cityName) => {
//   try {
//     const response = await axios.get(`${BusServices.fetchCities}?city_name=${cityName}`);
//     return response.data;
//   } catch (err) {
//     console.error("❌ Error fetching bus cities:", err);
//     return [];
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // 🚌 Fetch bus search results with vendor commission processing
// // ─────────────────────────────────────────────────────────────
// export const fetchBusResults = async (DateOfJourney, OriginId, DestinationId, UserIp = null) => {
//   try {
//     // ✅ DYNAMIC IP: Agar UserIp pass nahi hui toh automatically fetch karo
//     let finalUserIp = UserIp;
    
//     if (!finalUserIp) {
//       console.log("🔄 UserIp not provided, fetching dynamically...");
//       finalUserIp = await getUserIP();
//       console.log("✅ Dynamic IP fetched:", finalUserIp);
//     } else {
//       console.log("✅ Using provided IP:", finalUserIp);
//     }

//     // API payload with dynamic IP
//     const payload = {
//       DateOfJourney,
//       OriginId,
//       DestinationId,
//       UserIp: finalUserIp, 
//     };

//     console.log("📤 Sending bus search payload:", payload);

//     const response = await axios.post(BusServices.searchResults, payload);

//     // Process the response to include vendor commission calculations
//     if (response.data?.Result) {
//       response.data.Result = response.data.Result.map(bus => {
//         const commissionPercentage = extractCommissionPercentage(bus);
//         const basePrice = bus.BusPrice?.PublishedPrice || 0;
//         const fareDetails = calculatePriceWithCommission(basePrice, commissionPercentage);

//         return {
//           ...bus,
//           // Add calculated fare details to the bus object
//           fareDetails: {
//             originalBasePrice: basePrice,
//             vendorCommissionPercentage: commissionPercentage,
//             vendorCommissionAmount: fareDetails.commissionAmount,
//             totalPriceWithCommission: fareDetails.totalPrice,
//             priceBreakdown: {
//               base: basePrice,
//               commission: fareDetails.commissionAmount,
//               taxes: bus.BusPrice?.Tax || 0,
//               otherCharges: bus.BusPrice?.OtherCharges || 0,
//               gst: bus.BusPrice?.GST ?
//                 (bus.BusPrice.GST.CGSTAmount + bus.BusPrice.GST.SGSTAmount + bus.BusPrice.GST.IGSTAmount) : 0
//             }
//           }
//         };
//       });
//     }

//     return response.data;
//   } catch (err) {
//     console.error("❌ Failed to fetch bus results:", err);
//     return [];
//   }
// };
// // ─────────────────────────────────────────────────────────────
// // 💺 Fetch bus seat layout for a selected bus
// // ─────────────────────────────────────────────────────────────
// export const fetchSeatLayout = async ({
//   SearchTokenId,
//   ResultIndex,
//   UserIp,
//   OriginId,
//   DestinationId,
// }) => {
//   try {
//     console.log("📡 Calling Seat Layout API with:", {
//       SearchTokenId,
//       ResultIndex,
//       UserIp,
//       OriginId,
//       DestinationId,
//     });

//     const response = await axios.post(BusServices.seatLayout, {
//       SearchTokenId,
//       ResultIndex,
//       UserIp,
//       OriginId,
//       DestinationId,
//     });

//     console.log("✅ Seat Layout API Response:", response.data);
//     return response.data;
//   } catch (err) {
//     console.error("❌ Seat layout fetch error:", err);
//     throw err;
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // 🚌 Fetch Boarding / Dropping points
// // ─────────────────────────────────────────────────────────────
// export const fetchBoardingDroppingPoints = async ({
//   UserIp,
//   SearchTokenId,
//   ResultIndex,
//   OriginId,
//   DestinationId,
// }) => {
//   try {
//     const payload = {
//       UserIp,
//       SearchTokenId,
//       ResultIndex,
//     };

//     console.log("🔍 Sending Boarding/Dropping API Payload:", payload);

//     const response = await axios.post(BusServices.boardingDroppingPoints, payload);

//     console.log("✅ Boarding/Dropping Response:", response.data);

//     return {
//       BoardingPointsDetails: response.data?.data?.BoardingPointsDetails || [],
//       DroppingPointsDetails: response.data?.data?.DroppingPointsDetails || [],
//     };
//   } catch (error) {
//     console.error("❌ Failed to fetch boarding/dropping points:", error.response?.data || error.message);

//     return {
//       BoardingPointsDetails: [],
//       DroppingPointsDetails: [],
//     };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // 🔒 Block Seat API with vendor commission processing
// // ─────────────────────────────────────────────────────────────
// export const blockSeats = async ({
//   UserIp,
//   SearchTokenId,
//   ResultIndex,
//   BoardingPointId,
//   DroppingPointId,
//   OriginId,
//   DestinationId,
//   Passenger, // Array of passenger objects with seat information
//   originalCommissionPercentage = 0 // Pass this from the original search result
// }) => {
//   try {
//     const payload = {
//       UserIp,
//       SearchTokenId,
//       ResultIndex,
//       BoardingPointId,
//       DroppingPointId,
//       OriginId,
//       DestinationId,
//       Passenger
//     };

//     console.log("🔒 Blocking seats with payload:", payload);

//     const response = await axios.post(BusServices.blockSeat, payload);

//     console.log("✅ Block Seat API Response:", response.data);

//     // Process the response to include vendor commission calculations
//     if (response.data?.Result?.Passenger) {
//       const fareBreakdown = calculateFareFromBlockSeatResponse(response.data, originalCommissionPercentage);

//       // Add fare breakdown to the response
//       response.data.fareBreakdown = fareBreakdown;
//       response.data.vendorCommissionDetails = {
//         commissionPercentage: originalCommissionPercentage,
//         commissionAmount: fareBreakdown?.vendorCommissionAmount || 0,
//         totalWithCommission: fareBreakdown?.totalAmount || 0
//       };
//     }

//     return response.data;
//   } catch (error) {
//     console.error("❌ Failed to block seats:", error.response?.data || error.message);
//     throw error;
//   }
// };


// // ───────────────────────────────────────────────
// // 📍 Get special offers (coupon list)
// // ───────────────────────────────────────────────
// export const fetchSpecialOffers = async () => {
//   try {
//     console.log("🔄 Fetching special offers from:", BusServices.specialOffers);

//     const response = await axios.get(BusServices.specialOffers, {
//       headers: createAuthHeaders(),
//       timeout: 10000,
//     });

//     console.log("✅ Special offers response:", response.data);

//     if (response.data && response.data.success) {
//       return response.data.data || response.data.offers || response.data;
//     }

//     return response.data || [];

//   } catch (err) {
//     console.error("❌ Error fetching special offers:", {
//       message: err.message,
//       status: err.response?.status,
//       data: err.response?.data,
//       url: BusServices.specialOffers
//     });

//     return [];
//   }
// };

// // ───────────────────────────────────────────────
// // 🎟 Apply coupon with enhanced debugging and multiple payload formats
// // ───────────────────────────────────────────────
// export const applyBusCoupon = async (couponCode, totalAmountWithCommission) => {
//   try {
//     console.log("🎫 Input parameters:", { couponCode, totalAmountWithCommission });

//     // Enhanced validation
//     if (!couponCode || typeof couponCode !== 'string' || couponCode.trim() === '') {
//       console.error("❌ Invalid coupon code:", couponCode);
//       throw new Error('Coupon code is required and must be a valid string');
//     }

//     if (!totalAmountWithCommission || totalAmountWithCommission <= 0) {
//       console.error("❌ Invalid amount:", totalAmountWithCommission);
//       throw new Error('Valid amount is required');
//     }

//     // Clean the coupon code
//     const cleanCouponCode = couponCode.trim().toUpperCase();
//     const cleanAmount = Number(totalAmountWithCommission);

//     // Try multiple payload formats as different APIs might expect different parameter names
//     const payloadOptions = [
//       // Format 1: Standard format
//       {
//         couponCode: cleanCouponCode,
//         amount: cleanAmount,
//       },
//       // Format 2: Alternative naming
//       {
//         code: cleanCouponCode,
//         totalAmount: cleanAmount,
//       },
//       // Format 3: Another common format
//       {
//         coupon_code: cleanCouponCode,
//         total_price: cleanAmount,
//       },
//       // Format 4: Simple format
//       {
//         couponCode: cleanCouponCode,
//         totalPrice: cleanAmount,
//       }
//     ];

//     let lastError = null;

//     // Try each payload format
//     for (let i = 0; i < payloadOptions.length; i++) {
//       const payload = payloadOptions[i];

//       try {
//         console.log(`🔄 Attempt ${i + 1} - Trying payload format:`, payload);
//         console.log("🌐 API endpoint:", BusServices.applyCoupon);

//         const headers = createAuthHeaders();
//         console.log("🔑 Headers:", headers);

//         const response = await axios.post(
//           BusServices.applyCoupon,
//           payload,
//           {
//             headers: headers,
//             timeout: 15000,
//           }
//         );

//         console.log(`✅ Success with payload format ${i + 1}:`, response.data);

//         // Handle different success response structures
//         if (response.data) {
//           // If API returns success: false, try next format
//           if (response.data.success === false) {
//             console.warn(`⚠️ Format ${i + 1} returned success: false:`, response.data.message);
//             lastError = new Error(response.data.message || 'Coupon application failed');
//             continue; // Try next format
//           }

//           // Success! Return the data
//           return response.data;
//         }

//         return response.data;

//       } catch (formatError) {
//         console.warn(`❌ Format ${i + 1} failed:`, {
//           message: formatError.message,
//           status: formatError.response?.status,
//           data: formatError.response?.data
//         });

//         lastError = formatError;

//         // If this is not the last attempt, continue to next format
//         if (i < payloadOptions.length - 1) {
//           continue;
//         }

//         // If this is the last attempt, throw the error
//         throw formatError;
//       }
//     }

//     // If we get here, all formats failed
//     throw lastError || new Error('All payload formats failed');

//   } catch (err) {
//     console.error("❌ Final error applying coupon:", {
//       message: err.message,
//       status: err.response?.status,
//       data: err.response?.data,
//       url: BusServices.applyCoupon
//     });

//     // Enhanced error handling
//     if (err.response) {
//       const errorData = err.response.data;
//       let errorMessage = 'Failed to apply coupon';

//       if (errorData) {
//         errorMessage = errorData.message ||
//           errorData.error ||
//           errorData.msg ||
//           `Server error: ${err.response.status}`;
//       }

//       // Create a more informative error object
//       const error = new Error(errorMessage);
//       error.status = err.response.status;
//       error.data = errorData;
//       throw error;

//     } else if (err.request) {
//       throw new Error('Network error: Unable to reach server');
//     } else {
//       throw new Error(err.message || 'Failed to apply coupon');
//     }
//   }
// };







// // _____________________________________________________
// // ✅ Create bus Razorpay order with commission-inclusive amount
// // _____________________________________________________
// export const createBusOrder = async (orderData) => {
//   try {
//     console.log('📦 Creating bus order with data:', orderData);

//     const headers = createAuthHeaders();

//     // Extract amount from orderData or use it directly if it's just amount
//     const amount = typeof orderData === 'object' ? orderData.amount : orderData;

//     const payload = {
//       amount: amount, // This should already include vendor commission
//       currency: 'INR',
//       booking_type: 'bus',
//       ...(typeof orderData === 'object' && orderData)
//     };

//     const response = await axios.post(
//       BusServices.createOrder,
//       payload,
//       { headers }
//     );

//     console.log('✅ createBusOrder Success:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('❌ createBusOrder Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // ________________________________________________
// // ✅ Create bus payment order (alias for createBusOrder)
// // ________________________________________________
// export const createBusPaymentOrder = async (orderData) => {
//   return createBusOrder(orderData);
// };

// // ________________________________________________
// // ✅ Validate bus payment with vendor commission details
// // ________________________________________________
// export const validateBusPayment = async (paymentData) => {
//   try {
//     console.log('🔍 Validating bus payment with payload:', paymentData);

//     const headers = createAuthHeaders();

//     // Construct payload exactly as per your Postman structure
//     const payload = {
//       amount: paymentData.amount, // This should include vendor commission
//       razorpay_order_id: paymentData.razorpay_order_id,
//       razorpay_payment_id: paymentData.razorpay_payment_id,
//       razorpay_signature: paymentData.razorpay_signature,
//       bookingType: "BUS",
//       Bus: {
//         ResultIndex: paymentData.Bus.ResultIndex,
//         BoardingPointId: paymentData.Bus.BoardingPointId,
//         DroppingPointId: paymentData.Bus.DroppingPointId,
//         SearchTokenId: paymentData.Bus.SearchTokenId,
//         CouponDiscount: paymentData.Bus.CouponDiscount || 0,
//         Passenger: paymentData.Bus.Passenger,
//         // Add vendor commission details if available
//         VendorCommissionAmount: paymentData.Bus.VendorCommissionAmount || 0,
//         VendorCommissionPercentage: paymentData.Bus.VendorCommissionPercentage || 0
//       }
//     };

//     console.log('📤 Sending validate payment payload:', payload);

//     const response = await axios.post(
//       BusServices.validatePayment,
//       payload,
//       { headers }
//     );

//     console.log('✅ validateBusPayment Success:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('❌ validateBusPayment Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // ________________________________________________
// // ✅ Book bus api with commission details
// // ________________________________________________
// export const bookBus = async (bookingData) => {
//   try {
//     console.log('📝 Booking bus with payload:', bookingData);

//     const headers = createAuthHeaders();

//     const response = await axios.post(
//       BusServices.bookBus,
//       bookingData,
//       { headers }
//     );

//     console.log('✅ bookBus Success:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('❌ bookBus Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // ✅ Download Invoice API - Sends invoice to user's email
// export const downloadBusInvoice = async (invoiceData) => {
//   try {
//     console.log('📧 Sending bus invoice to email with payload:', invoiceData);

//     const headers = createAuthHeaders();

//     // Construct payload as per your Postman structure
//     const payload = {
//       UserIp: invoiceData.UserIp || "122.161.64.143",
//       SearchTokenId: invoiceData.SearchTokenId,
//       BookingId: invoiceData.BookingId,
//       receiverEmail: invoiceData.receiverEmail
//     };

//     console.log('📤 Sending invoice email payload:', payload);

//     const response = await axios.post(
//       BusServices.downloadInvoice,
//       payload,
//       { headers }
//     );

//     console.log('✅ downloadBusInvoice Success:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('❌ downloadBusInvoice Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // ______________________________________________________
// // 🔧 Helper functions for vendor commission calculations
// // ______________________________________________________

// /**
//  * Calculate total booking amount including vendor commission
//  * @param {object} blockSeatResponse - Response from block seat API
//  * @param {number} commissionPercentage - Vendor commission percentage
//  * @returns {object} - Total amount breakdown
//  */
// export const calculateBookingTotal = (blockSeatResponse, commissionPercentage = 0) => {
//   if (!blockSeatResponse?.Result?.Passenger) {
//     return { totalAmount: 0, commissionAmount: 0 };
//   }

//   let baseAmount = 0;
//   blockSeatResponse.Result.Passenger.forEach(passenger => {
//     baseAmount += passenger.Seat?.Price?.PublishedPrice || 0;
//   });

//   const commissionAmount = calculateVendorCommission(baseAmount, commissionPercentage);
//   const totalAmount = baseAmount + commissionAmount;

//   return {
//     baseAmount,
//     commissionAmount,
//     commissionPercentage,
//     totalAmount
//   };
// };

// /**
//  * Prepare payment data with vendor commission included
//  * @param {object} paymentInfo - Basic payment information
//  * @param {object} fareBreakdown - Fare breakdown including commission
//  * @returns {object} - Payment data ready for validation API
//  */
// export const preparePaymentDataWithCommission = (paymentInfo, fareBreakdown) => {
//   return {
//     ...paymentInfo,
//     amount: fareBreakdown.totalAmount, // Include commission in payment amount
//     Bus: {
//       ...paymentInfo.Bus,
//       VendorCommissionAmount: fareBreakdown.vendorCommissionAmount,
//       VendorCommissionPercentage: fareBreakdown.vendorCommissionPercentage,
//       BaseAmount: fareBreakdown.basePrice
//     }
//   };
// };


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
  applyCoupon: `${baseURL}/busservice/apply-coupon`,
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
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ─────────────────────────────────────────────────────────────
//  Get User IP Address Dynamically
// ─────────────────────────────────────────────────────────────
export const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    console.log('✅ Fetched User IP:', data.ip);
    return data.ip;
  } catch (error) {
    console.error('❌ Failed to get IP:', error);
    return ''; // Return empty string as fallback
  }
};

// ─────────────────────────────────────────────────────────────
// Fetch cities for autocomplete/search
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
// Fetch bus search results with vendor commission processing
// ─────────────────────────────────────────────────────────────
export const fetchBusResults = async (DateOfJourney, OriginId, DestinationId, UserIp = null) => {
  try {
    let finalUserIp = UserIp;
    
    if (!finalUserIp) {
      console.log("🔄 UserIp not provided, fetching dynamically...");
      finalUserIp = await getUserIP();
      console.log("✅ Dynamic IP fetched:", finalUserIp);
    } else {
      console.log("✅ Using provided IP:", finalUserIp);
    }

    // API payload with dynamic IP
    const payload = {
      DateOfJourney,
      OriginId,
      DestinationId,
      UserIp: finalUserIp, 
    };

    console.log("📤 Sending bus search payload:", payload);


    // const response = await axios.post(BusServices.q, payload);

    const response = await axios.post(BusServices.searchResults, payload);

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
//  Fetch bus seat layout with dynamic IP
// ─────────────────────────────────────────────────────────────
export const fetchSeatLayout = async ({
  SearchTokenId,
  ResultIndex,
  UserIp = null,
  OriginId,
  DestinationId,
}) => {
  try {
    let finalUserIp = UserIp;
    
    if (!finalUserIp) {
      console.log("🔄 UserIp not provided for seat layout, fetching dynamically...");
      finalUserIp = await getUserIP();
      console.log("✅ Dynamic IP fetched:", finalUserIp);
    }

    console.log("📡 Calling Seat Layout API with:", {
      SearchTokenId,
      ResultIndex,
      UserIp: finalUserIp,
      OriginId,
      DestinationId,
    });

    const response = await axios.post(BusServices.seatLayout, {
      SearchTokenId,
      ResultIndex,
      UserIp: finalUserIp,
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
// Fetch Boarding / Dropping points with dynamic IP
// ─────────────────────────────────────────────────────────────
export const fetchBoardingDroppingPoints = async ({
  UserIp = null,
  SearchTokenId,
  ResultIndex,
  OriginId,
  DestinationId,
}) => {
  try {
    let finalUserIp = UserIp;
    
    if (!finalUserIp) {
      console.log("🔄 UserIp not provided for boarding/dropping points, fetching dynamically...");
      finalUserIp = await getUserIP();
      console.log("✅ Dynamic IP fetched:", finalUserIp);
    }

    const payload = {
      UserIp: finalUserIp,
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
// Block Seat API with dynamic IP and vendor commission
// ─────────────────────────────────────────────────────────────
export const blockSeats = async ({
  UserIp = null,
  SearchTokenId,
  ResultIndex,
  BoardingPointId,
  DroppingPointId,
  OriginId,
  DestinationId,
  Passenger,
  originalCommissionPercentage = 0
}) => {
  try {
    let finalUserIp = UserIp;
    
    if (!finalUserIp) {
      console.log("🔄 UserIp not provided for block seat, fetching dynamically...");
      finalUserIp = await getUserIP();
      console.log("✅ Dynamic IP fetched:", finalUserIp);
    }

    const payload = {
      UserIp: finalUserIp,
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
//  Get special offers (coupon list)
// ───────────────────────────────────────────────
export const fetchSpecialOffers = async () => {
  try {
    console.log("🔄 Fetching special offers from:", BusServices.specialOffers);

    const response = await axios.get(BusServices.specialOffers, {
      headers: createAuthHeaders(),
      timeout: 10000,
    });

    console.log("✅ Special offers response:", response.data);

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

    return [];
  }
};

// ───────────────────────────────────────────────
//  Apply coupon with enhanced debugging
// ───────────────────────────────────────────────
export const applyBusCoupon = async (couponCode, totalAmountWithCommission) => {
  try {
    console.log(" Input parameters:", { couponCode, totalAmountWithCommission });

    // Enhanced validation
    if (!couponCode || typeof couponCode !== 'string' || couponCode.trim() === '') {
      console.error("❌ Invalid coupon code:", couponCode);
      throw new Error('Coupon code is required and must be a valid string');
    }

    if (!totalAmountWithCommission || totalAmountWithCommission <= 0) {
      console.error("❌ Invalid amount:", totalAmountWithCommission);
      throw new Error('Valid amount is required');
    }

    // Clean the coupon code
    const cleanCouponCode = couponCode.trim().toUpperCase();
    const cleanAmount = Number(totalAmountWithCommission);

    // Try multiple payload formats
    const payloadOptions = [
      { couponCode: cleanCouponCode, amount: cleanAmount },
      { code: cleanCouponCode, totalAmount: cleanAmount },
      { coupon_code: cleanCouponCode, total_price: cleanAmount },
      { couponCode: cleanCouponCode, totalPrice: cleanAmount }
    ];

    let lastError = null;

    // Try each payload format
    for (let i = 0; i < payloadOptions.length; i++) {
      const payload = payloadOptions[i];

      try {
        console.log(`🔄 Attempt ${i + 1} - Trying payload format:`, payload);

        const headers = createAuthHeaders();
        const response = await axios.post(BusServices.applyCoupon, payload, {
          headers: headers,
          timeout: 15000,
        });

        console.log(`✅ Success with payload format ${i + 1}:`, response.data);

        if (response.data) {
          if (response.data.success === false) {
            console.warn(`⚠️ Format ${i + 1} returned success: false:`, response.data.message);
            lastError = new Error(response.data.message || 'Coupon application failed');
            continue;
          }
          return response.data;
        }

        return response.data;

      } catch (formatError) {
        console.warn(`❌ Format ${i + 1} failed:`, {
          message: formatError.message,
          status: formatError.response?.status,
          data: formatError.response?.data
        });

        lastError = formatError;

        if (i < payloadOptions.length - 1) {
          continue;
        }

        throw formatError;
      }
    }

    throw lastError || new Error('All payload formats failed');

  } catch (err) {
    console.error("❌ Final error applying coupon:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      url: BusServices.applyCoupon
    });

    if (err.response) {
      const errorData = err.response.data;
      let errorMessage = 'Failed to apply coupon';

      if (errorData) {
        errorMessage = errorData.message || errorData.error || errorData.msg || `Server error: ${err.response.status}`;
      }

      const error = new Error(errorMessage);
      error.status = err.response.status;
      error.data = errorData;
      throw error;

    } else if (err.request) {
      throw new Error('Network error: Unable to reach server');
    } else {
      throw new Error(err.message || 'Failed to apply coupon');
    }
  }
};

// _____________________________________________________
//  Create bus Razorpay order
// _____________________________________________________
export const createBusOrder = async (orderData) => {
  try {
    console.log('📦 Creating bus order with data:', orderData);

    const headers = createAuthHeaders();
    const amount = typeof orderData === 'object' ? orderData.amount : orderData;

    const payload = {
      amount: amount,
      currency: 'INR',
      booking_type: 'bus',
      ...(typeof orderData === 'object' && orderData)
    };

    const response = await axios.post(BusServices.createOrder, payload, { headers });

    console.log('✅ createBusOrder Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ createBusOrder Error:', error.response?.data || error.message);
    throw error;
  }
};

// ________________________________________________
//  Create bus payment order (alias)
// ________________________________________________
export const createBusPaymentOrder = async (orderData) => {
  return createBusOrder(orderData);
};

// ________________________________________________
//  Validate bus payment
// ________________________________________________
export const validateBusPayment = async (paymentData) => {
  try {
    console.log('🔍 Validating bus payment with payload:', paymentData);

    const headers = createAuthHeaders();

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
        Passenger: paymentData.Bus.Passenger,
        VendorCommissionAmount: paymentData.Bus.VendorCommissionAmount || 0,
        VendorCommissionPercentage: paymentData.Bus.VendorCommissionPercentage || 0
      }
    };

    console.log('📤 Sending validate payment payload:', payload);

    const response = await axios.post(BusServices.validatePayment, payload, { headers });

    console.log('✅ validateBusPayment Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ validateBusPayment Error:', error.response?.data || error.message);
    throw error;
  }
};

// ________________________________________________
//  Book bus api
// ________________________________________________
export const bookBus = async (bookingData) => {
  try {
    console.log('📝 Booking bus with payload:', bookingData);

    const headers = createAuthHeaders();
    const response = await axios.post(BusServices.bookBus, bookingData, { headers });

    console.log('✅ bookBus Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ bookBus Error:', error.response?.data || error.message);
    throw error;
  }
};

//  Download Invoice API with dynamic IP
export const downloadBusInvoice = async (invoiceData) => {
  try {
    console.log('📧 Sending bus invoice to email with payload:', invoiceData);

    let finalUserIp = invoiceData.UserIp;
    
    if (!finalUserIp) {
      console.log("🔄 UserIp not provided for invoice, fetching dynamically...");
      finalUserIp = await getUserIP();
      console.log("✅ Dynamic IP fetched:", finalUserIp);
    }

    const headers = createAuthHeaders();

    const payload = {
      UserIp: finalUserIp,
      SearchTokenId: invoiceData.SearchTokenId,
      BookingId: invoiceData.BookingId,
      receiverEmail: invoiceData.receiverEmail
    };

    console.log('📤 Sending invoice email payload:', payload);

    const response = await axios.post(BusServices.downloadInvoice, payload, { headers });

    console.log('✅ downloadBusInvoice Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ downloadBusInvoice Error:', error.response?.data || error.message);
    throw error;
  }
};

// ______________________________________________________
//  functions for vendor commission calculations
// _____________________________________________________

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

export const preparePaymentDataWithCommission = (paymentInfo, fareBreakdown) => {
  return {
    ...paymentInfo,
    amount: fareBreakdown.totalAmount,
    Bus: {
      ...paymentInfo.Bus,
      VendorCommissionAmount: fareBreakdown.vendorCommissionAmount,
      VendorCommissionPercentage: fareBreakdown.vendorCommissionPercentage,
      BaseAmount: fareBreakdown.basePrice
    }
  };
};