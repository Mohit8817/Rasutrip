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
  downloadInvoice: `${baseURL}/busservice/invoice`,
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

// _____________________________________________________
// ✅ FIXED: Create bus Razorpay order
// _____________________________________________________

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

// ________________________________________________
// ✅ FIXED: Create bus payment order (alias for createBusOrder)
// ________________________________________________

export const createBusPaymentOrder = async (orderData) => {
  return createBusOrder(orderData);
};

// ________________________________________________
// ✅ NEW: Validate bus payment with exact structure as per your Postman
// ________________________________________________

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

// ________________________________________________
// ✅ NEW: Book api 
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








// ================================================
// 🚌 ENHANCED BUS INVOICE DOWNLOAD API
// ================================================

// Replace your existing downloadBusInvoice function with this enhanced version:

export const downloadBusInvoice = async (invoiceData) => {
  try {
    console.log('📄 Starting bus invoice download...');
    console.log('📤 Invoice Data:', invoiceData);

    // Input validation
    if (!invoiceData.SearchTokenId) {
      throw new Error('SearchTokenId is required for invoice download');
    }

    if (!invoiceData.BookingId) {
      throw new Error('BookingId is required for invoice download');
    }

    const headers = createAuthHeaders();

    // Enhanced payload with proper data structure
    const payload = {
      UserIp: invoiceData.UserIp || "122.161.64.143",
      SearchTokenId: invoiceData.SearchTokenId,
      BookingId: String(invoiceData.BookingId), // Ensure it's a string
      receiverEmail: invoiceData.receiverEmail || ""
    };

    console.log('📤 Final payload being sent:', payload);
    console.log('🔗 API Endpoint:', BusServices.downloadInvoice);

    // Make API request with enhanced configuration
    const response = await axios({
      method: 'POST',
      url: BusServices.downloadInvoice,
      data: payload,
      headers: {
        ...headers,
        'Accept': 'application/pdf, application/json',
      },
      responseType: 'blob', // Critical for file downloads
      timeout: 30000, // 30 second timeout
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Only accept 2xx status codes
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('📄 Response Headers:', response.headers);

    // Check content type
    const contentType = response.headers['content-type'] || response.headers['Content-Type'];
    console.log('📋 Content Type:', contentType);

    // Handle PDF response
    if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileSize = blob.size;

      console.log('📊 PDF File Size:', fileSize, 'bytes');

      if (fileSize < 100) {
        throw new Error('Downloaded file seems too small, might be corrupted');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `bus-invoice-${invoiceData.BookingId}-${timestamp}.pdf`;

      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log('✅ Invoice downloaded successfully:', filename);
      return { success: true, filename, fileSize };

    } else {
      // Handle non-PDF response (might be JSON error)
      try {
        const text = await response.data.text();
        console.log('📄 Non-PDF Response:', text);

        let jsonResponse;
        try {
          jsonResponse = JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Expected PDF but received: ${contentType}`);
        }

        if (jsonResponse.error || jsonResponse.Error) {
          throw new Error(jsonResponse.error?.message || jsonResponse.Error?.ErrorMessage || 'Server returned an error');
        }

        throw new Error('Expected PDF but received JSON response');
      } catch (textError) {
        throw new Error(`Unexpected response format: ${contentType}`);
      }
    }

  } catch (error) {
    console.error('❌ Invoice Download Error:', error);

    // Enhanced error handling
    if (error.response) {
      console.error('❌ Error Status:', error.response.status);
      console.error('❌ Error Data:', error.response.data);

      let errorMessage = `Server error (${error.response.status})`;

      if (error.response.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response.status === 404) {
        errorMessage = 'Invoice not found. Please check your booking ID.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response.status === 400) {
        errorMessage = 'Invalid request. Please check your booking details.';
      }

      // Try to extract error message from response
      if (error.response.data) {
        try {
          let errorData = error.response.data;

          // If it's a blob, convert to text first
          if (errorData instanceof Blob) {
            const text = await errorData.text();
            errorData = JSON.parse(text);
          }

          if (errorData.Error?.ErrorMessage) {
            errorMessage = errorData.Error.ErrorMessage;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error('Could not parse error response');
        }
      }

      throw new Error(errorMessage);

    } else if (error.request) {
      console.error('❌ Network Error:', error.request);
      throw new Error('Network error. Please check your internet connection.');

    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');

    } else {
      // Re-throw the original error if it's already a custom error
      throw error;
    }
  }
};