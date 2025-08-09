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



// ✅ Generic hotel POST helper (used optionally)
// export const postHotel = async (data, endpoint) => {
//   try {
//     const res = await axios.post(`${baseURL}${endpoint}`, data);
//     return res.data;
//   } catch (error) {
//     console.error("❌ postHotel Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

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





// ================================================
// 🏨 ENHANCED HOTEL INVOICE DOWNLOAD FUNCTION
// ================================================

export const downloadHotelInvoice = async (invoiceData) => {
  try {
    console.log('🏨 Starting hotel invoice download...');
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
      BookingId: String(invoiceData.BookingId).trim(), // Ensure it's a clean string
      receiverEmail: invoiceData.receiverEmail || ""
    };

    console.log('📤 Final payload being sent:', payload);
    console.log('🔗 API Endpoint:', HotelServices.downloadInvoice);

    // Make API request with enhanced configuration
    const response = await axios({
      method: 'POST',
      url: HotelServices.downloadInvoice,
      data: payload,
      headers: {
        ...headers,
        'Accept': 'application/pdf, application/json',
        'Content-Type': 'application/json',
      },
      responseType: 'blob', // Critical for file downloads
      timeout: 30000, // 30 second timeout
      validateStatus: function (status) {
        // Accept both success and 409 conflict status
        return (status >= 200 && status < 300) || status === 409;
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('🏨 Response Headers:', response.headers);

    // Handle 409 Conflict - Invoice already generated
    if (response.status === 409) {
      console.log('⚠️ Hotel invoice already exists (409)');

      // Try to parse the response to get more info
      try {
        const text = await response.data.text();
        const jsonResponse = JSON.parse(text);

        return {
          success: true,
          alreadyExists: true,
          message: jsonResponse.message || 'Hotel invoice already generated and sent to email',
          data: jsonResponse
        };
      } catch (parseError) {
        return {
          success: true,
          alreadyExists: true,
          message: 'Hotel invoice already generated and sent to email'
        };
      }
    }

    // Check content type for successful responses
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
      const filename = `hotel-invoice-${invoiceData.BookingId}-${timestamp}.pdf`;

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

      console.log('✅ Hotel invoice downloaded successfully:', filename);
      return { success: true, filename, fileSize, downloaded: true };

    } else {
      // Handle non-PDF response (might be JSON success message)
      try {
        const text = await response.data.text();
        console.log('🏨 Non-PDF Response:', text);

        let jsonResponse;
        try {
          jsonResponse = JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Expected PDF but received: ${contentType}`);
        }

        // Check if it's a success message without PDF
        if (jsonResponse.success || jsonResponse.Success) {
          return {
            success: true,
            message: jsonResponse.message || 'Hotel invoice processed successfully',
            data: jsonResponse
          };
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
    console.error('❌ Hotel Invoice Download Error:', error);

    // Enhanced error handling
    if (error.response) {
      console.error('❌ Error Status:', error.response.status);
      console.error('❌ Error Data:', error.response.data);

      // Special handling for 409 (should not reach here due to validateStatus)
      if (error.response.status === 409) {
        return {
          success: true,
          alreadyExists: true,
          message: 'Hotel invoice already generated and sent to email'
        };
      }

      let errorMessage = `Server error (${error.response.status})`;

      if (error.response.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response.status === 404) {
        errorMessage = 'Hotel invoice not found. Please check your booking ID.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response.status === 400) {
        errorMessage = 'Invalid request. Please check your hotel booking details.';
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

// ================================================
// 🏨 LEGACY HOTEL INVOICE FUNCTION (FOR COMPATIBILITY)
// ================================================

export const fetchHotelInvoice = async ({ BookingId, SearchTokenId, UserIp, receiverEmail }) => {
  console.log('⚠️ Using legacy fetchHotelInvoice - consider migrating to downloadHotelInvoice');
  
  try {
    const invoiceData = {
      BookingId,
      SearchTokenId,
      UserIp: UserIp || "122.161.64.143",
      receiverEmail: receiverEmail || ""
    };

    return await downloadHotelInvoice(invoiceData);
  } catch (err) {
    console.error("❌ Error fetching hotel invoice:", err.response?.data || err.message);
    throw err;
  }
};