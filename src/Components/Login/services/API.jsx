import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define financial service endpoints
const FinancialServices = {
    getPaymentHistory: `${baseURL}/user/payment-history`,
    getWalletBalance: `${baseURL}/user/wallet-balance`,
    // ✅ New agent endpoints
    getAgentWalletHistory: `${baseURL}/agent/wallet-history`,
};

// ✅ API configuration
const API_BASE_URL = "https://api.rasutrip.com/api/v1";

// ✅ Helper function to detect user type
const detectUserType = () => {
    console.log('🔍 Detecting user type...');

    const storedUserType = localStorage.getItem('userType') || localStorage.getItem('user_type');
    let detectedType = null;
    const customerTokenKeys = ['token', 'authToken', 'customer_token', 'customerToken'];
    const agentTokenKeys = ['agent_token', 'agentToken', 'agent_auth_token'];

    const hasCustomerToken = customerTokenKeys.some(key => localStorage.getItem(key));
    const hasAgentToken = agentTokenKeys.some(key => localStorage.getItem(key));

    if (storedUserType) {
        detectedType = storedUserType.toLowerCase();
    } else if (hasAgentToken && !hasCustomerToken) {
        detectedType = 'agent';
    } else if (hasCustomerToken && !hasAgentToken) {
        detectedType = 'customer';
    } else {
        const hasAnyToken = localStorage.getItem('token') || localStorage.getItem('authToken');
        detectedType = hasAnyToken ? 'customer' : null;
    }

    console.log('✅ Final detected user type:', detectedType);
    return detectedType;
};

// ✅ Helper function to get authentication headers
const getAuthHeaders = () => {
    const currentUserType = detectUserType();

    let token = null;
    const tokenKeys = currentUserType === 'agent'
        ? ['agent_token', 'agentToken', 'agent_auth_token', 'token', 'authToken']
        : ['token', 'authToken', 'customer_token', 'customerToken', 'accessToken'];

    for (const key of tokenKeys) {
        const value = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (value) {
            token = value;
            console.log(`🔐 Found token with key: ${key} for user type: ${currentUserType}`);
            break;
        }
    }

    if (!token) {
        console.error('❌ No authentication token found for user type:', currentUserType);
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Type': currentUserType || 'customer',
    };

    // Add additional headers for agent requests
    if (currentUserType === 'agent') {
        headers['X-Agent-Request'] = 'true';
        headers['X-User-Role'] = 'agent';
    }

    console.log('📤 Auth headers:', { ...headers, Authorization: token ? `Bearer ${token.substring(0, 10)}...` : 'None' });
    return headers;
};

// ✅ Make authenticated API request
const makeAuthenticatedRequest = async (url, method = 'GET', data = null) => {
    const headers = getAuthHeaders();
    const config = {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(url, config);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
};

// ✅ Helper function to extract bookings array from API response
const extractBookingsArray = (apiResponse) => {
    let bookingsArray = [];

    if (Array.isArray(apiResponse)) {
        bookingsArray = apiResponse;
    } else if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        bookingsArray = apiResponse.data;
    } else if (apiResponse?.bookings && Array.isArray(apiResponse.bookings)) {
        bookingsArray = apiResponse.bookings;
    } else if (apiResponse?.results && Array.isArray(apiResponse.results)) {
        bookingsArray = apiResponse.results;
    } else if (apiResponse?.response && Array.isArray(apiResponse.response)) {
        bookingsArray = apiResponse.response;
    } else if (apiResponse?.agentBookings && Array.isArray(apiResponse.agentBookings)) {
        bookingsArray = apiResponse.agentBookings;
    } else if (typeof apiResponse === 'object' && apiResponse !== null) {
        const possibleArrays = Object.values(apiResponse).filter(Array.isArray);
        if (possibleArrays.length > 0) {
            bookingsArray = possibleArrays[0];
        }
    }

    return bookingsArray;
};

// ✅ Fetch hotel bookings and convert to payment format
const fetchHotelPayments = async () => {
    try {
        let allHotelBookings = [];

        // Fetch upcoming bookings
        try {
            const upcomingResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/hotelservice/up-comming-bookings`);
            const upcomingBookings = extractBookingsArray(upcomingResponse);
            allHotelBookings = [...allHotelBookings, ...upcomingBookings];
            console.log('🏨 Upcoming hotel bookings:', upcomingBookings.length);
        } catch (error) {
            console.warn('⚠️ Failed to fetch upcoming hotel bookings:', error.message);
        }

        // Fetch all bookings
        try {
            const allResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/hotelservice/my-bookings`);
            const allBookings = extractBookingsArray(allResponse);

            // Remove duplicates by booking ID
            const existingIds = new Set(allHotelBookings.map(b => (b.Result || b).BookingId || (b.Result || b).bookingId));
            const newBookings = allBookings.filter(b => {
                const bookingId = (b.Result || b).BookingId || (b.Result || b).bookingId;
                return !existingIds.has(bookingId);
            });

            allHotelBookings = [...allHotelBookings, ...newBookings];
            console.log('🏨 All hotel bookings:', newBookings.length, 'new bookings added');
        } catch (error) {
            console.warn('⚠️ Failed to fetch all hotel bookings:', error.message);
        }

        console.log('🏨 Total hotel bookings found:', allHotelBookings.length);

        // Convert hotel bookings to payment format
        const hotelPayments = allHotelBookings.map((bookingWrapper, index) => {
            const booking = bookingWrapper.Result || bookingWrapper;

            const bookingId = bookingWrapper.bookingId ||
                bookingWrapper.BookingId ||
                booking.BookingId ||
                booking.bookingId ||
                booking.booking_id ||
                booking.id ||
                `HTL${Date.now()}${index}`;

            const hotelName = booking.HotelName ||
                booking.hotelName ||
                booking.hotel_name ||
                booking.name ||
                booking.propertyName ||
                'Hotel Booking';

            const city = booking.City ||
                booking.city ||
                booking.location ||
                booking.destination ||
                booking.CityName ||
                'Unknown City';

            const checkInDate = booking.CheckIn ||
                booking.checkInDate ||
                booking.check_in_date ||
                booking.arrivalDate ||
                booking.CheckInDate ||
                booking.fromDate;

            const checkOutDate = booking.CheckOut ||
                booking.checkOutDate ||
                booking.check_out_date ||
                booking.departureDate ||
                booking.CheckOutDate ||
                booking.toDate;

            const totalAmount = bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                0;

            const bookingStatus = booking.Status ||
                booking.status ||
                booking.bookingStatus ||
                booking.BookingStatus ||
                'Confirmed';

            // Map booking status to payment status
            let paymentStatus = 'SUCCESS';
            if (bookingStatus.toLowerCase().includes('cancel')) {
                paymentStatus = 'REFUNDED';
            } else if (bookingStatus.toLowerCase().includes('pending')) {
                paymentStatus = 'PENDING';
            } else if (bookingStatus.toLowerCase().includes('fail')) {
                paymentStatus = 'FAILED';
            }

            const createdAt = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.created_at ||
                new Date().toISOString();

            const transactionId = booking.ConfirmationNo ||
                booking.confirmationNumber ||
                booking.confirmation_no ||
                booking.confirmationNo ||
                booking.ConfirmationNumber ||
                booking.referenceNumber ||
                booking.ReferenceNumber ||
                booking.PNR ||
                booking.pnr ||
                booking.BookingReference ||
                booking.bookingReference ||
                bookingId;

            return {
                id: `hotel_${bookingId}`,
                _id: `hotel_${bookingId}`,
                bookingId: String(bookingId),
                type: 'HOTEL',
                serviceName: hotelName,
                amount: parseFloat(totalAmount) || 0,
                status: paymentStatus,
                date: createdAt,
                createdAt: createdAt,
                paymentMethod: 'Online Payment',
                transactionId: String(transactionId),
                serviceDetails: {
                    hotelName: hotelName,
                    hotelLocation: city,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    rooms: booking.HotelRoomsDetails?.length || 1
                },
                rawData: bookingWrapper
            };
        });

        console.log('🏨 Converted hotel payments:', hotelPayments);
        return hotelPayments;

    } catch (error) {
        console.error('❌ Error fetching hotel payments:', error);
        throw error;
    }
};

// ✅ Fetch bus bookings and convert to payment format
const fetchBusPayments = async () => {
    try {
        let allBusBookings = [];

        console.log('🚌 Fetching bus bookings...');

        // Fetch upcoming bus bookings
        try {
            console.log('🚌 Trying upcoming bus bookings endpoint...');
            const upcomingResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/busservice/up-comming-bookings`);
            const upcomingBookings = extractBookingsArray(upcomingResponse);
            allBusBookings = [...allBusBookings, ...upcomingBookings];
            console.log('🚌 Upcoming bus bookings found:', upcomingBookings.length);
        } catch (error) {
            console.warn('⚠️ Failed to fetch upcoming bus bookings:', error.message);
        }

        // Fetch all bus bookings
        try {
            console.log('🚌 Trying all bus bookings endpoint...');
            const allResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/busservice/my-bookings`);
            const allBookings = extractBookingsArray(allResponse);

            // Remove duplicates by booking ID
            const existingIds = new Set(allBusBookings.map(b => {
                const booking = b.Result || b;
                return booking.BookingId || booking.bookingId || b.bookingId || b.BookingId;
            }));

            const newBookings = allBookings.filter(b => {
                const booking = b.Result || b;
                const bookingId = booking.BookingId || booking.bookingId || b.bookingId || b.BookingId;
                return !existingIds.has(bookingId);
            });

            allBusBookings = [...allBusBookings, ...newBookings];
            console.log('🚌 All bus bookings found:', newBookings.length, 'new bookings added');
        } catch (error) {
            console.warn('⚠️ Failed to fetch all bus bookings:', error.message);
        }

        console.log('🚌 Total bus bookings found:', allBusBookings.length);

        // Convert bus bookings to payment format
        const busPayments = allBusBookings.map((bookingWrapper, index) => {
            const booking = bookingWrapper.Result || bookingWrapper;

            const bookingId = bookingWrapper.bookingId ||
                bookingWrapper.BookingId ||
                booking.BookingId ||
                booking.bookingId ||
                booking.booking_id ||
                booking.id ||
                `BUS${Date.now()}${index}`;

            const fromCity = booking.Origin || booking.FromCity || booking.fromCity ||
                booking.from || booking.origin || 'Unknown';
            const toCity = booking.Destination || booking.ToCity || booking.toCity ||
                booking.to || booking.destination || 'Unknown';

            const route = `${fromCity} → ${toCity}`;
            const busOperator = booking.BusType || booking.busType || booking.TravelName ||
                booking.operator || booking.busName || booking.serviceName || 'Bus Service';

            const totalAmount = bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                booking.Price?.PublishedPrice ||
                booking.Price?.OfferedPrice ||
                0;

            const bookingStatus = booking.Status || booking.status || booking.bookingStatus || 'Confirmed';

            // Map booking status to payment status
            let paymentStatus = 'SUCCESS';
            if (bookingStatus.toLowerCase().includes('cancel')) {
                paymentStatus = 'REFUNDED';
            } else if (bookingStatus.toLowerCase().includes('pending')) {
                paymentStatus = 'PENDING';
            } else if (bookingStatus.toLowerCase().includes('fail')) {
                paymentStatus = 'FAILED';
            }

            const createdAt = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.created_at ||
                new Date().toISOString();

            const transactionId = booking.TicketNo ||
                booking.ticketNo ||
                booking.ticketNumber ||
                booking.TravelOperatorPNR ||
                booking.PNR ||
                booking.pnr ||
                `TXN${bookingId}`;

            return {
                id: `bus_${bookingId}`,
                _id: `bus_${bookingId}`,
                bookingId: String(bookingId),
                type: 'BUS',
                serviceName: busOperator,
                amount: parseFloat(totalAmount) || 0,
                status: paymentStatus,
                date: createdAt,
                createdAt: createdAt,
                paymentMethod: 'Online Payment',
                transactionId: String(transactionId),
                serviceDetails: {
                    busName: busOperator,
                    route: route,
                    from: fromCity,
                    to: toCity
                },
                rawData: bookingWrapper
            };
        });

        console.log('🚌 Converted bus payments:', busPayments);
        return busPayments;

    } catch (error) {
        console.error('❌ Error fetching bus payments:', error);
        throw error;
    }
};

// ✅ Enhanced payment history function that includes hotel and bus bookings
export const getPaymentHistory = async (type = null) => {
    try {
        let allPayments = [];

        // If filtering for ALL or HOTEL, fetch hotel payments
        if (!type || type === 'ALL' || type === 'HOTEL') {
            try {
                const hotelPayments = await fetchHotelPayments();
                allPayments = [...allPayments, ...hotelPayments];
            } catch (error) {
                console.warn('⚠️ Failed to fetch hotel payments:', error.message);
            }
        }

        // If filtering for ALL or BUS, fetch bus payments
        if (!type || type === 'ALL' || type === 'BUS') {
            try {
                const busPayments = await fetchBusPayments();
                allPayments = [...allPayments, ...busPayments];
            } catch (error) {
                console.warn('⚠️ Failed to fetch bus payments:', error.message);
            }
        }

        // If filtering for ALL or other types (like FLIGHT), fetch regular payments
        if (!type || type === 'ALL' || (type !== 'BUS' && type !== 'HOTEL')) {
            try {
                // Get auth token - adjust based on your auth implementation
                const token = localStorage.getItem('authToken') || localStorage.getItem('token');

                // Build endpoint with type filter if provided
                const endpoint = type && type !== 'ALL' && type !== 'BUS' && type !== 'HOTEL'
                    ? `${FinancialServices.getPaymentHistory}?type=${type}`
                    : FinancialServices.getPaymentHistory;

                const res = await axios.get(endpoint, {
                    headers: {
                        "Content-Type": "application/json",
                        // Adjust authorization header format based on your API requirements
                        ...(token && { "Authorization": `Bearer ${token}` })
                    },
                });

                // API response format - handle your specific structure
                let paymentData = res.data.data || res.data.payments || res.data || [];

                // Enhanced data processing for booking details
                paymentData = paymentData.map(payment => {
                    // Extract booking details from various possible locations
                    const bookingDetails = payment.bookingDetails || payment.booking || payment.details || {};
                    const metadata = payment.metadata || payment.meta || {};

                    return {
                        // Basic payment info
                        id: payment.id || payment._id || payment.paymentId,
                        _id: payment.id || payment._id || payment.paymentId,
                        amount: payment.amount || 0,
                        status: payment.status || 'PENDING',
                        type: payment.type || payment.paymentType || 'BOOKING',
                        createdAt: payment.createdAt || payment.created_at || payment.date,
                        date: payment.createdAt || payment.created_at || payment.date,

                        // Transaction details
                        transactionId: payment.transactionId || payment.transaction_id || payment.txnId || 'N/A',
                        paymentMode: payment.paymentMode || payment.payment_mode || payment.mode,
                        paymentMethod: payment.paymentMode || payment.payment_mode || payment.mode || 'Online Payment',

                        // Booking specific details
                        bookingId: payment.bookingId || bookingDetails.bookingId || bookingDetails.id || 'N/A',
                        bookingType: payment.bookingType || bookingDetails.type || payment.type || 'N/A',

                        // Service details (Hotel, Flight, Bus)
                        serviceName: bookingDetails.hotelName || bookingDetails.flightName || bookingDetails.busName ||
                            bookingDetails.serviceName || bookingDetails.name || metadata.serviceName || 'N/A',

                        serviceDetails: {
                            // Hotel details
                            hotelName: bookingDetails.hotelName || metadata.hotelName,
                            hotelLocation: bookingDetails.hotelLocation || bookingDetails.location || metadata.location,
                            checkIn: bookingDetails.checkIn || bookingDetails.check_in,
                            checkOut: bookingDetails.checkOut || bookingDetails.check_out,
                            rooms: bookingDetails.rooms || bookingDetails.roomCount,
                            guests: bookingDetails.guests || bookingDetails.guestCount,

                            // Flight details
                            flightNumber: bookingDetails.flightNumber || bookingDetails.flight_number,
                            airline: bookingDetails.airline || bookingDetails.airlineName,
                            from: bookingDetails.from || bookingDetails.departure,
                            to: bookingDetails.to || bookingDetails.arrival,
                            departureDate: bookingDetails.departureDate || bookingDetails.departure_date,
                            returnDate: bookingDetails.returnDate || bookingDetails.return_date,
                            passengers: bookingDetails.passengers || bookingDetails.passengerCount,

                            // Bus details
                            busName: bookingDetails.busName || bookingDetails.bus_name,
                            busType: bookingDetails.busType || bookingDetails.bus_type,
                            route: bookingDetails.route,
                            boardingPoint: bookingDetails.boardingPoint || bookingDetails.boarding_point,
                            droppingPoint: bookingDetails.droppingPoint || bookingDetails.dropping_point,
                            travelDate: bookingDetails.travelDate || bookingDetails.travel_date,
                            seats: bookingDetails.seats || bookingDetails.seatNumbers
                        },

                        // Keep original payment object for fallback
                        originalPayment: payment
                    };
                });

                allPayments = [...allPayments, ...paymentData];
                console.log("✅ Processed regular payment data:", paymentData);

            } catch (error) {
                console.warn('⚠️ Failed to fetch regular payments:', error.message);
            }
        }

        // Filter by type if specified
        if (type && type !== 'ALL') {
            allPayments = allPayments.filter(payment => payment.type === type);
        }

        // Sort by date (newest first)
        allPayments.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        console.log("✅ Final processed payment data:", allPayments);

        return {
            success: true,
            data: allPayments,
            message: "Payment history fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching payment history:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch payment history",
            error: err,
            data: []
        };
    }
};

// ✅ Get payment by ID (optional - for future use)
export const getPaymentById = async (paymentId) => {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        const res = await axios.get(`${FinancialServices.getPaymentHistory}/${paymentId}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });

        return {
            success: true,
            data: res.data.data || res.data,
            message: "Payment details fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching payment details:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch payment details",
            error: err,
            data: null
        };
    }
};

// ✅ Get user wallet balance
export const getWalletBalance = async () => {
    try {
        // Get auth token - adjust based on your auth implementation
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        const res = await axios.get(FinancialServices.getWalletBalance, {
            headers: {
                "Content-Type": "application/json",
                // Adjust authorization header format based on your API requirements
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });

        // API response format - handle your specific structure
        const walletData = res.data.data || res.data.wallet || res.data;
        const balance = walletData.balance || walletData.walletBalance || walletData.amount || 0;

        return {
            success: true,
            data: walletData,
            balance: balance,
            message: "Wallet balance fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching wallet balance:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch wallet balance",
            error: err,
            balance: 0
        };
    }
};

// ✅ NEW: Get agent wallet history/balance
export const getAgentWalletHistory = async () => {
    try {
        // Get auth token - adjust based on your auth implementation
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        const res = await axios.get(FinancialServices.getAgentWalletHistory, {
            headers: {
                "Content-Type": "application/json",
                // Adjust authorization header format based on your API requirements
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });

        // API response format - handle your specific structure
        const walletData = res.data.data || res.data.wallet || res.data;
        const balance = walletData.balance || walletData.walletBalance || walletData.amount || 0;
        const history = walletData.history || walletData.transactions || [];

        return {
            success: true,
            data: walletData,
            balance: balance,
            history: history,
            message: "Agent wallet history fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching agent wallet history:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch agent wallet history",
            error: err,
            balance: 0,
            history: []
        };
    }
};

// ✅ NEW: Universal wallet balance function that detects user type
export const getUniversalWalletBalance = async (userType = null) => {
    try {
        // Auto-detect user type from localStorage or context if not provided
        if (!userType) {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userRole = userData.role || userData.userType || userData.type;
            userType = userRole === 'agent' ? 'agent' : 'user';
        }

        if (userType === 'agent') {
            // Call agent wallet API
            const result = await getAgentWalletHistory();
            return {
                success: result.success,
                balance: result.balance,
                data: result.data,
                message: result.message,
                userType: 'agent'
            };
        } else {
            // Call user wallet API
            const result = await getWalletBalance();
            return {
                success: result.success,
                balance: result.balance,
                data: result.data,
                message: result.message,
                userType: 'user'
            };
        }
    } catch (err) {
        console.error("❌ Error fetching universal wallet balance:", err.message);
        throw {
            success: false,
            message: err.message || "Failed to fetch wallet balance",
            error: err,
            balance: 0,
            userType: userType || 'user'
        };
    }
};

// ✅ Financial utility functions
export const FinancialUtils = {
    // Format currency for display
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    },

    // Format amount without currency symbol
    formatAmount: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    },

    // Format date for display
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get status color class
    getStatusClass: (status) => {
        const statusStyles = {
            SUCCESS: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            REFUNDED: 'bg-blue-100 text-blue-800'
        };
        return statusStyles[status] || 'bg-gray-100 text-gray-800';
    },

    // Calculate total amount for successful payments
    calculateTotalAmount: (payments) => {
        return payments.reduce((sum, payment) =>
            payment.status === 'SUCCESS' ? sum + payment.amount : sum, 0
        );
    },

    // Group payments by type
    groupByType: (payments) => {
        return payments.reduce((groups, payment) => {
            const type = payment.type || 'OTHER';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(payment);
            return groups;
        }, {});
    },

    // Check if user has sufficient wallet balance
    hasSufficientBalance: (walletBalance, requiredAmount) => {
        return walletBalance >= requiredAmount;
    },

    // ✅ Detect user type from various sources
    detectUserType: detectUserType,

    // Get booking details for display
    getBookingDetails: (payment) => {
        if (!payment || !payment.serviceDetails) return 'N/A';

        const details = payment.serviceDetails;
        const type = payment.bookingType?.toLowerCase() || payment.type?.toLowerCase();

        switch (type) {
            case 'hotel':
                return details.hotelName || 'Hotel Booking';
            case 'flight':
                return `${details.airline || 'Flight'} ${details.flightNumber || ''}`.trim();
            case 'bus':
                return details.busName || 'Bus Booking';
            default:
                return payment.serviceName || 'Booking';
        }
    },

    // Get detailed booking info for expanded view
    getDetailedBookingInfo: (payment) => {
        if (!payment || !payment.serviceDetails) return [];

        const details = payment.serviceDetails;
        const type = payment.bookingType?.toLowerCase() || payment.type?.toLowerCase();
        const info = [];

        switch (type) {
            case 'hotel':
                if (details.hotelLocation) info.push(`Location: ${details.hotelLocation}`);
                if (details.checkIn) info.push(`Check-in: ${FinancialUtils.formatDate(details.checkIn)}`);
                if (details.checkOut) info.push(`Check-out: ${FinancialUtils.formatDate(details.checkOut)}`);
                if (details.rooms) info.push(`Rooms: ${details.rooms}`);
                if (details.guests) info.push(`Guests: ${details.guests}`);
                break;

            case 'flight':
                if (details.from && details.to) info.push(`Route: ${details.from} → ${details.to}`);
                if (details.departureDate) info.push(`Departure: ${FinancialUtils.formatDate(details.departureDate)}`);
                if (details.returnDate) info.push(`Return: ${FinancialUtils.formatDate(details.returnDate)}`);
                if (details.passengers) info.push(`Passengers: ${details.passengers}`);
                break;

            case 'bus':
                if (details.route) info.push(`Route: ${details.route}`);
                if (details.travelDate) info.push(`Travel Date: ${FinancialUtils.formatDate(details.travelDate)}`);
                if (details.boardingPoint) info.push(`Boarding: ${details.boardingPoint}`);
                if (details.seats) info.push(`Seats: ${details.seats}`);
                break;
        }

        return info;
    },

    // Format transaction type for display
    formatTransactionType: (type) => {
        const typeMap = {
            'WALLET_RECHARGE': 'Wallet Recharge',
            'PAYMENT': 'Payment',
            'BOOKING': 'Booking',
            'HOTEL': 'Hotel Booking',
            'FLIGHT': 'Flight Booking',
            'BUS': 'Bus Booking',
            'REFUND': 'Refund',
            'WITHDRAWAL': 'Withdrawal',
            'CASHBACK': 'Cashback',
            'COMMISSION': 'Commission',
            'OTHER': 'Other'
        };
        return typeMap[type] || type;
    },

    // Check if booking has valid details
    hasValidBookingDetails: (payment) => {
        return payment && (
            payment.bookingId !== 'N/A' ||
            payment.transactionId !== 'N/A' ||
            payment.serviceName !== 'N/A'
        );
    }
};

// ✅ Export individual utility objects for specific use cases
export const PaymentUtils = {
    formatCurrency: FinancialUtils.formatCurrency,
    formatAmount: FinancialUtils.formatAmount,
    formatDate: FinancialUtils.formatDate,
    getStatusClass: FinancialUtils.getStatusClass,
    calculateTotalAmount: FinancialUtils.calculateTotalAmount,
    groupByType: FinancialUtils.groupByType,
    formatTransactionType: FinancialUtils.formatTransactionType,
    getBookingDetails: FinancialUtils.getBookingDetails,
    getDetailedBookingInfo: FinancialUtils.getDetailedBookingInfo,
    hasValidBookingDetails: FinancialUtils.hasValidBookingDetails
};

export const WalletUtils = {
    formatCurrency: FinancialUtils.formatCurrency,
    formatAmount: FinancialUtils.formatAmount,
    hasSufficientBalance: FinancialUtils.hasSufficientBalance,
    detectUserType: FinancialUtils.detectUserType
};

// ✅ Export comprehensive financial service (recommended)
const FinancialService = {
    // Payment methods
    getPaymentHistory,
    getPaymentById,

    // Wallet methods
    getWalletBalance,
    getAgentWalletHistory,
    getUniversalWalletBalance,

    // Utility methods
    formatCurrency: FinancialUtils.formatCurrency,
    formatAmount: FinancialUtils.formatAmount,
    formatDate: FinancialUtils.formatDate,
    getStatusClass: FinancialUtils.getStatusClass,
    calculateTotalAmount: FinancialUtils.calculateTotalAmount,
    groupByType: FinancialUtils.groupByType,
    hasSufficientBalance: FinancialUtils.hasSufficientBalance,
    detectUserType: FinancialUtils.detectUserType,
    formatTransactionType: FinancialUtils.formatTransactionType,
    getBookingDetails: FinancialUtils.getBookingDetails,
    getDetailedBookingInfo: FinancialUtils.getDetailedBookingInfo,
    hasValidBookingDetails: FinancialUtils.hasValidBookingDetails,
};

// ✅ Export backward compatibility objects
export const PaymentService = {
    getPaymentHistory,
    getPaymentById,
    formatCurrency: PaymentUtils.formatCurrency,
    formatAmount: PaymentUtils.formatAmount,
    formatDate: PaymentUtils.formatDate,
    getStatusClass: PaymentUtils.getStatusClass,
    calculateTotalAmount: PaymentUtils.calculateTotalAmount,
    groupByType: PaymentUtils.groupByType,
};

export const WalletService = {
    getWalletBalance,
    getAgentWalletHistory,
    getUniversalWalletBalance,
    formatCurrency: WalletUtils.formatCurrency,
    formatAmount: WalletUtils.formatAmount,
    hasSufficientBalance: WalletUtils.hasSufficientBalance,
    detectUserType: WalletUtils.detectUserType,
};

export default FinancialService;