import axios from "axios";
// Update this import path according to your project structure
import baseURL from "../../../Services/Config";

// ✅ Define bus booking service endpoints - UNIFIED FOR ALL USERS
const BusBookingServices = {
  upcomingBookings: `${baseURL}/busservice/up-comming-bookings`,
  allBookings: `${baseURL}/busservice/my-bookings`,
  realTimeStatus: `${baseURL}/busservice/real-time-booking-details`,
};

// ✅ Define hotel booking service endpoints - UNIFIED FOR ALL USERS
const HotelBookingServices = {
  upcomingBookings: `${baseURL}/hotelservice/up-comming-bookings`,
  allBookings: `${baseURL}/hotelservice/my-bookings`,
  realTimeStatus: `${baseURL}/hotelservice/real-time-booking-details`,
};

// ✅ Define flight booking service endpoints - UNIFIED FOR ALL USERS
const FlightBookingServices = {
  upcomingBookings: `${baseURL}/airservice/up-comming-bookings`,
  allBookings: `${baseURL}/airservice/my-bookings`,
  realTimeStatus: `${baseURL}/airservice/real-time-booking-details`,
};

const FlightInvoice = {
  invoice: "airservice/invoice",
};

const BusInvoice = {
  invoice: "busservice/invoice",
};

// ✅ Helper function to detect user type from multiple sources
const detectUserType = () => {
  console.log("🔍 Detecting user type...");

  // Method 1: Check localStorage for userType
  const storedUserType =
    localStorage.getItem("userType") || localStorage.getItem("user_type");
  console.log("💾 Stored user type:", storedUserType);

  // Method 2: Check token key patterns
  let detectedType = null;

  // Check for customer token patterns
  const customerTokenKeys = [
    "token",
    "authToken",
    "customer_token",
    "customerToken",
  ];
  const hasCustomerToken = customerTokenKeys.some((key) =>
    localStorage.getItem(key)
  );

  // Check for agent token patterns
  const agentTokenKeys = ["agent_token", "agentToken", "agent_auth_token"];
  const hasAgentToken = agentTokenKeys.some((key) => localStorage.getItem(key));

  console.log("🏪 Customer token found:", hasCustomerToken);
  console.log("🏢 Agent token found:", hasAgentToken);

  // Priority logic for user type detection
  if (storedUserType) {
    detectedType = storedUserType.toLowerCase();
  } else if (hasAgentToken && !hasCustomerToken) {
    detectedType = "agent";
  } else if (hasCustomerToken && !hasAgentToken) {
    detectedType = "customer";
  } else {
    // Default fallback - assume customer if we have any token
    const hasAnyToken =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    detectedType = hasAnyToken ? "customer" : null;
  }

  console.log("✅ Final detected user type:", detectedType);
  return detectedType;
};

// ✅ Helper function to get authentication headers with user type awareness
const getAuthHeaders = (userType = null) => {
  const currentUserType = userType || detectUserType();
  console.log("🔐 Getting auth headers for user type:", currentUserType);

  // Try different token keys based on user type
  let token = null;
  let tokenKey = null;

  const tokenKeys =
    currentUserType === "agent"
      ? ["agent_token", "agentToken", "agent_auth_token", "token", "authToken"] // Agent token priority
      : [
        "token",
        "authToken",
        "customer_token",
        "customerToken",
        "accessToken",
      ]; // Customer token priority

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) {
      token = value;
      tokenKey = key;
      break;
    }
  }

  console.log("🔐 Token found with key:", tokenKey);
  console.log(
    "🔐 Token preview:",
    token ? `${token.substring(0, 15)}...` : "None"
  );

  if (!token) {
    console.error(
      "❌ No authentication token found for user type:",
      currentUserType
    );
    throw new Error(
      `No authentication token found for ${currentUserType}. Please login again.`
    );
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "User-Type": currentUserType || "customer",
  };
};

// ✅ Helper function to get appropriate booking endpoints - SIMPLIFIED (same endpoints for all users)
const getBookingEndpoints = (userType, serviceType = "bus") => {
  console.log(`🎯 Getting ${serviceType} endpoints for user type:`, userType);

  if (serviceType === "hotel") {
    return HotelBookingServices;
  } else if (serviceType === "flight") {
    return FlightBookingServices;
  } else {
    // Default to bus service
    return BusBookingServices;
  }
};

// Updated makeAuthenticatedRequest function with better error handling
const makeAuthenticatedRequest = async (
  url,
  method = "GET",
  data = null,
  userType = null
) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log(`🚀 Making ${method} request to:`, url);
    console.log("👤 Current user type:", currentUserType);

    // Log the request data for debugging
    if (data) {
      console.log("📤 Request payload:", JSON.stringify(data, null, 2));
    }

    const headers = getAuthHeaders(currentUserType);
    console.log("📤 Request headers (sanitized):", {
      ...headers,
      Authorization: headers.Authorization
        ? `Bearer ${headers.Authorization.substring(7, 20)}...`
        : "None",
    });

    const config = {
      method,
      headers,
      url,
      ...(data && { data }),
      timeout: 30000, // 30 seconds timeout
      validateStatus: (status) => {
        // Accept status codes 200-299, but also let 400+ through for better error handling
        return status < 500;
      },
    };

    const response = await axios(config);

    console.log("✅ API Response status:", response.status);
    console.log("✅ API Response headers:", response.headers);

    // Handle different response status codes
    if (response.status >= 200 && response.status < 300) {
      console.log("✅ API Response data:", response.data);
      return response.data;
    } else {
      // Handle 400, 401, etc. as errors but with response data
      console.error("❌ API Error Response:", response.data);
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = response;
      throw error;
    }
  } catch (error) {
    console.error("❌ API Request failed:", error);

    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response;
      console.error("❌ API Error response:", {
        status,
        data,
        url,
        method,
        requestData: data,
      });

      // Create a more descriptive error
      const enhancedError = new Error();
      enhancedError.response = error.response;
      enhancedError.message =
        data?.message || `Request failed with status ${status}`;

      throw enhancedError;
    } else if (error.request) {
      console.error("❌ Network error - no response received:", error.request);
      throw new Error(
        "Network error. Please check your internet connection and try again."
      );
    } else {
      console.error("❌ Request setup error:", error.message);
      throw new Error(
        error.message ||
        "An unexpected error occurred while making the request."
      );
    }
  }
};

// ============================================================================
// BUS BOOKING FUNCTIONS
// ============================================================================

// ✅ Fetch real-time booking status for BUS bookings
export const fetchRealTimeStatus = async (booking, userType = null) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log("🔄 Fetching real-time status for bus booking:", booking);

    // Extract booking details with better validation
    const bookingId =
      booking?.bookingId || booking?.BookingId || booking?.booking_id;
    const searchTokenId =
      booking?.searchTokenId || booking?.SearchTokenId || booking?.token_id;
    const pnr = booking?.pnr || booking?.PNR || booking?.TravelOperatorPNR;
    const ticketNo =
      booking?.ticketNo || booking?.TicketNo || booking?.ticketNumber;

    // Validate required fields
    if (!bookingId) {
      throw new Error("BookingId is required for real-time status check");
    }

    // Prepare request data with all available fields
    const requestData = {
      BookingId: String(bookingId), // Use capital B as per API requirement
      ...(searchTokenId && { SearchTokenId: String(searchTokenId) }),
      ...(pnr && { PNR: String(pnr) }),
      ...(ticketNo && { TicketNo: String(ticketNo) }),
      UserType: currentUserType || "customer",
    };

    console.log("📤 Bus real-time status request data:", requestData);

    const response = await makeAuthenticatedRequest(
      BusBookingServices.realTimeStatus,
      "POST",
      requestData,
      currentUserType
    );

    console.log("✅ Bus real-time status response:", response);

    // Extract status from response with multiple fallbacks
    let status = "Unknown";
    if (response) {
      status =
        response.status ||
        response.Status ||
        response.bookingStatus ||
        response.BookingStatus ||
        response.realTimeStatus ||
        response.data?.status ||
        response.result?.status ||
        "Unknown";
    }

    return {
      success: true,
      status: status,
      data: response,
      lastUpdated: new Date(),
      bookingId: bookingId,
      serviceType: "bus",
    };
  } catch (error) {
    console.error("❌ Error fetching bus real-time status:", error);

    let errorMessage = "Failed to fetch status";
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        errorMessage = "Authentication failed";
      } else if (status === 404) {
        errorMessage = "Booking not found";
      } else if (status === 400) {
        errorMessage = "Invalid booking data";
      }
    } else if (error.request) {
      errorMessage = "Network error";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      status: "Error",
      error: errorMessage,
      lastUpdated: new Date(),
      bookingId: booking?.bookingId || "Unknown",
      serviceType: "bus",
    };
  }
};

// ✅ Fetch real-time status for multiple BUS bookings - WITH RATE LIMITING TO PREVENT CONTINUOUS CALLS
export const fetchMultipleRealTimeStatus = async (
  bookings,
  userType = null,
  options = {}
) => {
  console.log(
    `🔄 Fetching real-time status for ${bookings.length} bus bookings`
  );

  const {
    batchSize = 3, // Reduced batch size to prevent server overload
    batchDelay = 2000, // Increased delay between batches
    maxRetries = 1, // Reduced retries to prevent continuous calls
    enableRateLimit = true,
  } = options;

  const results = {};
  let processedCount = 0;

  // Process bookings in smaller batches with longer delays
  for (let i = 0; i < bookings.length; i += batchSize) {
    const batch = bookings.slice(i, i + batchSize);

    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        bookings.length / batchSize
      )}`
    );

    const batchPromises = batch.map(async (booking) => {
      let attempts = 0;
      while (attempts <= maxRetries) {
        try {
          const result = await fetchRealTimeStatus(booking, userType);
          processedCount++;
          return { bookingId: result.bookingId, result };
        } catch (error) {
          attempts++;
          if (attempts > maxRetries) {
            console.warn(
              `⚠️ Failed to fetch status for bus booking after ${maxRetries} retries:`,
              booking.bookingId
            );
            return {
              bookingId: booking.bookingId,
              result: {
                success: false,
                status: "Error",
                error: "Failed to fetch after retries",
                lastUpdated: new Date(),
                bookingId: booking.bookingId,
                serviceType: "bus",
              },
            };
          }
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    // Process batch results
    batchResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        const { bookingId, result: bookingResult } = result.value;
        results[bookingId] = bookingResult;
      } else {
        const booking = batch[index];
        results[booking.bookingId] = {
          success: false,
          status: "Error",
          error: "Batch processing failed",
          lastUpdated: new Date(),
          bookingId: booking.bookingId,
          serviceType: "bus",
        };
      }
    });

    // Add delay between batches to prevent continuous API calls
    if (i + batchSize < bookings.length && enableRateLimit) {
      console.log(`⏳ Waiting ${batchDelay}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, batchDelay));
    }
  }

  console.log(
    `✅ Completed bus real-time status fetch for ${Object.keys(results).length
    } bookings`
  );
  return results;
};

// ✅ Fetch upcoming BUS bookings with improved pagination
export const fetchUpcomingBookings = async (
  userType = null,
  page = 1,
  limit = 10
) => {
  try {
    const currentUserType = userType || detectUserType();
    const endpoints = getBookingEndpoints(currentUserType, "bus");

    console.log(
      "🚀 Fetching upcoming bus bookings for:",
      currentUserType,
      `Page: ${page}, Limit: ${limit}`
    );

    // Add pagination parameters to the request
    const url = `${endpoints.upcomingBookings}?page=${page}&limit=${limit}`;

    const response = await makeAuthenticatedRequest(
      url,
      "GET",
      null,
      currentUserType
    );

    return {
      success: true,
      data: response.data || response, // Handle both response.data and direct response
      pagination: {
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages:
          response.totalPages || Math.ceil((response.total || 0) / limit),
      },
      message: `Upcoming bus bookings fetched successfully for ${currentUserType}`,
    };
  } catch (error) {
    console.error("❌ Error fetching upcoming bus bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch upcoming bus bookings",
      error: error,
    };
  }
};

// ✅ Fetch all BUS bookings with improved pagination
export const fetchAllBookings = async (
  userType = null,
  page = 1,
  limit = 10
) => {
  try {
    const currentUserType = userType || detectUserType();
    const endpoints = getBookingEndpoints(currentUserType, "bus");

    console.log(
      "🚀 Fetching all bus bookings for:",
      currentUserType,
      `Page: ${page}, Limit: ${limit}`
    );

    // Add pagination parameters to the request
    const url = `${endpoints.allBookings}?page=${page}&limit=${limit}`;

    const response = await makeAuthenticatedRequest(
      url,
      "GET",
      null,
      currentUserType
    );

    return {
      success: true,
      data: response.data || response, // Handle both response.data and direct response
      pagination: {
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages:
          response.totalPages || Math.ceil((response.total || 0) / limit),
      },
      message: `All bus bookings fetched successfully for ${currentUserType}`,
    };
  } catch (error) {
    console.error("❌ Error fetching all bus bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch all bus bookings",
      error: error,
    };
  }
};

// ✅ Fetch all bookings from all pages with rate limiting
export const fetchAllBookingsComplete = async (
  userType = null,
  limit = 50,
  options = {}
) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log("🚀 Fetching complete bus bookings for:", currentUserType);

    const {
      maxPages = 10, // Limit maximum pages to prevent infinite calls
      pageDelay = 1000, // Delay between page requests
    } = options;

    // First, get the first page to know total pages
    const firstPageResponse = await fetchAllBookings(currentUserType, 1, limit);

    if (!firstPageResponse.success) {
      throw new Error(firstPageResponse.message);
    }

    const { pagination } = firstPageResponse;
    let allBookings = firstPageResponse.data || [];

    // Limit the number of pages to prevent excessive API calls
    const actualTotalPages = Math.min(pagination.totalPages, maxPages);

    // If there are more pages, fetch them with rate limiting
    if (actualTotalPages > 1) {
      for (let page = 2; page <= actualTotalPages; page++) {
        try {
          console.log(`📄 Fetching page ${page} of ${actualTotalPages}...`);

          const pageResponse = await fetchAllBookings(
            currentUserType,
            page,
            limit
          );
          if (pageResponse.success && pageResponse.data) {
            allBookings = [...allBookings, ...pageResponse.data];
          }

          // Add delay between page requests
          if (page < actualTotalPages) {
            await new Promise((resolve) => setTimeout(resolve, pageDelay));
          }
        } catch (error) {
          console.warn(
            `⚠️ Page ${page} failed to load, continuing with partial data`
          );
          break;
        }
      }
    }

    return {
      success: true,
      data: allBookings,
      pagination: {
        page: 1,
        limit: allBookings.length,
        total: pagination.total,
        totalPages: 1, // Since we're returning all data in one response
        fetchedPages: Math.min(actualTotalPages, maxPages),
      },
      message: `Complete bus bookings fetched successfully for ${currentUserType}`,
    };
  } catch (error) {
    console.error("❌ Error fetching complete bus bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch complete bus bookings",
      error: error,
    };
  }
};

// ============================================================================
// HOTEL BOOKING FUNCTIONS
// ============================================================================

// ✅ Fetch real-time booking status for HOTEL bookings
export const fetchHotelRealTimeStatus = async (booking, userType = null) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log("🔄 Fetching real-time status for hotel booking:", booking);

    // Extract hotel booking details with enhanced validation
    const bookingId =
      booking?.bookingId || booking?.BookingId || booking?.booking_id;
    const searchTokenId =
      booking?.searchTokenId || booking?.SearchTokenId || booking?.token_id;
    const confirmationNo =
      booking?.confirmationNo ||
      booking?.ConfirmationNo ||
      booking?.confirmationNumber;
    const hotelCode =
      booking?.hotelCode || booking?.HotelCode || booking?.hotel_code;
    const checkInDate =
      booking?.checkInDate || booking?.CheckInDate || booking?.check_in_date;
    const checkOutDate =
      booking?.checkOutDate || booking?.CheckOutDate || booking?.check_out_date;

    // Validate required fields
    if (!bookingId) {
      throw new Error("BookingId is required for hotel real-time status check");
    }

    // Prepare request data with all available fields for hotel
    const requestData = {
      BookingId: String(bookingId), // Use capital B as per API requirement
      ...(searchTokenId && { SearchTokenId: String(searchTokenId) }),
      ...(confirmationNo && { ConfirmationNo: String(confirmationNo) }),
      ...(hotelCode && { HotelCode: String(hotelCode) }),
      ...(checkInDate && { CheckInDate: String(checkInDate) }),
      ...(checkOutDate && { CheckOutDate: String(checkOutDate) }),
      UserType: currentUserType || "customer",
      ServiceType: "hotel", // Add service type identifier
    };

    console.log("📤 Hotel real-time status request data:", requestData);

    const response = await makeAuthenticatedRequest(
      HotelBookingServices.realTimeStatus,
      "POST",
      requestData,
      currentUserType
    );

    console.log("✅ Hotel real-time status response:", response);

    // Extract status from response with multiple fallbacks for hotel
    let status = "Unknown";
    if (response) {
      status =
        response.status ||
        response.Status ||
        response.bookingStatus ||
        response.BookingStatus ||
        response.hotelStatus ||
        response.HotelStatus ||
        response.realTimeStatus ||
        response.data?.status ||
        response.result?.status ||
        response.reservationStatus ||
        response.ReservationStatus ||
        "Unknown";
    }

    return {
      success: true,
      status: status,
      data: response,
      lastUpdated: new Date(),
      bookingId: bookingId,
      serviceType: "hotel",
    };
  } catch (error) {
    console.error("❌ Error fetching hotel real-time status:", error);

    let errorMessage = "Failed to fetch hotel status";
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        errorMessage = "Authentication failed";
      } else if (status === 404) {
        errorMessage = "Hotel booking not found";
      } else if (status === 400) {
        errorMessage = "Invalid hotel booking data";
      }
    } else if (error.request) {
      errorMessage = "Network error";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      status: "Error",
      error: errorMessage,
      lastUpdated: new Date(),
      bookingId: booking?.bookingId || "Unknown",
      serviceType: "hotel",
    };
  }
};

// ✅ Fetch real-time status for multiple HOTEL bookings with rate limiting
export const fetchMultipleHotelRealTimeStatus = async (
  bookings,
  userType = null,
  options = {}
) => {
  console.log(
    `🔄 Fetching real-time status for ${bookings.length} hotel bookings`
  );

  const {
    batchSize = 2, // Smaller batch size for hotel bookings
    batchDelay = 3000, // Longer delay for hotel bookings
    maxRetries = 1,
    enableRateLimit = true,
  } = options;

  const results = {};

  // Process hotel bookings in smaller batches with longer delays
  for (let i = 0; i < bookings.length; i += batchSize) {
    const batch = bookings.slice(i, i + batchSize);

    console.log(
      `Processing hotel batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        bookings.length / batchSize
      )}`
    );

    const batchPromises = batch.map(async (booking) => {
      try {
        const result = await fetchHotelRealTimeStatus(booking, userType);
        return { bookingId: result.bookingId, result };
      } catch (error) {
        console.warn(
          "⚠️ Failed to fetch status for hotel booking:",
          booking.bookingId
        );
        return {
          bookingId: booking.bookingId,
          result: {
            success: false,
            status: "Error",
            error: "Failed to fetch",
            lastUpdated: new Date(),
            bookingId: booking.bookingId,
            serviceType: "hotel",
          },
        };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    // Process results
    batchResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        const { bookingId, result: bookingResult } = result.value;
        results[bookingId] = bookingResult;
      } else {
        const booking = batch[index];
        results[booking.bookingId] = {
          success: false,
          status: "Error",
          error: "Batch processing failed",
          lastUpdated: new Date(),
          bookingId: booking.bookingId,
          serviceType: "hotel",
        };
      }
    });

    // Add longer delay between batches for hotel bookings
    if (i + batchSize < bookings.length && enableRateLimit) {
      console.log(`⏳ Waiting ${batchDelay}ms before next hotel batch...`);
      await new Promise((resolve) => setTimeout(resolve, batchDelay));
    }
  }

  console.log(
    `✅ Completed hotel real-time status fetch for ${Object.keys(results).length
    } bookings`
  );
  return results;
};

// ✅ Fetch upcoming HOTEL bookings with rate limiting
export const fetchUpcomingHotelBookings = async (
  userType = null,
  options = {}
) => {
  try {
    const currentUserType = userType || detectUserType();
    const endpoints = getBookingEndpoints(currentUserType, "hotel");

    console.log("🚀 Fetching upcoming hotel bookings for:", currentUserType);

    const { maxPages = 10, pageSize = 50, pageDelay = 1000 } = options;

    let allBookings = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      try {
        console.log(`📄 Fetching hotel page ${currentPage}...`);

        const response = await makeAuthenticatedRequest(
          `${endpoints.upcomingBookings}?page=${currentPage}&limit=${pageSize}`,
          "GET",
          null,
          currentUserType
        );

        console.log(`📄 Page ${currentPage} response:`, response);

        // Extract data and pagination info
        let pageData = [];
        if (response.data && Array.isArray(response.data)) {
          pageData = response.data;
        } else if (Array.isArray(response)) {
          pageData = response;
        } else if (response.bookings && Array.isArray(response.bookings)) {
          pageData = response.bookings;
        } else if (response.results && Array.isArray(response.results)) {
          pageData = response.results;
        }

        // Add page data to all bookings
        allBookings = [...allBookings, ...pageData];

        // Update pagination info
        totalPages = Math.min(
          response.totalPages ||
          response.total_pages ||
          Math.ceil((response.total || 0) / (response.limit || pageSize)),
          maxPages
        );

        console.log(
          `✅ Page ${currentPage}: Found ${pageData.length} bookings, Total pages: ${totalPages}`
        );

        currentPage++;

        // Add delay between requests
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, pageDelay));
        }
      } catch (pageError) {
        console.warn(`⚠️ Error fetching hotel page ${currentPage}:`, pageError);
        break;
      }
    } while (currentPage <= totalPages);

    console.log(
      `🎉 Total upcoming hotel bookings fetched: ${allBookings.length}`
    );

    return {
      success: true,
      data: allBookings,
      totalBookings: allBookings.length,
      totalPages: totalPages,
      message: `${allBookings.length} upcoming hotel bookings fetched successfully for ${currentUserType}`,
    };
  } catch (error) {
    console.error("❌ Error fetching upcoming hotel bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch upcoming hotel bookings",
      error: error,
    };
  }
};

// ✅ Fetch all HOTEL bookings with rate limiting
export const fetchAllHotelBookings = async (userType = null, options = {}) => {
  try {
    const currentUserType = userType || detectUserType();
    const endpoints = getBookingEndpoints(currentUserType, "hotel");

    console.log("🚀 Fetching all hotel bookings for:", currentUserType);

    const { maxPages = 10, pageSize = 50, pageDelay = 1000 } = options;

    let allBookings = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      try {
        console.log(`📄 Fetching hotel page ${currentPage}...`);

        const response = await makeAuthenticatedRequest(
          `${endpoints.allBookings}?page=${currentPage}&limit=${pageSize}`,
          "GET",
          null,
          currentUserType
        );

        console.log(`📄 Page ${currentPage} response:`, response);

        // Extract data and pagination info from API response
        let pageData = [];
        if (response.data && Array.isArray(response.data)) {
          pageData = response.data;
        } else if (Array.isArray(response)) {
          pageData = response;
        } else if (response.bookings && Array.isArray(response.bookings)) {
          pageData = response.bookings;
        } else if (response.results && Array.isArray(response.results)) {
          pageData = response.results;
        }

        // Add page data to all bookings
        allBookings = [...allBookings, ...pageData];

        // Extract pagination info from response
        totalPages = Math.min(
          response.totalPages ||
          response.total_pages ||
          Math.ceil((response.total || 0) / (response.limit || pageSize)),
          maxPages
        );
        const hasMorePages =
          response.hasNextPage ||
          response.has_next_page ||
          currentPage < totalPages;

        console.log(
          `✅ Page ${currentPage}: Found ${pageData.length} bookings, Total pages: ${totalPages}, Has more: ${hasMorePages}`
        );

        currentPage++;

        // Add delay between page requests
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, pageDelay));
        }
      } catch (pageError) {
        console.warn(`⚠️ Error fetching hotel page ${currentPage}:`, pageError);
        break;
      }
    } while (currentPage <= totalPages);

    console.log(`🎉 Total hotel bookings fetched: ${allBookings.length}`);

    return {
      success: true,
      data: allBookings,
      totalBookings: allBookings.length,
      totalPages: totalPages,
      message: `${allBookings.length} hotel bookings fetched successfully for ${currentUserType}`,
    };
  } catch (error) {
    console.error("❌ Error fetching all hotel bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch all hotel bookings",
      error: error,
    };
  }
};

// Alternative function that fetches specific page with pagination info
export const fetchHotelBookingsWithPagination = async (
  page = 1,
  limit = 50,
  userType = null
) => {
  try {
    const currentUserType = userType || detectUserType();
    const endpoints = getBookingEndpoints(currentUserType, "hotel");

    console.log(
      `🚀 Fetching hotel bookings page ${page} (limit: ${limit}) for:`,
      currentUserType
    );

    const response = await makeAuthenticatedRequest(
      `${endpoints.allBookings}?page=${page}&limit=${limit}`,
      "GET",
      null,
      currentUserType
    );

    console.log("📄 Paginated response:", response);

    // Extract data from response
    let bookings = [];
    if (response.data && Array.isArray(response.data)) {
      bookings = response.data;
    } else if (Array.isArray(response)) {
      bookings = response;
    } else if (response.bookings && Array.isArray(response.bookings)) {
      bookings = response.bookings;
    } else if (response.results && Array.isArray(response.results)) {
      bookings = response.results;
    }

    return {
      success: true,
      data: bookings,
      pagination: {
        currentPage: response.page || page,
        totalPages: response.totalPages || response.total_pages || 1,
        totalItems: response.total || bookings.length,
        limit: response.limit || limit,
        hasNextPage: response.hasNextPage || response.has_next_page || false,
        hasPrevPage: response.hasPrevPage || response.has_prev_page || false,
      },
      message: `Page ${page} of hotel bookings fetched successfully`,
    };
  } catch (error) {
    console.error("❌ Error fetching paginated hotel bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch hotel bookings",
      error: error,
    };
  }
};

// ============================================================================
// FLIGHT BOOKING FUNCTIONS - WITH IMPROVED RATE LIMITING
// ============================================================================

// ✅ Helper function to fetch all pages of data with rate limiting
const fetchAllPagesData = async (endpoint, userType, options = {}) => {
  const { maxPages = 10, pageSize = 50, pageDelay = 1500 } = options;

  let allData = [];
  let currentPage = 1;
  let totalPages = 1;

  console.log(`📄 Starting paginated fetch for endpoint: ${endpoint}`);

  try {
    do {
      console.log(`📄 Fetching page ${currentPage} of ${totalPages}`);

      // Add pagination parameters to the request
      const paginatedEndpoint = `${endpoint}?page=${currentPage}&limit=${pageSize}`;

      const response = await makeAuthenticatedRequest(
        paginatedEndpoint,
        "GET",
        null,
        userType
      );

      console.log(`✅ Page ${currentPage} response:`, response);

      if (response) {
        // Handle different response structures
        let pageData = [];

        if (response.data && Array.isArray(response.data)) {
          pageData = response.data;
        } else if (Array.isArray(response)) {
          pageData = response;
        } else if (response.result && Array.isArray(response.result)) {
          pageData = response.result;
        }

        allData.push(...pageData);

        // Update pagination info
        totalPages = Math.min(
          response.totalPages || response.total_pages || 1,
          maxPages
        );
        currentPage++;

        console.log(
          `📊 Page ${currentPage - 1}: Got ${pageData.length
          } bookings, Total so far: ${allData.length}`
        );

        // Add delay between page requests
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, pageDelay));
        }
      } else {
        console.warn(`⚠️ No data received for page ${currentPage}`);
        break;
      }
    } while (currentPage <= totalPages);

    console.log(
      `✅ Pagination complete: Fetched ${allData.length} total bookings from ${currentPage - 1
      } pages`
    );

    return {
      success: true,
      data: {
        data: allData,
        total: allData.length,
        totalPages: totalPages,
        fetchedPages: currentPage - 1,
      },
      message: `Successfully fetched all ${allData.length} bookings`,
    };
  } catch (error) {
    console.error(`❌ Error during paginated fetch:`, error);

    // Return partial data if we got some
    if (allData.length > 0) {
      return {
        success: true,
        data: {
          data: allData,
          total: allData.length,
          partial: true,
          error: error.message,
        },
        message: `Partial fetch completed: ${allData.length} bookings (some pages failed)`,
      };
    }

    throw error;
  }
};

// ✅ Fetch upcoming FLIGHT bookings
export const fetchUpcomingFlightBookings = async (
  userType = null,
  options = {}
) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log("🚀 Fetching upcoming flight bookings for:", currentUserType);

    const baseEndpoint = FlightBookingServices.upcomingBookings;

    const result = await fetchAllPagesData(
      baseEndpoint,
      currentUserType,
      options
    );

    console.log("✅ All upcoming flight bookings fetched:", result);

    return {
      success: true,
      data: result.data,
      message: `${result.message} for ${currentUserType}`,
    };
  } catch (error) {
    console.error("❌ Error fetching upcoming flight bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch upcoming flight bookings",
      error: error,
    };
  }
};

// ✅ Fetch all FLIGHT bookings
export const fetchAllFlightBookings = async (userType = null, options = {}) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log("🚀 Fetching all flight bookings for:", currentUserType);

    const baseEndpoint = FlightBookingServices.allBookings;

    const result = await fetchAllPagesData(
      baseEndpoint,
      currentUserType,
      options
    );

    console.log("✅ All flight bookings fetched:", result);

    return {
      success: true,
      data: result.data,
      message: `${result.message} for ${currentUserType}`,
    };
  } catch (error) {
    console.error("❌ Error fetching all flight bookings:", error.message);
    throw {
      success: false,
      message: error.message || "Failed to fetch all flight bookings",
      error: error,
    };
  }
};

// ✅ Alternative approach - Single request with high limit
export const fetchAllFlightBookingsHighLimit = async (userType = null) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log(
      "🚀 Fetching all flight bookings with high limit for:",
      currentUserType
    );

    const baseEndpoint = FlightBookingServices.allBookings;

    // Try to fetch all data in one request with a very high limit
    const endpoint = `${baseEndpoint}?page=1&limit=1000`;

    const response = await makeAuthenticatedRequest(
      endpoint,
      "GET",
      null,
      currentUserType
    );

    console.log("✅ High limit flight bookings response:", response);

    return {
      success: true,
      data: response,
      message: `All flight bookings fetched successfully for ${currentUserType}`,
    };
  } catch (error) {
    console.error(
      "❌ Error fetching flight bookings with high limit:",
      error.message
    );
    // Fallback to paginated approach
    console.log("🔄 Falling back to paginated approach...");
    return await fetchAllFlightBookings(userType);
  }
};

// ✅ Enhanced data transformation to handle the nested structure better
export const transformBookingDataEnhanced = (apiBookings) => {
  if (!Array.isArray(apiBookings)) {
    console.log("⚠️ API bookings is not an array:", apiBookings);
    return [];
  }

  console.log(`🔄 Transforming ${apiBookings.length} flight bookings`);

  return apiBookings.map((booking, index) => {
    try {
      const result = booking.Result || {};
      const segments = result.Segments?.[0] || [];
      const firstSegment = segments[0] || {};
      const lastSegment = segments[segments.length - 1] || {};
      const passenger = result.Passenger?.[0] || {};

      // Enhanced error handling for missing data
      if (!result.BookingId && !booking.bookingId) {
        console.warn(`⚠️ Booking ${index} missing BookingId:`, booking);
      }

      const transformedBooking = {
        // Primary identifiers
        bookingId: result.BookingId || booking.bookingId || `temp-${index}`,
        pnr: result.PNR || "N/A",

        // Airline information
        airline: firstSegment.Airline,
        airlineName: firstSegment.Airline?.AirlineName || "Unknown Airline",
        flightNumber: firstSegment.Airline?.FlightNumber || "N/A",
        airlineCode: firstSegment.Airline?.AirlineCode || "N/A",

        // Route information
        origin: firstSegment.Origin,
        destination: lastSegment.Destination || firstSegment.Destination,
        from: firstSegment.Origin?.AirportCode || "N/A",
        to:
          (lastSegment.Destination || firstSegment.Destination)?.AirportCode ||
          "N/A",
        fromCity: firstSegment.Origin?.CityName || "Unknown",
        toCity:
          (lastSegment.Destination || firstSegment.Destination)?.CityName ||
          "Unknown",

        // Time information
        departureTime: firstSegment.Origin?.DepartTime,
        arrivalTime: (lastSegment.Destination || firstSegment.Destination)
          ?.ArrivalTime,

        // Booking details
        cabinClass: firstSegment.CabinClass || "Economy",
        class: firstSegment.CabinClass || "Economy",
        passengers: result.Passenger || [],
        totalPassengers: result.Passenger?.length || 1,

        // Financial information
        totalAmount: result.InvoiceAmount || result.Fare?.PublishedPrice || 0,
        amount: result.InvoiceAmount || result.Fare?.PublishedPrice || 0,

        // Status information
        status:
          result.CancelStatus === "none"
            ? "Confirmed"
            : result.CancelStatus || "Confirmed",
        bookingStatus:
          result.CancelStatus === "none"
            ? "Confirmed"
            : result.CancelStatus || "Confirmed",
        paymentStatus: "Completed",

        // Dates
        bookingDate: booking.createdAt || booking.updatedAt,
        createdAt: booking.createdAt || booking.updatedAt,

        // Additional information
        confirmationNo: result.PNR || "N/A",
        journeyType: result.JourneyType || 1,
        isDomestic: result.IsDomestic !== false, // Default to true if not specified
        fareType: result.FareType || "PUBLISHED",
        segments: result.Segments || [],
        invoiceNo: result.InvoiceNo || "N/A",
        invoiceAmount: result.InvoiceAmount || 0,

        // For invoice download
        bookingIdForInvoice: booking.bookingId || result.BookingId,
        UserIpForInvoice: booking.UserIp,
        SearchTokenIdForInvoice: booking.SearchTokenId,
        passengerEmailForInvoice: passenger.Email,

        // Raw data for debugging
        _rawBooking: booking,
        _rawResult: result,
      };

      return transformedBooking;
    } catch (error) {
      console.error(`❌ Error transforming booking ${index}:`, error, booking);

      // Return a minimal booking object to prevent crashes
      return {
        bookingId:
          booking.bookingId || booking.Result?.BookingId || `error-${index}`,
        pnr: booking.Result?.PNR || "Error",
        airlineName: "Error Loading",
        flightNumber: "N/A",
        from: "N/A",
        to: "N/A",
        fromCity: "Error",
        toCity: "Error",
        departureTime: null,
        arrivalTime: null,
        totalAmount: 0,
        status: "Error",
        bookingDate: booking.createdAt,
        _error: error.message,
        _rawBooking: booking,
      };
    }
  });
};

// ✅ Debug function to check API response structure
export const debugFlightBookingsAPI = async (userType = null) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log("🔍 Debugging flight bookings API structure...");

    const allBookingsEndpoint = FlightBookingServices.allBookings;

    // Try different approaches
    const results = {
      approach1: null,
      approach2: null,
      approach3: null,
      recommendations: [],
    };

    // Approach 1: Default request
    try {
      console.log("🧪 Testing approach 1: Default request");
      results.approach1 = await makeAuthenticatedRequest(
        allBookingsEndpoint,
        "GET",
        null,
        currentUserType
      );
    } catch (error) {
      results.approach1 = { error: error.message };
    }

    // Approach 2: With pagination parameters
    try {
      console.log("🧪 Testing approach 2: With pagination");
      const paginatedEndpoint = `${allBookingsEndpoint}?page=1&limit=50`;
      results.approach2 = await makeAuthenticatedRequest(
        paginatedEndpoint,
        "GET",
        null,
        currentUserType
      );
    } catch (error) {
      results.approach2 = { error: error.message };
    }

    // Approach 3: High limit
    try {
      console.log("🧪 Testing approach 3: High limit");
      const highLimitEndpoint = `${allBookingsEndpoint}?limit=1000`;
      results.approach3 = await makeAuthenticatedRequest(
        highLimitEndpoint,
        "GET",
        null,
        currentUserType
      );
    } catch (error) {
      results.approach3 = { error: error.message };
    }

    // Analyze results and provide recommendations
    Object.keys(results).forEach((approach) => {
      if (approach === "recommendations") return;

      const result = results[approach];
      if (result && !result.error) {
        console.log(`✅ ${approach} succeeded:`, {
          hasData: !!result.data,
          dataLength: result.data?.length || 0,
          totalPages: result.totalPages,
          total: result.total,
          structure: Object.keys(result),
        });

        if (result.totalPages > 1) {
          results.recommendations.push(
            `${approach}: Use pagination - ${result.totalPages} pages available`
          );
        } else {
          results.recommendations.push(`${approach}: Single page sufficient`);
        }
      } else {
        console.log(`❌ ${approach} failed:`, result?.error);
      }
    });

    return results;
  } catch (error) {
    console.error("❌ Debug function failed:", error);
    return { error: error.message };
  }
};

