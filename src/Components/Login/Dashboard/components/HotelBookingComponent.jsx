import React, { useState, useEffect } from "react";

// API configuration
const API_BASE_URL = "https://api.rasutrip.com/api/v1";

const HotelBookingHistory = () => {
    const [bookingType, setBookingType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [debugInfo, setDebugInfo] = useState(null);

    // Enhanced authentication headers function
    const getAuthHeaders = () => {
        // Check multiple possible token storage keys
        const tokenKeys = [
            'authToken',
            'token',
            'accessToken',
            'jwt',
            'userToken',
            'Bearer',
            'auth_token',
            'access_token'
        ];

        let token = null;
        let tokenKey = null;

        for (const key of tokenKeys) {
            // Use memory-based storage for artifacts (in real app, use localStorage/sessionStorage)
            const value = window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key);
            if (value) {
                token = value;
                tokenKey = key;
                break;
            }
        }

        console.log('🔐 Token found with key:', tokenKey);
        console.log('🔐 Token preview:', token ? `${token.substring(0, 15)}...` : 'None');

        if (!token) {
            console.error('❌ No authentication token found');
        }

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };
    };

    // Enhanced API call with better error handling and debugging
    const makeAuthenticatedRequest = async (url, method = 'GET', data = null) => {
        try {
            console.log(`🚀 Making ${method} request to:`, url);

            const headers = getAuthHeaders();
            console.log('📤 Request headers:', headers);

            const config = {
                method,
                headers,
                ...(data && { body: JSON.stringify(data) })
            };

            const response = await fetch(url, config);
            console.log('✅ API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ API Error response:', errorData);

                switch (response.status) {
                    case 401:
                        throw new Error('Authentication failed. Please login again.');
                    case 403:
                        throw new Error('Access denied. You don\'t have permission to view this data.');
                    case 404:
                        throw new Error('Hotel booking service endpoint not found.');
                    case 422:
                        throw new Error('Invalid request data.');
                    case 500:
                        throw new Error('Server error. Please try again later.');
                    default:
                        throw new Error(`Request failed with status ${response.status}`);
                }
            }

            const responseData = await response.json();
            console.log('✅ API Response data:', responseData);
            return responseData;

        } catch (error) {
            console.error('❌ API Request failed:', error);

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            } else {
                throw error;
            }
        }
    };

    // Fetch upcoming hotel bookings
    const fetchUpcomingHotelBookings = async () => {
        console.log('🚀 Fetching upcoming hotel bookings...');
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/hotelservice/up-comming-bookings`);
        return response;
    };

    // Fetch all hotel bookings
    const fetchAllHotelBookings = async () => {
        console.log('🚀 Fetching all hotel bookings...');
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/hotelservice/my-bookings`);
        return response;
    };

    // Enhanced data formatting with comprehensive field mapping for HOTEL bookings
    const formatHotelBookingData = (apiResponse, isUpcoming = false) => {
        console.log('📊 Raw API response for formatting:', apiResponse);

        // Handle different response structures
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
            // If it's an object, check if it might contain booking data
            const possibleArrays = Object.values(apiResponse).filter(Array.isArray);
            if (possibleArrays.length > 0) {
                bookingsArray = possibleArrays[0]; // Use the first array found
                console.log('📋 Found array in object:', possibleArrays[0]);
            } else {
                console.warn('⚠️ No array found in response object:', apiResponse);
                return [];
            }
        } else {
            console.warn('⚠️ Unknown response structure:', apiResponse);
            return [];
        }

        console.log('📋 Hotel bookings array extracted:', bookingsArray);
        console.log('📋 Array length:', bookingsArray.length);

        const formattedBookings = bookingsArray.map((bookingWrapper, index) => {
            console.log(`🏨 Processing hotel booking ${index + 1}:`, bookingWrapper);

            // Extract the actual booking data - it might be nested in "Result" field
            const booking = bookingWrapper.Result || bookingWrapper;
            console.log(`🏨 Actual hotel booking data for ${index + 1}:`, booking);

            // Use the outer bookingId if available, otherwise try to find it in the Result
            const bookingId = bookingWrapper.bookingId ||
                bookingWrapper.BookingId ||
                bookingWrapper.BookingID ||
                booking.BookingId ||
                booking.bookingId ||
                booking.booking_id ||
                booking.id ||
                booking.Id ||
                booking.referenceId ||
                booking.confirmationId ||
                booking.HotelBookingId ||
                booking.ConfirmationNo ||
                `HTL${Date.now()}${index}`;

            // Extract hotel information
            const hotelName = booking.HotelName ||
                booking.hotelName ||
                booking.hotel_name ||
                booking.name ||
                booking.propertyName ||
                'N/A';

            const hotelCode = booking.HotelCode ||
                booking.hotelCode ||
                booking.hotel_code ||
                booking.code ||
                booking.propertyCode ||
                'N/A';

            // Extract location information
            const city = booking.City ||
                booking.city ||
                booking.location ||
                booking.destination ||
                booking.CityName ||
                'N/A';

            const address = booking.Address ||
                booking.address ||
                booking.HotelAddress ||
                booking.location ||
                'N/A';

            // Extract check-in and check-out dates
            const checkInDate = booking.CheckIn ||
                booking.checkInDate ||
                booking.check_in_date ||
                booking.arrivalDate ||
                booking.CheckInDate ||
                booking.fromDate ||
                'N/A';

            const checkOutDate = booking.CheckOut ||
                booking.checkOutDate ||
                booking.check_out_date ||
                booking.departureDate ||
                booking.CheckOutDate ||
                booking.toDate ||
                'N/A';

            // Extract room information
            const roomType = booking.RoomType ||
                booking.roomType ||
                booking.room_type ||
                booking.RoomTypeName ||
                booking.roomName ||
                'N/A';

            const numberOfRooms = booking.NoOfRooms ||
                booking.numberOfRooms ||
                booking.rooms ||
                booking.room_count ||
                booking.RoomCount ||
                '1';

            const numberOfGuests = booking.NoOfGuests ||
                booking.numberOfGuests ||
                booking.guests ||
                booking.guest_count ||
                booking.GuestCount ||
                booking.totalGuests ||
                'N/A';

            // Extract booking status
            const bookingStatus = booking.Status ||
                booking.status ||
                booking.bookingStatus ||
                booking.BookingStatus ||
                booking.confirmationStatus ||
                'Confirmed';

            // Extract confirmation number
            const confirmationNo = booking.ConfirmationNo ||
                booking.confirmationNumber ||
                booking.confirmation_no ||
                booking.referenceNumber ||
                booking.PNR ||
                booking.pnr ||
                'N/A';

            // Extract amount information
            const totalAmount = bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                booking.Price?.PublishedPrice ||
                booking.Price?.OfferedPrice ||
                booking.TotalFare ||
                '0';

            // Extract guest information (lead passenger)
            let leadGuestName = 'N/A';
            let contactNumber = 'N/A';
            let email = 'N/A';

            // Check for HotelRoomsDetails structure
            if (booking.HotelRoomsDetails && Array.isArray(booking.HotelRoomsDetails) && booking.HotelRoomsDetails.length > 0) {
                const firstRoom = booking.HotelRoomsDetails[0];
                if (firstRoom.HotelPassenger && Array.isArray(firstRoom.HotelPassenger) && firstRoom.HotelPassenger.length > 0) {
                    const leadGuest = firstRoom.HotelPassenger.find(p => p.LeadPassenger === "true") || firstRoom.HotelPassenger[0];
                    leadGuestName = `${leadGuest.Title || ''} ${leadGuest.FirstName || ''} ${leadGuest.LastName || ''}`.trim();
                    contactNumber = leadGuest.Phoneno || leadGuest.phone || 'N/A';
                    email = leadGuest.Email || leadGuest.email || 'N/A';
                }
            }
            // Fallback to direct guest fields
            else {
                leadGuestName = booking.GuestName ||
                    booking.guestName ||
                    booking.leadPassengerName ||
                    booking.primaryGuestName ||
                    `${booking.FirstName || ''} ${booking.LastName || ''}`.trim() ||
                    'N/A';

                contactNumber = booking.ContactNumber ||
                    booking.contactNumber ||
                    booking.mobile ||
                    booking.phone ||
                    booking.Phoneno ||
                    'N/A';

                email = booking.Email ||
                    booking.email ||
                    booking.guestEmail ||
                    'N/A';
            }

            // Extract payment status
            const paymentStatus = booking.PaymentStatus ||
                booking.paymentStatus ||
                booking.payment_status ||
                (bookingStatus === 'Confirmed' ? 'Completed' : 'Processing');

            // Extract booking created date
            const createdAt = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.createdAt ||
                booking.created_at ||
                booking.bookingTime ||
                new Date().toISOString();

            // Format created date
            const formatCreatedDate = (dateString) => {
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) + ' / ' + date.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                } catch {
                    return 'N/A';
                }
            };

            // Calculate number of nights
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

            const formattedBooking = {
                bookingId: String(bookingId),
                hotelName: String(hotelName),
                hotelCode: String(hotelCode),
                city: String(city),
                address: String(address),
                checkInDate: String(checkInDate),
                checkOutDate: String(checkOutDate),
                roomType: String(roomType),
                numberOfRooms: String(numberOfRooms),
                numberOfGuests: String(numberOfGuests),
                nights: nights,
                confirmationNo: String(confirmationNo),
                bookingStatus: String(bookingStatus),
                totalAmount: String(totalAmount),
                status: String(bookingStatus), // For compatibility
                leadGuestName: String(leadGuestName),
                contactNumber: String(contactNumber),
                email: String(email),
                paymentStatus: String(paymentStatus),
                createdAt: formatCreatedDate(createdAt),
                bookingDate: formatCreatedDate(createdAt), // For compatibility
                rawData: bookingWrapper // Keep original data for debugging
            };

            console.log(`✅ Formatted hotel booking ${index + 1}:`, formattedBooking);
            return formattedBooking;
        });

        console.log('📊 All formatted hotel bookings:', formattedBookings);
        return formattedBookings;
    };

    // Main function to load hotel bookings
    const loadHotelBookings = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo(null);

        // Check authentication
        const tokenKeys = ['authToken', 'token', 'accessToken', 'jwt', 'userToken'];
        const hasToken = tokenKeys.some(key =>
            window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key)
        );

        if (!hasToken) {
            setError('Please login to view your hotel booking history.');
            setLoading(false);
            return;
        }

        try {
            console.log('🚀 Starting to load hotel bookings...');

            let upcomingData = [];
            let allData = [];
            let debugData = {
                upcomingSuccess: false,
                allBookingsSuccess: false,
                errors: []
            };

            // Try to fetch upcoming bookings
            try {
                console.log('📅 Fetching upcoming hotel bookings...');
                const upcomingResponse = await fetchUpcomingHotelBookings();
                upcomingData = formatHotelBookingData(upcomingResponse, true);
                debugData.upcomingSuccess = true;
                debugData.upcomingResponse = upcomingResponse;
                console.log('✅ Upcoming hotel bookings loaded:', upcomingData.length, 'bookings');
            } catch (err) {
                console.warn('⚠️ Failed to fetch upcoming hotel bookings:', err.message);
                debugData.errors.push(`Upcoming: ${err.message}`);
            }

            // Try to fetch all bookings
            try {
                console.log('📋 Fetching all hotel bookings...');
                const allResponse = await fetchAllHotelBookings();
                allData = formatHotelBookingData(allResponse, false);
                debugData.allBookingsSuccess = true;
                debugData.allResponse = allResponse;
                console.log('✅ All hotel bookings loaded:', allData.length, 'bookings');
            } catch (err) {
                console.warn('⚠️ Failed to fetch all hotel bookings:', err.message);
                debugData.errors.push(`All bookings: ${err.message}`);
            }

            // Update state with loaded data
            console.log('🔄 Updating state with hotel booking data...');
            console.log('📅 Upcoming bookings to set:', upcomingData.length, upcomingData);
            console.log('📋 All bookings to set:', allData.length, allData);

            setUpcomingBookings([...upcomingData]); // Force new array
            setAllBookings([...allData]); // Force new array
            setDebugInfo(debugData);

            // Show success or partial success message
            if (upcomingData.length > 0 || allData.length > 0) {
                console.log('✅ Successfully loaded hotel booking data - Upcoming:', upcomingData.length, 'All:', allData.length);
            } else if (debugData.errors.length === 0) {
                console.log('ℹ️ No hotel bookings found in API response');
            }

        } catch (error) {
            console.error('❌ Error loading hotel bookings:', error);
            setError(error.message || 'Failed to load hotel booking history. Please try again.');
            setDebugInfo({ error: error.message, fullError: error });
        } finally {
            setLoading(false);
        }
    };

    // Load bookings when component mounts
    useEffect(() => {
        loadHotelBookings();
    }, []);

    // Get current bookings based on selected type
    const getCurrentBookings = () => {
        console.log('🎯 Getting current hotel bookings for type:', bookingType);
        console.log('📅 Upcoming bookings available:', upcomingBookings.length, upcomingBookings);
        console.log('📋 All bookings available:', allBookings.length, allBookings);

        if (bookingType === 'upcoming') {
            console.log('🎯 Returning upcoming hotel bookings:', upcomingBookings);
            return upcomingBookings;
        }
        console.log('🎯 Returning all hotel bookings:', allBookings);
        return allBookings;
    };

    const currentBookings = getCurrentBookings();
    console.log('🎯 Current hotel bookings for display:', currentBookings.length, currentBookings);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString || dateString === 'N/A') return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Format amount for display
    const formatAmount = (amount) => {
        if (!amount || amount === '0') return '₹0';
        if (typeof amount === 'string' && amount.startsWith('₹')) return amount;
        return `₹${amount}`;
    };

    // Render loading state
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your hotel bookings...</p>
                    <p className="text-gray-400 text-sm">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Hotel Bookings</h2>
                <button
                    onClick={loadHotelBookings}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <span className="text-red-500 text-xl mr-2">⚠️</span>
                        <div>
                            <h3 className="text-red-800 font-medium">Error Loading Hotel Bookings</h3>
                            <p className="text-red-600 mt-1">{error}</p>
                            <button
                                onClick={loadHotelBookings}
                                className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Info */}
            {debugInfo && debugInfo.errors && debugInfo.errors.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>Debug Info:</strong> {debugInfo.errors.join(', ')}
                </div>
            )}

            {/* Booking Type Tabs */}
            <div className="flex w-full mb-6 gap-2">
                <button
                    className={`flex-1 text-center px-4 py-2 rounded transition-all duration-200 font-medium
                        ${bookingType === 'upcoming'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                    onClick={() => setBookingType('upcoming')}
                >
                    Upcoming Bookings
                    {upcomingBookings.length > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-white text-green-500 rounded-full">
                            {upcomingBookings.length}
                        </span>
                    )}
                </button>
                <button
                    className={`flex-1 text-center px-4 py-2 rounded transition-all duration-200 font-medium
                        ${bookingType === 'all'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                    onClick={() => setBookingType('all')}
                >
                    All Bookings
                    {allBookings.length > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-white text-green-500 rounded-full">
                            {allBookings.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Hotel Bookings Table */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booking ID</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hotel Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">City</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Check-in</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Check-out</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nights</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rooms</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Guests</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Room Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Confirmation No.</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booked On</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-50">
                            {console.log('🎨 Rendering table rows for:', currentBookings.length, 'hotel bookings')}
                            {currentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="15" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl mb-4">🏨</span>
                                            <span className="text-lg font-medium text-gray-600">No hotel bookings found</span>
                                            <span className="text-sm text-gray-400 mt-1">
                                                {bookingType === 'upcoming'
                                                    ? 'Your upcoming hotel stays will appear here'
                                                    : 'Your hotel booking history will appear here'
                                                }
                                            </span>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Debug: Upcoming={upcomingBookings.length}, All={allBookings.length}, Current={currentBookings.length}
                                            </div>
                                            <button
                                                onClick={loadHotelBookings}
                                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Refresh Bookings
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentBookings.map((booking, index) => {
                                    console.log(`🎨 Rendering row ${index + 1}:`, booking);
                                    return (
                                        <tr key={booking.bookingId || index} className="border-b border-gray-200 hover:bg-gray-100">
                                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                                {booking.bookingId}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                <div className="max-w-xs truncate" title={booking.hotelName}>
                                                    {booking.hotelName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Code: {booking.hotelCode}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {booking.city}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {formatDate(booking.checkInDate)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {formatDate(booking.checkOutDate)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {booking.numberOfRooms}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {booking.numberOfGuests}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <div className="max-w-xs truncate" title={booking.roomType}>
                                                    {booking.roomType}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                                {booking.confirmationNo}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`font-medium ${
                                                    booking.bookingStatus?.toLowerCase() === 'confirmed' ? 'text-green-600' :
                                                    booking.bookingStatus?.toLowerCase() === 'processing' ? 'text-orange-600' :
                                                    booking.bookingStatus?.toLowerCase() === 'cancelled' ? 'text-red-600' :
                                                    'text-blue-600'
                                                }`}>
                                                    {booking.bookingStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {formatAmount(booking.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`font-medium ${
                                                    booking.paymentStatus?.toLowerCase() === 'completed' ? 'text-green-600' :
                                                    booking.paymentStatus?.toLowerCase() === 'processing' ? 'text-orange-600' :
                                                    booking.paymentStatus?.toLowerCase() === 'failed' ? 'text-red-600' :
                                                    'text-blue-600'
                                                }`}>
                                                    {booking.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {booking.createdAt}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <button
                                                    onClick={() => {
                                                        console.log('View hotel booking details:', booking);
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
                                                >
                                                    <span className="mr-1">👁️</span>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination info */}
            {currentBookings.length > 0 && (
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                    <span>
                        Page 1 of 1, total {currentBookings.length} record{currentBookings.length !== 1 ? 's' : ''} found
                    </span>
                    {currentBookings.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">1</span>
                        </div>
                    )}
                </div>
            )}

            {/* Summary Cards */}
            {(upcomingBookings.length > 0 || allBookings.length > 0) && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</div>
                        <div className="text-sm text-blue-800">Upcoming Stays</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{allBookings.length}</div>
                        <div className="text-sm text-green-800">Total Hotel Bookings</div>
                    </div>
                </div>
            )}

            {/* Guest Information Display - Show for first booking if available */}
            {currentBookings.length > 0 && currentBookings[0].leadGuestName !== 'N/A' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Latest Booking Guest Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-600">Guest Name:</span>
                            <div className="text-gray-900">{currentBookings[0].leadGuestName}</div>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Contact:</span>
                            <div className="text-gray-900">{currentBookings[0].contactNumber}</div>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Email:</span>
                            <div className="text-gray-900">{currentBookings[0].email}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hotel Booking Statistics */}
            {currentBookings.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {currentBookings.reduce((total, booking) => total + parseInt(booking.numberOfRooms || 1), 0)}
                            </div>
                            <div className="text-gray-600">Total Rooms</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {currentBookings.reduce((total, booking) => total + (booking.nights || 1), 0)}
                            </div>
                            <div className="text-gray-600">Total Nights</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {currentBookings.filter(booking => booking.bookingStatus?.toLowerCase() === 'confirmed').length}
                            </div>
                            <div className="text-gray-600">Confirmed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                ₹{currentBookings.reduce((total, booking) => total + parseInt(booking.totalAmount || 0), 0)}
                            </div>
                            <div className="text-gray-600">Total Value</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelBookingHistory;