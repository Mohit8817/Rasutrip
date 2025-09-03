import axios from "axios";
// Update this import path according to your project structure
import baseURL from "../../../Services/Config";

// ✅ Define bus booking service endpoints
const BusBookingServices = {
    // Customer endpoints
    customer: {
        upcomingBookings: `${baseURL}/busservice/up-comming-bookings`,
        allBookings: `${baseURL}/busservice/my-bookings`,
    },
    // Agent endpoints
    agent: {
        upcomingBookings: `${baseURL}/agent/bus-bookings/upcoming`,
        allBookings: `${baseURL}/agent/bus-bookings/all`,
        // Fallback to customer endpoints if agent endpoints don't exist
        upcomingFallback: `${baseURL}/busservice/up-comming-bookings`,
        allFallback: `${baseURL}/busservice/my-bookings`,
    },
    // Real-time status endpoint
    realTimeStatus: `${baseURL}/busservice/real-time-booking-details`
};

// ✅ Define hotel booking service endpoints
const HotelBookingServices = {
    // Customer endpoints
    customer: {
        upcomingBookings: `${baseURL}/hotelservice/up-comming-bookings`,
        allBookings: `${baseURL}/hotelservice/my-bookings`,
    },
    // Agent endpoints
    agent: {
        upcomingBookings: `${baseURL}/agent/hotel-bookings/upcoming`,
        allBookings: `${baseURL}/agent/hotel-bookings/all`,
        // Fallback to customer endpoints if agent endpoints don't exist
        upcomingFallback: `${baseURL}/hotelservice/up-comming-bookings`,
        allFallback: `${baseURL}/hotelservice/my-bookings`,
    },
    // Real-time status endpoint for hotels
    realTimeStatus: `${baseURL}/hotelservice/real-time-booking-details`
};

// ✅ Define flight booking service endpoints
const FlightBookingServices = {
    // Customer endpoints
    customer: {
        upcomingBookings: `${baseURL}/airservice/up-comming-bookings`,
        allBookings: `${baseURL}/airservice/booking-details`,
    },
    // Agent endpoints
    agent: {
        upcomingBookings: `${baseURL}/agent/flight-bookings/upcoming`,
        allBookings: `${baseURL}/agent/flight-bookings/all`,
        // Fallback to customer endpoints if agent endpoints don't exist
        upcomingFallback: `${baseURL}/airservice/up-comming-bookings`,
        allFallback: `${baseURL}/airservice/booking-details`,
    },
    // Real-time status endpoint for flights
    realTimeStatus: `${baseURL}/airservice/real-time-booking-details`
};

// ✅ Helper function to detect user type from multiple sources
const detectUserType = () => {
    console.log('🔍 Detecting user type...');

    // Method 1: Check localStorage for userType
    const storedUserType = localStorage.getItem('userType') || localStorage.getItem('user_type');
    console.log('💾 Stored user type:', storedUserType);

    // Method 2: Check token key patterns
    let detectedType = null;

    // Check for customer token patterns
    const customerTokenKeys = ['token', 'authToken', 'customer_token', 'customerToken'];
    const hasCustomerToken = customerTokenKeys.some(key => localStorage.getItem(key));

    // Check for agent token patterns
    const agentTokenKeys = ['agent_token', 'agentToken', 'agent_auth_token'];
    const hasAgentToken = agentTokenKeys.some(key => localStorage.getItem(key));

    console.log('🏪 Customer token found:', hasCustomerToken);
    console.log('🏢 Agent token found:', hasAgentToken);

    // Priority logic for user type detection
    if (storedUserType) {
        detectedType = storedUserType.toLowerCase();
    } else if (hasAgentToken && !hasCustomerToken) {
        detectedType = 'agent';
    } else if (hasCustomerToken && !hasAgentToken) {
        detectedType = 'customer';
    } else {
        // Default fallback - assume customer if we have any token
        const hasAnyToken = localStorage.getItem('token') || localStorage.getItem('authToken');
        detectedType = hasAnyToken ? 'customer' : null;
    }

    console.log('✅ Final detected user type:', detectedType);
    return detectedType;
};

// ✅ Helper function to get authentication headers with user type awareness
const getAuthHeaders = (userType = null) => {
    const currentUserType = userType || detectUserType();
    console.log('🔐 Getting auth headers for user type:', currentUserType);

    // Try different token keys based on user type
    let token = null;
    let tokenKey = null;

    const tokenKeys = currentUserType === 'agent'
        ? ['agent_token', 'agentToken', 'agent_auth_token', 'token', 'authToken'] // Agent token priority
        : ['token', 'authToken', 'customer_token', 'customerToken', 'accessToken']; // Customer token priority

    for (const key of tokenKeys) {
        const value = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (value) {
            token = value;
            tokenKey = key;
            break;
        }
    }

    console.log('🔐 Token found with key:', tokenKey);
    console.log('🔐 Token preview:', token ? `${token.substring(0, 15)}...` : 'None');

    if (!token) {
        console.error('❌ No authentication token found for user type:', currentUserType);
        throw new Error(`No authentication token found for ${currentUserType}. Please login again.`);
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Type': currentUserType || 'customer',
    };
};

// ✅ Helper function to get appropriate booking endpoints based on user type and service type
const getBookingEndpoints = (userType, serviceType = 'bus') => {
    console.log(`🎯 Getting ${serviceType} endpoints for user type:`, userType);

    if (serviceType === 'hotel') {
        if (userType === 'agent') {
            return HotelBookingServices.agent;
        } else {
            return HotelBookingServices.customer;
        }
    } else if (serviceType === 'flight') {
        if (userType === 'agent') {
            return FlightBookingServices.agent;
        } else {
            return FlightBookingServices.customer;
        }
    } else {
        // Default to bus service
        if (userType === 'agent') {
            return BusBookingServices.agent;
        } else {
            return BusBookingServices.customer;
        }
    }
};

// ✅ Generic API request function with user type awareness
const makeAuthenticatedRequest = async (url, method = 'GET', data = null, userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        console.log(`🚀 Making ${method} request to:`, url);
        console.log('👤 Current user type:', currentUserType);

        const headers = getAuthHeaders(currentUserType);
        console.log('📤 Request headers:', headers);

        const config = {
            method,
            headers,
            url,
            ...(data && { data })
        };

        const response = await axios(config);
        console.log('✅ API Response status:', response.status);
        console.log('✅ API Response data:', response.data);

        return response.data;

    } catch (error) {
        console.error('❌ API Request failed:', error);

        // Enhanced error handling
        if (error.response) {
            const { status, data } = error.response;
            console.error('❌ API Error response:', data);

            switch (status) {
                case 401:
                    throw new Error(`Authentication failed for ${userType || 'user'}. Please login again.`);
                case 403:
                    throw new Error(`Access denied. ${userType === 'agent' ? 'Agent' : 'Customer'} permissions required.`);
                case 404:
                    throw new Error('Booking service endpoint not found.');
                default:
                    throw new Error(data?.message || `Request failed with status ${status}`);
            }
        } else if (error.request) {
            throw new Error('Network error. Please check your internet connection.');
        } else {
            throw new Error(error.message || 'An unexpected error occurred.');
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
        console.log('🔄 Fetching real-time status for bus booking:', booking);

        // Extract booking details with better validation
        const bookingId = booking?.bookingId || booking?.BookingId || booking?.booking_id;
        const searchTokenId = booking?.searchTokenId || booking?.SearchTokenId || booking?.token_id;
        const pnr = booking?.pnr || booking?.PNR || booking?.TravelOperatorPNR;
        const ticketNo = booking?.ticketNo || booking?.TicketNo || booking?.ticketNumber;

        // Validate required fields
        if (!bookingId) {
            throw new Error('BookingId is required for real-time status check');
        }

        // Prepare request data with all available fields
        const requestData = {
            BookingId: String(bookingId), // Use capital B as per API requirement
            ...(searchTokenId && { SearchTokenId: String(searchTokenId) }),
            ...(pnr && { PNR: String(pnr) }),
            ...(ticketNo && { TicketNo: String(ticketNo) }),
            UserType: currentUserType || 'customer'
        };

        console.log('📤 Bus real-time status request data:', requestData);

        const response = await makeAuthenticatedRequest(
            BusBookingServices.realTimeStatus,
            'POST',
            requestData,
            currentUserType
        );

        console.log('✅ Bus real-time status response:', response);

        // Extract status from response with multiple fallbacks
        let status = 'Unknown';
        if (response) {
            status = response.status ||
                response.Status ||
                response.bookingStatus ||
                response.BookingStatus ||
                response.realTimeStatus ||
                response.data?.status ||
                response.result?.status ||
                'Unknown';
        }

        return {
            success: true,
            status: status,
            data: response,
            lastUpdated: new Date(),
            bookingId: bookingId,
            serviceType: 'bus'
        };

    } catch (error) {
        console.error('❌ Error fetching bus real-time status:', error);

        let errorMessage = 'Failed to fetch status';
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                errorMessage = 'Authentication failed';
            } else if (status === 404) {
                errorMessage = 'Booking not found';
            } else if (status === 400) {
                errorMessage = 'Invalid booking data';
            }
        } else if (error.request) {
            errorMessage = 'Network error';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            status: 'Error',
            error: errorMessage,
            lastUpdated: new Date(),
            bookingId: booking?.bookingId || 'Unknown',
            serviceType: 'bus'
        };
    }
};

// ✅ Fetch real-time status for multiple BUS bookings
export const fetchMultipleRealTimeStatus = async (bookings, userType = null) => {
    console.log(`🔄 Fetching real-time status for ${bookings.length} bus bookings`);

    const results = {};

    // Process bookings in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < bookings.length; i += batchSize) {
        const batch = bookings.slice(i, i + batchSize);

        const batchPromises = batch.map(async (booking) => {
            try {
                const result = await fetchRealTimeStatus(booking, userType);
                return { bookingId: result.bookingId, result };
            } catch (error) {
                console.warn('⚠️ Failed to fetch status for bus booking:', booking.bookingId);
                return {
                    bookingId: booking.bookingId,
                    result: {
                        success: false,
                        status: 'Error',
                        error: 'Failed to fetch',
                        lastUpdated: new Date(),
                        bookingId: booking.bookingId,
                        serviceType: 'bus'
                    }
                };
            }
        });

        const batchResults = await Promise.all(batchPromises);

        // Add results to the main results object
        batchResults.forEach(({ bookingId, result }) => {
            results[bookingId] = result;
        });

        // Add small delay between batches
        if (i + batchSize < bookings.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log(`✅ Completed bus real-time status fetch for ${Object.keys(results).length} bookings`);
    return results;
};

// ✅ Fetch upcoming BUS bookings with user type awareness
export const fetchUpcomingBookings = async (userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType, 'bus');

        console.log('🚀 Fetching upcoming bus bookings for:', currentUserType);

        try {
            const response = await makeAuthenticatedRequest(endpoints.upcomingBookings, 'GET', null, currentUserType);
            return {
                success: true,
                data: response,
                message: `Upcoming bus bookings fetched successfully for ${currentUserType}`
            };
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.upcomingFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                const fallbackResponse = await makeAuthenticatedRequest(endpoints.upcomingFallback, 'GET', null, currentUserType);
                return {
                    success: true,
                    data: fallbackResponse,
                    message: `Upcoming bus bookings fetched successfully for ${currentUserType} (fallback)`
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('❌ Error fetching upcoming bus bookings:', error.message);
        throw {
            success: false,
            message: error.message || "Failed to fetch upcoming bus bookings",
            error: error
        };
    }
};

// ✅ Fetch all BUS bookings with user type awareness
export const fetchAllBookings = async (userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType, 'bus');

        console.log('🚀 Fetching all bus bookings for:', currentUserType);

        try {
            const response = await makeAuthenticatedRequest(endpoints.allBookings, 'GET', null, currentUserType);
            return {
                success: true,
                data: response,
                message: `All bus bookings fetched successfully for ${currentUserType}`
            };
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.allFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                const fallbackResponse = await makeAuthenticatedRequest(endpoints.allFallback, 'GET', null, currentUserType);
                return {
                    success: true,
                    data: fallbackResponse,
                    message: `All bus bookings fetched successfully for ${currentUserType} (fallback)`
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('❌ Error fetching all bus bookings:', error.message);
        throw {
            success: false,
            message: error.message || "Failed to fetch all bus bookings",
            error: error
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
        console.log('🔄 Fetching real-time status for hotel booking:', booking);

        // Extract hotel booking details with enhanced validation
        const bookingId = booking?.bookingId || booking?.BookingId || booking?.booking_id;
        const searchTokenId = booking?.searchTokenId || booking?.SearchTokenId || booking?.token_id;
        const confirmationNo = booking?.confirmationNo || booking?.ConfirmationNo || booking?.confirmationNumber;
        const hotelCode = booking?.hotelCode || booking?.HotelCode || booking?.hotel_code;
        const checkInDate = booking?.checkInDate || booking?.CheckInDate || booking?.check_in_date;
        const checkOutDate = booking?.checkOutDate || booking?.CheckOutDate || booking?.check_out_date;

        // Validate required fields
        if (!bookingId) {
            throw new Error('BookingId is required for hotel real-time status check');
        }

        // Prepare request data with all available fields for hotel
        const requestData = {
            BookingId: String(bookingId), // Use capital B as per API requirement
            ...(searchTokenId && { SearchTokenId: String(searchTokenId) }),
            ...(confirmationNo && { ConfirmationNo: String(confirmationNo) }),
            ...(hotelCode && { HotelCode: String(hotelCode) }),
            ...(checkInDate && { CheckInDate: String(checkInDate) }),
            ...(checkOutDate && { CheckOutDate: String(checkOutDate) }),
            UserType: currentUserType || 'customer',
            ServiceType: 'hotel' // Add service type identifier
        };

        console.log('📤 Hotel real-time status request data:', requestData);

        const response = await makeAuthenticatedRequest(
            HotelBookingServices.realTimeStatus,
            'POST',
            requestData,
            currentUserType
        );

        console.log('✅ Hotel real-time status response:', response);

        // Extract status from response with multiple fallbacks for hotel
        let status = 'Unknown';
        if (response) {
            status = response.status ||
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
                'Unknown';
        }

        return {
            success: true,
            status: status,
            data: response,
            lastUpdated: new Date(),
            bookingId: bookingId,
            serviceType: 'hotel'
        };

    } catch (error) {
        console.error('❌ Error fetching hotel real-time status:', error);

        let errorMessage = 'Failed to fetch hotel status';
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                errorMessage = 'Authentication failed';
            } else if (status === 404) {
                errorMessage = 'Hotel booking not found';
            } else if (status === 400) {
                errorMessage = 'Invalid hotel booking data';
            }
        } else if (error.request) {
            errorMessage = 'Network error';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            status: 'Error',
            error: errorMessage,
            lastUpdated: new Date(),
            bookingId: booking?.bookingId || 'Unknown',
            serviceType: 'hotel'
        };
    }
};

// ✅ Fetch real-time status for multiple HOTEL bookings
export const fetchMultipleHotelRealTimeStatus = async (bookings, userType = null) => {
    console.log(`🔄 Fetching real-time status for ${bookings.length} hotel bookings`);

    const results = {};

    // Process hotel bookings in batches to avoid overwhelming the API
    const batchSize = 3; // Smaller batch size for hotel bookings as they might be more complex
    for (let i = 0; i < bookings.length; i += batchSize) {
        const batch = bookings.slice(i, i + batchSize);

        const batchPromises = batch.map(async (booking) => {
            try {
                const result = await fetchHotelRealTimeStatus(booking, userType);
                return { bookingId: result.bookingId, result };
            } catch (error) {
                console.warn('⚠️ Failed to fetch status for hotel booking:', booking.bookingId);
                return {
                    bookingId: booking.bookingId,
                    result: {
                        success: false,
                        status: 'Error',
                        error: 'Failed to fetch',
                        lastUpdated: new Date(),
                        bookingId: booking.bookingId,
                        serviceType: 'hotel'
                    }
                };
            }
        });

        const batchResults = await Promise.all(batchPromises);

        // Add results to the main results object
        batchResults.forEach(({ bookingId, result }) => {
            results[bookingId] = result;
        });

        // Add small delay between batches (longer for hotel bookings)
        if (i + batchSize < bookings.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`✅ Completed hotel real-time status fetch for ${Object.keys(results).length} bookings`);
    return results;
};

// ✅ Fetch upcoming HOTEL bookings with user type awareness
export const fetchUpcomingHotelBookings = async (userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType, 'hotel');

        console.log('🚀 Fetching upcoming hotel bookings for:', currentUserType);

        try {
            const response = await makeAuthenticatedRequest(endpoints.upcomingBookings, 'GET', null, currentUserType);
            return {
                success: true,
                data: response,
                message: `Upcoming hotel bookings fetched successfully for ${currentUserType}`
            };
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.upcomingFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                const fallbackResponse = await makeAuthenticatedRequest(endpoints.upcomingFallback, 'GET', null, currentUserType);
                return {
                    success: true,
                    data: fallbackResponse,
                    message: `Upcoming hotel bookings fetched successfully for ${currentUserType} (fallback)`
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('❌ Error fetching upcoming hotel bookings:', error.message);
        throw {
            success: false,
            message: error.message || "Failed to fetch upcoming hotel bookings",
            error: error
        };
    }
};

// ✅ Fetch all HOTEL bookings with user type awareness
export const fetchAllHotelBookings = async (userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType, 'hotel');

        console.log('🚀 Fetching all hotel bookings for:', currentUserType);

        try {
            const response = await makeAuthenticatedRequest(endpoints.allBookings, 'GET', null, currentUserType);
            return {
                success: true,
                data: response,
                message: `All hotel bookings fetched successfully for ${currentUserType}`
            };
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.allFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                const fallbackResponse = await makeAuthenticatedRequest(endpoints.allFallback, 'GET', null, currentUserType);
                return {
                    success: true,
                    data: fallbackResponse,
                    message: `All hotel bookings fetched successfully for ${currentUserType} (fallback)`
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('❌ Error fetching all hotel bookings:', error.message);
        throw {
            success: false,
            message: error.message || "Failed to fetch all hotel bookings",
            error: error
        };
    }
};

// ============================================================================
// FLIGHT BOOKING FUNCTIONS
// ============================================================================

// ✅ Fetch real-time booking status for FLIGHT bookings
export const fetchFlightRealTimeStatus = async (booking, userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        console.log('🔄 Fetching real-time status for flight booking:', booking);

        // Extract flight booking details with enhanced validation
        const bookingId = booking?.bookingId || booking?.BookingId || booking?.booking_id;
        const searchTokenId = booking?.searchTokenId || booking?.SearchTokenId || booking?.token_id;
        const pnr = booking?.pnr || booking?.PNR || booking?.confirmationNo;
        const flightNumber = booking?.flightNumber || booking?.FlightNumber || booking?.flight_number;
        const airlineCode = booking?.airlineCode || booking?.AirlineCode || booking?.airline_code;

        // Validate required fields
        if (!bookingId) {
            throw new Error('BookingId is required for flight real-time status check');
        }

        // Prepare request data with all available fields for flight
        const requestData = {
            BookingId: String(bookingId), // Use capital B as per API requirement
            ...(searchTokenId && { SearchTokenId: String(searchTokenId) }),
            ...(pnr && { PNR: String(pnr) }),
            ...(flightNumber && { FlightNumber: String(flightNumber) }),
            ...(airlineCode && { AirlineCode: String(airlineCode) }),
            UserType: currentUserType || 'customer',
            ServiceType: 'flight' // Add service type identifier
        };

        console.log('📤 Flight real-time status request data:', requestData);

        const response = await makeAuthenticatedRequest(
            FlightBookingServices.realTimeStatus,
            'POST',
            requestData,
            currentUserType
        );

        console.log('✅ Flight real-time status response:', response);

        // Extract status from response with multiple fallbacks for flight
        let status = 'Unknown';
        if (response) {
            status = response.status ||
                response.Status ||
                response.bookingStatus ||
                response.BookingStatus ||
                response.flightStatus ||
                response.FlightStatus ||
                response.realTimeStatus ||
                response.data?.status ||
                response.result?.status ||
                'Unknown';
        }

        return {
            success: true,
            status: status,
            data: response,
            lastUpdated: new Date(),
            bookingId: bookingId,
            serviceType: 'flight'
        };

    } catch (error) {
        console.error('❌ Error fetching flight real-time status:', error);

        let errorMessage = 'Failed to fetch flight status';
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                errorMessage = 'Authentication failed';
            } else if (status === 404) {
                errorMessage = 'Flight booking not found';
            } else if (status === 400) {
                errorMessage = 'Invalid flight booking data';
            }
        } else if (error.request) {
            errorMessage = 'Network error';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            status: 'Error',
            error: errorMessage,
            lastUpdated: new Date(),
            bookingId: booking?.bookingId || 'Unknown',
            serviceType: 'flight'
        };
    }
};

// ✅ Fetch real-time status for multiple FLIGHT bookings
export const fetchMultipleFlightRealTimeStatus = async (bookings, userType = null) => {
    console.log(`🔄 Fetching real-time status for ${bookings.length} flight bookings`);

    const results = {};

    // Process flight bookings in batches to avoid overwhelming the API
    const batchSize = 3; // Conservative batch size for flight bookings
    for (let i = 0; i < bookings.length; i += batchSize) {
        const batch = bookings.slice(i, i + batchSize);

        const batchPromises = batch.map(async (booking) => {
            try {
                const result = await fetchFlightRealTimeStatus(booking, userType);
                return { bookingId: result.bookingId, result };
            } catch (error) {
                console.warn('⚠️ Failed to fetch status for flight booking:', booking.bookingId);
                return {
                    bookingId: booking.bookingId,
                    result: {
                        success: false,
                        status: 'Error',
                        error: 'Failed to fetch',
                        lastUpdated: new Date(),
                        bookingId: booking.bookingId,
                        serviceType: 'flight'
                    }
                };
            }
        });

        const batchResults = await Promise.all(batchPromises);

        // Add results to the main results object
        batchResults.forEach(({ bookingId, result }) => {
            results[bookingId] = result;
        });

        // Add small delay between batches (longer for flight bookings)
        if (i + batchSize < bookings.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`✅ Completed flight real-time status fetch for ${Object.keys(results).length} bookings`);
    return results;
};

// ✅ Fetch upcoming FLIGHT bookings with user type awareness
export const fetchUpcomingFlightBookings = async (userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType, 'flight');

        console.log('🚀 Fetching upcoming flight bookings for:', currentUserType);

        try {
            const response = await makeAuthenticatedRequest(endpoints.upcomingBookings, 'GET', null, currentUserType);
            return {
                success: true,
                data: response,
                message: `Upcoming flight bookings fetched successfully for ${currentUserType}`
            };
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.upcomingFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                const fallbackResponse = await makeAuthenticatedRequest(endpoints.upcomingFallback, 'GET', null, currentUserType);
                return {
                    success: true,
                    data: fallbackResponse,
                    message: `Upcoming flight bookings fetched successfully for ${currentUserType} (fallback)`
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('❌ Error fetching upcoming flight bookings:', error.message);
        throw {
            success: false,
            message: error.message || "Failed to fetch upcoming flight bookings",
            error: error
        };
    }
};

// ✅ Fetch all FLIGHT bookings with user type awareness
export const fetchAllFlightBookings = async (userType = null) => {
    try {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType, 'flight');

        console.log('🚀 Fetching all flight bookings for:', currentUserType);

        try {
            const response = await makeAuthenticatedRequest(endpoints.allBookings, 'GET', null, currentUserType);
            return {
                success: true,
                data: response,
                message: `All flight bookings fetched successfully for ${currentUserType}`
            };
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.allFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                const fallbackResponse = await makeAuthenticatedRequest(endpoints.allFallback, 'GET', null, currentUserType);
                return {
                    success: true,
                    data: fallbackResponse,
                    message: `All flight bookings fetched successfully for ${currentUserType} (fallback)`
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('❌ Error fetching all flight bookings:', error.message);
        throw {
            success: false,
            message: error.message || "Failed to fetch all flight bookings",
            error: error
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
        return !(!headers.Authorization || headers.Authorization === 'Bearer null');
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
export const fetchUpcomingBookingsByType = async (serviceType = 'bus', userType = null) => {
    switch (serviceType.toLowerCase()) {
        case 'hotel':
            return await fetchUpcomingHotelBookings(userType);
        case 'flight':
            return await fetchUpcomingFlightBookings(userType);
        case 'bus':
        default:
            return await fetchUpcomingBookings(userType);
    }
};

// ✅ Generic function to fetch all bookings for any service type
export const fetchAllBookingsByType = async (serviceType = 'bus', userType = null) => {
    switch (serviceType.toLowerCase()) {
        case 'hotel':
            return await fetchAllHotelBookings(userType);
        case 'flight':
            return await fetchAllFlightBookings(userType);
        case 'bus':
        default:
            return await fetchAllBookings(userType);
    }
};

// ✅ Generic function to fetch real-time status for any service type
export const fetchRealTimeStatusByType = async (booking, serviceType = 'bus', userType = null) => {
    switch (serviceType.toLowerCase()) {
        case 'hotel':
            return await fetchHotelRealTimeStatus(booking, userType);
        case 'flight':
            return await fetchFlightRealTimeStatus(booking, userType);
        case 'bus':
        default:
            return await fetchRealTimeStatus(booking, userType);
    }
};

// ✅ Generic function to fetch multiple real-time statuses for any service type
export const fetchMultipleRealTimeStatusByType = async (bookings, serviceType = 'bus', userType = null) => {
    switch (serviceType.toLowerCase()) {
        case 'hotel':
            return await fetchMultipleHotelRealTimeStatus(bookings, userType);
        case 'flight':
            return await fetchMultipleFlightRealTimeStatus(bookings, userType);
        case 'bus':
        default:
            return await fetchMultipleRealTimeStatus(bookings, userType);
    }
};

// ✅ Export service endpoints for external use if needed
export { BusBookingServices, HotelBookingServices, FlightBookingServices };