// ✅ Flight real-time status with rate limiting
export const fetchFlightRealTimeStatus = async (booking, userType = null) => {
  try {
    const currentUserType = userType || detectUserType();
    console.log("🛫 Fetching real-time status for flight booking:", booking);
    console.log("👤 User type:", currentUserType);

    // Enhanced booking details extraction with multiple fallback options
    const bookingId =
      booking?.bookingId ||
      booking?.BookingId ||
      booking?.booking_id ||
      booking?.id;

    const pnr =
      booking?.pnr ||
      booking?.PNR ||
      booking?.confirmationNo ||
      booking?.ConfirmationNo;

    const searchTokenId =
      booking?.searchTokenId ||
      booking?.SearchTokenId ||
      booking?.token_id ||
      booking?.tokenId;

    // Additional flight-specific fields that might help
    const flightNumber =
      booking?.flightNumber ||
      booking?.FlightNumber ||
      booking?.airline?.FlightNumber;

    const airlineCode =
      booking?.airlineCode ||
      booking?.AirlineCode ||
      booking?.airline?.AirlineCode;

    // Validate required fields
    if (!bookingId) {
      throw new Error(
        "BookingId is required for flight real-time status check"
      );
    }

    console.log("📋 Extracted booking details:", {
      BookingId: bookingId,
      PNR: pnr,
      SearchTokenId: searchTokenId,
      FlightNumber: flightNumber,
      AirlineCode: airlineCode,
    });

    // Enhanced request payload with all available booking information
    const requestData = {
      // Primary identifier (required)
      BookingId: String(bookingId),

      // Optional identifiers that might help locate the booking
      ...(pnr && { PNR: String(pnr) }),
      ...(searchTokenId && { SearchTokenId: String(searchTokenId) }),
      ...(flightNumber && { FlightNumber: String(flightNumber) }),
      ...(airlineCode && { AirlineCode: String(airlineCode) }),

      // User context
      UserType: currentUserType || "customer",
      ServiceType: "flight",

      // Additional context that might help
      ...(booking?.invoiceNo && { InvoiceNo: String(booking.invoiceNo) }),
      ...(booking?.journeyType && { JourneyType: booking.journeyType }),
      ...(booking?.isDomestic !== undefined && {
        IsDomestic: booking.isDomestic,
      }),
    };

    console.log("📤 Flight real-time status request payload:", requestData);

    // Make API call with enhanced error handling
    const response = await makeAuthenticatedRequest(
      FlightBookingServices.realTimeStatus,
      "POST",
      requestData,
      currentUserType
    );

    console.log("✅ Flight real-time status API response:", response);

    // Enhanced response processing
    let status = "Unknown";
    let isEmpty = false;

    if (response) {
      // Check if response is empty or null
      if (
        !response ||
        (typeof response === "object" && Object.keys(response).length === 0) ||
        response === null ||
        response === undefined
      ) {
        isEmpty = true;
        status = "No Data Available";
      } else {
        // Try multiple status field variations
        status =
          response.status ||
          response.Status ||
          response.bookingStatus ||
          response.BookingStatus ||
          response.flightStatus ||
          response.FlightStatus ||
          response.realTimeStatus ||
          response.RealTimeStatus ||
          response.data?.status ||
          response.result?.status ||
          response.cancelStatus ||
          response.CancelStatus ||
          (response.success ? "Confirmed" : "Unknown");
      }
    } else {
      isEmpty = true;
      status = "No Response";
    }

    return {
      success: true,
      status: status,
      data: response,
      isEmpty: isEmpty,
      lastUpdated: new Date(),
      bookingId: bookingId,
      serviceType: "flight",
      // Add debug information
      debugInfo: {
        requestPayload: requestData,
        responseReceived: !!response,
        responseKeys: response ? Object.keys(response) : [],
        userType: currentUserType,
        endpoint: FlightBookingServices.realTimeStatus,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching flight real-time status:", error);

    let errorMessage = "Failed to fetch flight status";
    let errorDetails = null;

    if (error.response) {
      const { status, data } = error.response;
      console.error("🔍 API Error Details:", {
        status,
        data,
        url: FlightBookingServices.realTimeStatus,
        headers: error.response.headers,
      });

      switch (status) {
        case 400:
          errorMessage =
            data?.message ||
            "Invalid request data. Please check booking details.";
          errorDetails = `Bad Request (400): ${data?.error || "Invalid booking parameters"
            }`;
          break;
        case 401:
          errorMessage = "Authentication failed. Please login again.";
          errorDetails = "Unauthorized (401): Check authentication token";
          break;
        case 404:
          if (data?.message?.includes("Booking not found in local DB")) {
            errorMessage =
              "Booking not found in local database for API credentials";
            errorDetails =
              "This booking exists but may not be synced to the real-time tracking system yet";
          } else {
            errorMessage = "Flight booking not found in the system.";
            errorDetails = "Not Found (404): Booking does not exist";
          }
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          errorDetails = "Internal Server Error (500): Backend service issue";
          break;
        default:
          errorMessage =
            data?.message || `Request failed with status ${status}`;
          errorDetails = `HTTP ${status}: ${data?.error || "Unknown error"}`;
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your internet connection.";
      errorDetails = "Network timeout or connection refused";
    } else if (error.message) {
      errorMessage = error.message;
      errorDetails = "Request setup error";
    }

    return {
      success: false,
      status: "Error",
      error: errorMessage,
      errorDetails: errorDetails,
      lastUpdated: new Date(),
      bookingId: booking?.bookingId || booking?.BookingId || "Unknown",
      serviceType: "flight",
      debugInfo: {
        errorType: error.response
          ? "API_ERROR"
          : error.request
            ? "NETWORK_ERROR"
            : "REQUEST_ERROR",
        httpStatus: error.response?.status,
        endpoint: FlightBookingServices.realTimeStatus,
        bookingData: {
          bookingId: booking?.bookingId,
          pnr: booking?.pnr,
          flightNumber: booking?.flightNumber,
        },
      },
    };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// ✅ Get user type (utility function for components)
export const getUserType = () => {
  return detectUserType();
};

// ✅ Check if user is authenticated for any booking service
export const isUserAuthenticated = (userType = null) => {
  try {
    const currentUserType = userType || detectUserType();
    const headers = getAuthHeaders(currentUserType);
    return !(!headers.Authorization || headers.Authorization === "Bearer null");
  } catch (error) {
    return false;
  }
};

// ✅ Aliases for consistency across all services
export const isHotelUserAuthenticated = (userType = null) => {
  return isUserAuthenticated(userType);
};

export const isFlightUserAuthenticated = (userType = null) => {
  return isUserAuthenticated(userType);
};

export const getHotelUserType = () => {
  return getUserType();
};

export const getFlightUserType = () => {
  return getUserType();
};

// ============================================================================
// GENERIC FUNCTIONS FOR ALL BOOKING TYPES
// ============================================================================

// ✅ Generic function to fetch upcoming bookings for any service type
export const fetchUpcomingBookingsByType = async (
  serviceType = "bus",
  userType = null,
  options = {}
) => {
  switch (serviceType.toLowerCase()) {
    case "hotel":
      return await fetchUpcomingHotelBookings(userType, options);
    case "flight":
      return await fetchUpcomingFlightBookings(userType, options);
    case "bus":
    default:
      return await fetchUpcomingBookings(userType, options.page, options.limit);
  }
};

// ✅ Generic function to fetch all bookings for any service type
export const fetchAllBookingsByType = async (
  serviceType = "bus",
  userType = null,
  options = {}
) => {
  switch (serviceType.toLowerCase()) {
    case "hotel":
      return await fetchAllHotelBookings(userType, options);
    case "flight":
      return await fetchAllFlightBookings(userType, options);
    case "bus":
    default:
      return await fetchAllBookingsComplete(userType, options.limit, options);
  }
};

// ✅ Generic function to fetch real-time status for any service type
export const fetchRealTimeStatusByType = async (
  booking,
  serviceType = "bus",
  userType = null
) => {
  switch (serviceType.toLowerCase()) {
    case "hotel":
      return await fetchHotelRealTimeStatus(booking, userType);
    case "flight":
      return await fetchFlightRealTimeStatus(booking, userType);
    case "bus":
    default:
      return await fetchRealTimeStatus(booking, userType);
  }
};

// ✅ Invoice services
export const flightInvoiceServices = async (data) => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  const url = `${baseURL}/${FlightInvoice.invoice}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body = {
    BookingId: data.bookingId,
    UserIp: data.userIp,
    SearchTokenId: data.searchTokenId,
    receiverEmail: data.receiverEmail,
  };
  console.log("body", body);

  try {
    const response = await axios.post(url, body, { headers });

    console.log("✅ Invoice download response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading invoice:", error.message);
    return {
      success: false,
      message: error.message || "Failed to download invoice",
      error,
    };
  }
};

export const busInvoiceServices = async (data) => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  const url = `${baseURL}/${BusInvoice.invoice}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body = {
    BookingId: data.bookingId,
    UserIp: data.userIp,
    SearchTokenId: data.searchTokenId,
    receiverEmail: data.receiverEmail,
  };
  console.log("body", body);

  try {
    const response = await axios.post(url, body, { headers });

    console.log("✅ Invoice download response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error downloading invoice:", error.message);
    return {
      success: false,
      message: error.message || "Failed to download invoice",
      error,
    };
  }
};

// ✅ Export service endpoints for external use if needed
export { BusBookingServices, HotelBookingServices, FlightBookingServices };
