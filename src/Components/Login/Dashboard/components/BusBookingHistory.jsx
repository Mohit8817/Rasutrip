import React, { useState, useEffect } from "react";

// API configuration
const API_BASE_URL = "https://api.rasutrip.com/api/v1";

const BusBookingHistory = () => {
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
            // Use memory-based storage for artifacts
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
                        throw new Error('Booking service endpoint not found.');
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

    // Fetch upcoming bus bookings
    const fetchUpcomingBusBookings = async () => {
        console.log('🚀 Fetching upcoming bus bookings...');
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/busservice/up-comming-bookings`);
        return response;
    };

    // Fetch all bus bookings
    const fetchAllBusBookings = async () => {
        console.log('🚀 Fetching all bus bookings...');
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/busservice/my-bookings`);
        return response;
    };

    // Enhanced data formatting with comprehensive field mapping - OLD CODE STYLE
    const formatBusBookingData = (apiResponse, isUpcoming = false) => {
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

        console.log('📋 Bookings array extracted:', bookingsArray);
        console.log('📋 Array length:', bookingsArray.length);

        const formattedBookings = bookingsArray.map((bookingWrapper, index) => {
            console.log(`🎫 Processing booking ${index + 1}:`, bookingWrapper);

            // Extract the actual booking data - it might be nested in "Result" field
            const booking = bookingWrapper.Result || bookingWrapper;
            console.log(`🎫 Actual booking data for ${index + 1}:`, booking);

            // Use the outer bookingId if available, otherwise try to find it in the Result
            const bookingId = bookingWrapper.bookingId ||
                bookingWrapper.BookingId ||
                booking.BookingId ||
                booking.bookingId ||
                booking.booking_id ||
                booking.id ||
                booking.Id ||
                booking.referenceId ||
                booking.confirmationId ||
                `BUS${Date.now()}${index}`;

            // Extract route information from the Result object
            const fromCity = booking.Origin ||
                booking.FromCity ||
                booking.fromCity ||
                booking.from ||
                booking.origin ||
                booking.source ||
                'N/A';

            const toCity = booking.Destination ||
                booking.ToCity ||
                booking.toCity ||
                booking.to ||
                booking.destination ||
                'N/A';

            // Extract travel date - it's in DateOfJourney
            const travelDate = booking.DateOfJourney ||
                booking.TravelDate ||
                booking.travelDate ||
                booking.departureDate ||
                booking.journeyDate ||
                booking.date ||
                'N/A';

            // Extract bus information - FOR OLD CODE COMPATIBILITY
            const busType = booking.BusType ||
                booking.busType ||
                booking.TravelName ||
                booking.operator ||
                booking.busName ||
                booking.serviceName ||
                'N/A';

            // Extract seat information - from Passenger array - FOR OLD CODE COMPATIBILITY
            let seatNumber = 'N/A';
            if (booking.Passenger && Array.isArray(booking.Passenger) && booking.Passenger.length > 0) {
                // Get all seat names from passengers
                const seats = booking.Passenger.map(p => p.SeatName || p.seatName).filter(Boolean);
                seatNumber = seats.join(', ') || 'N/A';
            } else {
                seatNumber = booking.SeatNumbers ||
                    booking.seatNumbers ||
                    booking.seats ||
                    booking.seatNumber ||
                    booking.SeatName ||
                    'N/A';
            }

            // Extract ticket number
            const ticketNo = booking.TicketNo ||
                booking.ticketNo ||
                booking.ticketNumber ||
                booking.ticket ||
                'N/A';

            // Extract PNR
            const pnr = booking.TravelOperatorPNR ||
                booking.PNR ||
                booking.pnr ||
                booking.referenceNumber ||
                booking.confirmationNumber ||
                'N/A';

            // Extract booking status
            const bookingStatus = booking.Status ||
                booking.status ||
                booking.bookingStatus ||
                'Confirmed';

            // Extract amount information - from the outer wrapper or Result.Price
            const totalAmount = bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                booking.Price?.PublishedPrice ||
                booking.Price?.OfferedPrice ||
                '0';

            // Extract passenger information - FOR OLD CODE COMPATIBILITY
            let passengerName = 'N/A';
            if (booking.Passenger && Array.isArray(booking.Passenger) && booking.Passenger.length > 0) {
                const leadPassenger = booking.Passenger.find(p => p.LeadPassenger) || booking.Passenger[0];
                passengerName = `${leadPassenger.FirstName || ''} ${leadPassenger.LastName || ''}`.trim() ||
                    leadPassenger.name ||
                    'N/A';
            } else {
                passengerName = booking.PassengerName ||
                    booking.passengerName ||
                    booking.leadPassengerName ||
                    booking.name ||
                    'N/A';
            }

            // Extract contact information - FOR OLD CODE COMPATIBILITY
            let contactNumber = 'N/A';
            if (booking.Passenger && Array.isArray(booking.Passenger) && booking.Passenger.length > 0) {
                const leadPassenger = booking.Passenger.find(p => p.LeadPassenger) || booking.Passenger[0];
                contactNumber = leadPassenger.Phoneno || leadPassenger.phone || 'N/A';
            } else {
                contactNumber = booking.ContactNumber ||
                    booking.contactNumber ||
                    booking.mobile ||
                    booking.phone ||
                    'N/A';
            }

            // Extract payment status
            const paymentStatus = booking.PaymentStatus ||
                booking.paymentStatus ||
                (bookingStatus === 'Confirmed' ? 'Completed' : 'Processing');

            // Extract booking created date
            const createdAt = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.createdAt ||
                booking.created_at ||
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

            const formattedBooking = {
                bookingId: String(bookingId),
                from: String(fromCity),
                to: String(toCity),
                travelDate: String(travelDate),
                busType: String(busType), // OLD CODE COMPATIBILITY
                seatNumber: String(seatNumber), // OLD CODE COMPATIBILITY
                ticketNo: String(ticketNo),
                pnr: String(pnr),
                bookingStatus: String(bookingStatus),
                totalAmount: String(totalAmount),
                status: String(bookingStatus), // OLD CODE COMPATIBILITY
                passengerName: String(passengerName), // OLD CODE COMPATIBILITY
                contactNumber: String(contactNumber), // OLD CODE COMPATIBILITY
                paymentStatus: String(paymentStatus),
                createdAt: formatCreatedDate(createdAt),
                bookingDate: formatCreatedDate(createdAt), // OLD CODE COMPATIBILITY
                rawData: bookingWrapper // Keep original data for debugging
            };

            console.log(`✅ Formatted booking ${index + 1}:`, formattedBooking);
            return formattedBooking;
        });

        console.log('📊 All formatted bookings:', formattedBookings);
        return formattedBookings;
    };

    // Main function to load bus bookings - OLD CODE STYLE WITH SEPARATE ENDPOINTS
    const loadBusBookings = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo(null);

        // Check authentication
        const tokenKeys = ['authToken', 'token', 'accessToken', 'jwt', 'userToken'];
        const hasToken = tokenKeys.some(key => 
            window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key)
        );

        if (!hasToken) {
            setError('Please login to view your booking history.');
            setLoading(false);
            return;
        }

        try {
            console.log('🚀 Starting to load bus bookings...');

            let upcomingData = [];
            let allData = [];
            let debugData = {
                upcomingSuccess: false,
                allBookingsSuccess: false,
                errors: []
            };

            // Try to fetch upcoming bookings - LIKE OLD CODE
            try {
                console.log('📅 Fetching upcoming bookings...');
                const upcomingResponse = await fetchUpcomingBusBookings();
                upcomingData = formatBusBookingData(upcomingResponse, true);
                debugData.upcomingSuccess = true;
                debugData.upcomingResponse = upcomingResponse;
                console.log('✅ Upcoming bookings loaded:', upcomingData.length, 'bookings');
            } catch (err) {
                console.warn('⚠️ Failed to fetch upcoming bookings:', err.message);
                debugData.errors.push(`Upcoming: ${err.message}`);
            }

            // Try to fetch all bookings - LIKE OLD CODE
            try {
                console.log('📋 Fetching all bookings...');
                const allResponse = await fetchAllBusBookings();
                allData = formatBusBookingData(allResponse, false);
                debugData.allBookingsSuccess = true;
                debugData.allResponse = allResponse;
                console.log('✅ All bookings loaded:', allData.length, 'bookings');
            } catch (err) {
                console.warn('⚠️ Failed to fetch all bookings:', err.message);
                debugData.errors.push(`All bookings: ${err.message}`);
            }

            // Update state with loaded data - LIKE OLD CODE
            console.log('🔄 Updating state with booking data...');
            console.log('📅 Upcoming bookings to set:', upcomingData.length, upcomingData);
            console.log('📋 All bookings to set:', allData.length, allData);

            setUpcomingBookings([...upcomingData]); // Force new array
            setAllBookings([...allData]); // Force new array
            setDebugInfo(debugData);

            // Show success or partial success message
            if (upcomingData.length > 0 || allData.length > 0) {
                console.log('✅ Successfully loaded booking data - Upcoming:', upcomingData.length, 'All:', allData.length);
            } else if (debugData.errors.length === 0) {
                console.log('ℹ️ No bookings found in API response');
            }

        } catch (error) {
            console.error('❌ Error loading bus bookings:', error);
            setError(error.message || 'Failed to load booking history. Please try again.');
            setDebugInfo({ error: error.message, fullError: error });
        } finally {
            setLoading(false);
        }
    };

    // Load bookings when component mounts
    useEffect(() => {
        loadBusBookings();
    }, []);

    // Get current bookings based on selected type - LIKE OLD CODE
    const getCurrentBookings = () => {
        console.log('🎯 Getting current bookings for type:', bookingType);
        console.log('📅 Upcoming bookings available:', upcomingBookings.length, upcomingBookings);
        console.log('📋 All bookings available:', allBookings.length, allBookings);

        if (bookingType === 'upcoming') {
            console.log('🎯 Returning upcoming bookings:', upcomingBookings);
            return upcomingBookings;
        }
        console.log('🎯 Returning all bookings:', allBookings);
        return allBookings;
    };

    const currentBookings = getCurrentBookings();
    console.log('🎯 Current bookings for display:', currentBookings.length, currentBookings);

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
                    <p className="text-gray-600 text-lg">Loading your bus bookings...</p>
                    <p className="text-gray-400 text-sm">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Bus Bookings</h2>
                <button
                    onClick={loadBusBookings}
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
                            <h3 className="text-red-800 font-medium">Error Loading Bookings</h3>
                            <p className="text-red-600 mt-1">{error}</p>
                            <button
                                onClick={loadBusBookings}
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

            {/* Booking Type Tabs - LIKE OLD CODE */}
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

            {/* Bookings Table - NEW CODE STYLE WITH OLD CODE DATA */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ref. No.</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Origin City</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Destination City</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Departure Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bus Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Seat No.</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ticket No.</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PNR</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booking Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-50">
                            {console.log('🎨 Rendering table rows for:', currentBookings.length, 'bookings')}
                            {currentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="13" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl mb-4">🚌</span>
                                            <span className="text-lg font-medium text-gray-600">No bus bookings found</span>
                                            <span className="text-sm text-gray-400 mt-1">
                                                {bookingType === 'upcoming'
                                                    ? 'Your upcoming bus trips will appear here'
                                                    : 'Your bus booking history will appear here'
                                                }
                                            </span>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Debug: Upcoming={upcomingBookings.length}, All={allBookings.length}, Current={currentBookings.length}
                                            </div>
                                            <button
                                                onClick={loadBusBookings}
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
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {booking.bookingId}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                {booking.from}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                {booking.to}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {formatDate(booking.travelDate)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {booking.busType}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                {booking.seatNumber}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {booking.ticketNo || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {booking.pnr || 'N/A'}
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
                                                        console.log('View booking details:', booking);
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

            {/* Summary Cards - LIKE OLD CODE */}
            {(upcomingBookings.length > 0 || allBookings.length > 0) && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</div>
                        <div className="text-sm text-blue-800">Upcoming Trips</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{allBookings.length}</div>
                        <div className="text-sm text-green-800">Total Bookings</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusBookingHistory;