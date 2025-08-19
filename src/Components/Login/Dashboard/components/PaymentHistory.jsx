import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../Context/AuthContext'; // Adjust path as needed
import { getPaymentHistory } from '../../services/userApi';

// API configuration
const API_BASE_URL = "https://api.rasutrip.com/api/v1";

const PaymentHistory = () => {
    const { user } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [userType, setUserType] = useState(null);

    const filterOptions = [
        { value: 'ALL', label: 'All Payments', icon: '📋' },
        { value: 'FLIGHT', label: 'Flight', icon: '✈️' },
        { value: 'HOTEL', label: 'Hotel', icon: '🏨' },
        { value: 'BUS', label: 'Bus', icon: '🚌' }
    ];

    // Detect user type from multiple sources
    const detectUserType = () => {
        console.log('🔍 Detecting user type...');

        const storedUserType = localStorage.getItem('userType') || localStorage.getItem('user_type');

        let detectedType = null;
        const customerTokenKeys = ['token', 'authToken', 'customer_token', 'customerToken'];
        const agentTokenKeys = ['agent_token', 'agentToken', 'agent_auth_token'];

        const hasCustomerToken = customerTokenKeys.some(key => localStorage.getItem(key));
        const hasAgentToken = agentTokenKeys.some(key => localStorage.getItem(key));

        if (user) {
            if (user.isAgent || user.userType === 'agent' || user.role === 'agent') {
                detectedType = 'agent';
            } else if (user.isCustomer || user.userType === 'customer' || user.role === 'customer') {
                detectedType = 'customer';
            }
        }

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

    // Get authentication headers
    const getAuthHeaders = () => {
        const currentUserType = userType || detectUserType();

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

    // Make authenticated API request
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

    // Fetch hotel booking data and convert to payment format
    const fetchHotelPayments = async () => {
        const currentUserType = userType || detectUserType();

        try {
            // Try to fetch both upcoming and all hotel bookings
            let allHotelBookings = [];

            // Fetch upcoming bookings
            try {
                const upcomingResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/hotelservice/up-comming-bookings`);
                const upcomingBookings = extractHotelBookingsArray(upcomingResponse);
                allHotelBookings = [...allHotelBookings, ...upcomingBookings];
                console.log('🏨 Upcoming hotel bookings:', upcomingBookings.length);
            } catch (error) {
                console.warn('⚠️ Failed to fetch upcoming hotel bookings:', error.message);
            }

            // Fetch all bookings
            try {
                const allResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/hotelservice/my-bookings`);
                const allBookings = extractHotelBookingsArray(allResponse);

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

                // Calculate nights
                const calculateNights = (checkIn, checkOut) => {
                    try {
                        const checkInDate = new Date(checkIn);
                        const checkOutDate = new Date(checkOut);
                        const timeDiff = checkOutDate - checkInDate;
                        const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                        return nights > 0 ? nights : 1;
                    } catch {
                        return 1;
                    }
                };

                const nights = calculateNights(checkInDate, checkOutDate);

                // Format date range for display
                const formatDateRange = (checkIn, checkOut, nights) => {
                    try {
                        const checkInFormatted = new Date(checkIn).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short'
                        });
                        const checkOutFormatted = new Date(checkOut).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });
                        return `${checkInFormatted} → ${checkOutFormatted} (${nights} ${nights === 1 ? 'night' : 'nights'})`;
                    } catch {
                        return `${city} • ${nights} ${nights === 1 ? 'night' : 'nights'}`;
                    }
                };

                const dateRange = formatDateRange(checkInDate, checkOutDate, nights);

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

                const confirmationNo = booking.ConfirmationNo ||
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

                // Get room information
                let roomInfo = '';
                let numberOfGuests = 'N/A';

                if (booking.HotelRoomsDetails && Array.isArray(booking.HotelRoomsDetails) && booking.HotelRoomsDetails.length > 0) {
                    const roomCount = booking.HotelRoomsDetails.length;
                    const firstRoom = booking.HotelRoomsDetails[0];

                    const roomType = firstRoom.RoomTypeName ||
                        firstRoom.RoomType ||
                        firstRoom.roomTypeName ||
                        firstRoom.roomType ||
                        'Standard Room';

                    roomInfo = `${roomCount} ${roomCount === 1 ? 'Room' : 'Rooms'} • ${roomType}`;

                    // Count total guests
                    let totalGuests = 0;
                    booking.HotelRoomsDetails.forEach(room => {
                        if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
                            totalGuests += room.HotelPassenger.length;
                        }
                    });
                    numberOfGuests = totalGuests > 0 ? `${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'}` : 'N/A';
                } else {
                    roomInfo = '1 Room';
                }

                return {
                    _id: `hotel_${bookingId}`,
                    bookingId: String(bookingId),
                    type: 'HOTEL',
                    hotelName: hotelName,
                    city: city,
                    dateRange: dateRange,
                    roomInfo: roomInfo,
                    numberOfGuests: numberOfGuests,
                    nights: nights,
                    amount: parseFloat(totalAmount) || 0,
                    status: paymentStatus,
                    date: createdAt,
                    paymentMethod: 'Online Payment',
                    transactionId: String(confirmationNo),
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    rawData: bookingWrapper // Keep original data for debugging
                };
            });

            console.log('🏨 Converted hotel payments:', hotelPayments);
            return hotelPayments;

        } catch (error) {
            console.error('❌ Error fetching hotel payments:', error);
            throw error;
        }
    };

    // Helper function to extract bookings array from API response
    const extractHotelBookingsArray = (apiResponse) => {
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
        } else if (typeof apiResponse === 'object' && apiResponse !== null) {
            const possibleArrays = Object.values(apiResponse).filter(Array.isArray);
            if (possibleArrays.length > 0) {
                bookingsArray = possibleArrays[0];
            }
        }

        return bookingsArray;
    };

    // Helper function to extract bus bookings array from API response
    const extractBusBookingsArray = (apiResponse) => {
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
                console.log('🚌 Found bus bookings array:', bookingsArray.length, 'bookings');
            }
        }

        return bookingsArray;
    };

    // Fetch bus booking data and convert to payment format
    const fetchBusPayments = async () => {
        const currentUserType = userType || detectUserType();

        try {
            let allBusBookings = [];

            console.log('🚌 Fetching bus bookings for user type:', currentUserType);

            // Fetch upcoming bus bookings
            try {
                console.log('🚌 Trying upcoming bus bookings endpoint...');
                const upcomingResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/busservice/up-comming-bookings`);
                console.log('🚌 Upcoming bus bookings response:', upcomingResponse);

                const upcomingBookings = extractBusBookingsArray(upcomingResponse);
                allBusBookings = [...allBusBookings, ...upcomingBookings];
                console.log('🚌 Upcoming bus bookings found:', upcomingBookings.length);
            } catch (error) {
                console.warn('⚠️ Failed to fetch upcoming bus bookings:', error.message);
            }

            // Fetch all bus bookings
            try {
                console.log('🚌 Trying all bus bookings endpoint...');
                const allResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/busservice/my-bookings`);
                console.log('🚌 All bus bookings response:', allResponse);

                const allBookings = extractBusBookingsArray(allResponse);

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

            console.log('🚌 Total bus bookings found for', currentUserType, ':', allBusBookings.length);

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
                    _id: `bus_${bookingId}`,
                    bookingId: String(bookingId),
                    type: 'BUS',
                    busOperator: busOperator,
                    route: route,
                    amount: parseFloat(totalAmount) || 0,
                    status: paymentStatus,
                    date: createdAt,
                    paymentMethod: 'Online Payment',
                    transactionId: String(transactionId),
                    rawData: bookingWrapper // Keep original data for debugging
                };
            });

            console.log('🚌 Converted bus payments:', busPayments);
            return busPayments;

        } catch (error) {
            console.error('❌ Error fetching bus payments:', error);
            throw error;
        }
    };

    // Fetch payment history using service
    const fetchPaymentHistory = async (type = null) => {
        setLoading(true);
        setError(null);

        // Detect and set user type
        const detectedUserType = detectUserType();
        setUserType(detectedUserType);

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

            // If filtering for ALL or other types, fetch regular payments (flights, etc.)
            if (!type || type === 'ALL' || (type !== 'BUS' && type !== 'HOTEL')) {
                try {
                    const result = await getPaymentHistory(type === 'BUS' || type === 'HOTEL' ? null : type);
                    if (result.success && result.data) {
                        allPayments = [...allPayments, ...result.data];
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to fetch regular payments:', error.message);
                }
            }

            // Filter by type if specified
            if (type && type !== 'ALL') {
                allPayments = allPayments.filter(payment => payment.type === type);
            }

            // Sort by date (newest first)
            allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

            setPayments(allPayments);

        } catch (err) {
            console.error('Error fetching payment history:', err);
            setError(err.message || 'Failed to fetch payment history');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentHistory();
    }, [user]);

    const handleFilterChange = (filterType) => {
        setActiveFilter(filterType);
        fetchPaymentHistory(filterType === 'ALL' ? null : filterType);
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            SUCCESS: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            REFUNDED: 'bg-blue-100 text-blue-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getServiceDetails = (payment) => {
        switch (payment.type) {

            case 'FLIGHT':
                return {
                    title: payment.flightDetails || 'Flight Booking',
                    subtitle: payment.route || 'N/A',
                    additionalInfo: null,
                    icon: '✈️'
                };
            case 'HOTEL':
                return {
                    title: payment.hotelName || 'Hotel Booking',
                    subtitle: `${payment.city} • ${payment.dateRange}`,
                    additionalInfo: payment.roomInfo,
                    icon: '🏨'
                };
            case 'BUS':
                return {
                    title: payment.busOperator || 'Bus Booking',
                    subtitle: payment.route || 'N/A',
                    additionalInfo: null,
                    icon: '🚌'
                };
            default:
                return {
                    title: 'Booking',
                    subtitle: 'N/A',
                    additionalInfo: null,
                    icon: '📋'
                };
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-3xl font-bold text-gray-700 mb-2">Payment History</h4>
                        <p className="text-gray-400">Track all your booking payments and transactions</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {userType === 'agent' ? 'Agent' : 'Customer'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => handleFilterChange(filter.value)}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeFilter === filter.value
                                ? 'bg-red-500 text-white shadow-lg transform scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                                }`}
                        >
                            <span className="mr-2">{filter.icon}</span>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment Cards */}
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-2">⚠️</span>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {payments.length === 0 && !loading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Payment History</h3>
                        <p className="text-gray-600">
                            {activeFilter === 'ALL'
                                ? "You haven't made any payments yet."
                                : `No ${activeFilter.toLowerCase()} payments found.`
                            }
                        </p>
                        <button
                            onClick={() => fetchPaymentHistory(activeFilter === 'ALL' ? null : activeFilter)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Refresh
                        </button>
                    </div>
                ) : (
                    payments.map((payment) => {
                        const serviceDetails = getServiceDetails(payment);
                        return (
                            <div key={payment._id || payment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        {/* Left Section */}
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                                                    {serviceDetails.icon}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h5 className="text-lg font-semibold text-gray-900 truncate">
                                                        {serviceDetails.title}
                                                    </h5>
                                                    {getStatusBadge(payment.status)}
                                                </div>

                                                <p className="text-gray-600 mb-1">{serviceDetails.subtitle}</p>

                                                {serviceDetails.additionalInfo && (
                                                    <p className="text-sm text-gray-500 mb-1">{serviceDetails.additionalInfo}</p>
                                                )}

                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>Booking ID: {payment.bookingId}</span>
                                                    <span>•</span>
                                                    <span>{payment.paymentMethod || 'Online Payment'}</span>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                    <span>Transaction ID: {payment.transactionId}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section */}
                                        <div className="flex-shrink-0 text-right ml-4">
                                            <div className="text-xl font-bold text-gray-900 mb-1">
                                                {formatAmount(payment.amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(payment.date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;