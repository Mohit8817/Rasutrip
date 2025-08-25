import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import {
    fetchUpcomingHotelBookings,
    fetchAllHotelBookings,
    getHotelUserType,
    isHotelUserAuthenticated,
    fetchHotelRealTimeStatus,
    fetchMultipleHotelRealTimeStatus
} from "../../services/bookingApi"; // Update this path according to your project structure

const HotelBookingHistory = () => {
    const [bookingType, setBookingType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [debugInfo, setDebugInfo] = useState(null);
    const [userRole, setUserRole] = useState('customer');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first, 'asc' for oldest first

    // Real-time status states
    const [realTimeStatuses, setRealTimeStatuses] = useState({});
    const [loadingStatuses, setLoadingStatuses] = useState(new Set());
    const [initialStatusLoaded, setInitialStatusLoaded] = useState(false);

    // Get user role on component mount
    useEffect(() => {
        const role = getHotelUserType();
        setUserRole(role || 'customer');
    }, []);

    // Handle real-time status check for single hotel booking
    const handleRealTimeCheck = async (booking) => {
        const bookingId = booking.bookingId;

        if (!bookingId) {
            toast.error('No booking ID available for real-time check');
            return;
        }

        setLoadingStatuses(prev => new Set(prev.add(bookingId)));

        try {
            const result = await fetchHotelRealTimeStatus(booking, userRole);

            setRealTimeStatuses(prev => ({
                ...prev,
                [bookingId]: result
            }));

            if (result.success) {
                toast.success('Real-time status updated!');
            } else {
                toast.error(`Failed to update status: ${result.error}`);
            }

        } catch (error) {
            console.error('Error in real-time status check:', error);
            toast.error('Failed to fetch real-time status');
        } finally {
            setLoadingStatuses(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookingId);
                return newSet;
            });
        }
    };

    // Auto-fetch real-time status for all current hotel bookings
    const autoFetchRealTimeStatus = async (bookings = null) => {
        const currentBookings = bookings || getCurrentBookings();

        // Only fetch for confirmed/active hotel bookings
        const activeBookings = currentBookings.filter(booking =>
            booking.bookingStatus?.toLowerCase() === 'confirmed' ||
            booking.bookingStatus?.toLowerCase() === 'booked'
        );

        if (activeBookings.length === 0) {
            console.log('No active hotel bookings found for real-time status check');
            setInitialStatusLoaded(true);
            return;
        }

        console.log(`Auto-fetching real-time status for ${activeBookings.length} active hotel bookings`);

        // Add all booking IDs to loading state
        const bookingIds = activeBookings.map(b => b.bookingId);
        setLoadingStatuses(prev => new Set([...prev, ...bookingIds]));

        try {
            const results = await fetchMultipleHotelRealTimeStatus(activeBookings, userRole);
            setRealTimeStatuses(prev => ({
                ...prev,
                ...results
            }));
            setInitialStatusLoaded(true);
        } catch (error) {
            console.error('Error in auto-fetch hotel real-time status:', error);
        } finally {
            // Remove all booking IDs from loading state
            setLoadingStatuses(prev => {
                const newSet = new Set(prev);
                bookingIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    };

    // Format hotel booking data with enhanced confirmation number mapping
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
            const possibleArrays = Object.values(apiResponse).filter(Array.isArray);
            if (possibleArrays.length > 0) {
                bookingsArray = possibleArrays[0];
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

        const formattedBookings = bookingsArray.map((bookingWrapper, index) => {
            console.log(`🏨 Processing hotel booking ${index + 1}:`, bookingWrapper);

            const booking = bookingWrapper.Result || bookingWrapper;
            console.log(`🏨 Actual hotel booking data for ${index + 1}:`, booking);

            // Enhanced booking ID mapping
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
                booking.userId ||
                `HTL${Date.now()}${index}`;

            // Enhanced confirmation number mapping
            const confirmationNo =
                // First priority: Direct confirmation fields
                booking.ConfirmationNo ||
                booking.confirmationNumber ||
                booking.confirmation_no ||
                booking.confirmationNo ||
                booking.ConfirmationNumber ||

                // Second priority: Reference/PNR fields
                booking.referenceNumber ||
                booking.ReferenceNumber ||
                booking.reference_number ||
                booking.PNR ||
                booking.pnr ||
                booking.Pnr ||

                // Third priority: Booking reference fields
                booking.BookingReference ||
                booking.bookingReference ||
                booking.booking_reference ||
                booking.BookingRef ||
                booking.bookingRef ||

                // Fourth priority: Hotel-specific confirmation fields
                booking.HotelConfirmationNo ||
                booking.hotelConfirmationNo ||
                booking.hotel_confirmation_no ||
                booking.HotelReference ||
                booking.hotelReference ||

                // Fifth priority: Use booking ID if no confirmation found
                bookingWrapper.bookingId ||
                booking.BookingId ||
                booking.bookingId ||

                // Final fallback
                'PENDING';

            console.log(`🔍 Confirmation number mapping for booking ${index + 1}: ${confirmationNo}`);

            // Hotel information mapping
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

            const city = booking.City ||
                booking.city ||
                booking.location ||
                booking.destination ||
                booking.CityName ||
                'N/A';

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

            // Room type and guest count logic
            let roomType = 'N/A';
            let numberOfRooms = '1';
            let numberOfGuests = 'N/A';

            if (booking.HotelRoomsDetails && Array.isArray(booking.HotelRoomsDetails) && booking.HotelRoomsDetails.length > 0) {
                const firstRoom = booking.HotelRoomsDetails[0];

                roomType = firstRoom.RoomTypeName ||
                    firstRoom.RoomType ||
                    firstRoom.roomTypeName ||
                    firstRoom.roomType ||
                    booking.RoomType ||
                    'Standard Room';

                numberOfRooms = booking.HotelRoomsDetails.length.toString();

                let totalGuests = 0;
                booking.HotelRoomsDetails.forEach(room => {
                    if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
                        totalGuests += room.HotelPassenger.length;
                    }
                });
                numberOfGuests = totalGuests > 0 ? totalGuests.toString() : 'N/A';
            }

            const bookingStatus = booking.Status ||
                booking.status ||
                booking.bookingStatus ||
                booking.BookingStatus ||
                booking.confirmationStatus ||
                'Confirmed';

            const totalAmount = bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                '0';

            // Lead guest information
            let leadGuestName = 'N/A';
            let contactNumber = 'N/A';
            let email = 'N/A';

            if (booking.HotelRoomsDetails && Array.isArray(booking.HotelRoomsDetails) && booking.HotelRoomsDetails.length > 0) {
                const firstRoom = booking.HotelRoomsDetails[0];
                if (firstRoom.HotelPassenger && Array.isArray(firstRoom.HotelPassenger) && firstRoom.HotelPassenger.length > 0) {
                    const leadGuest = firstRoom.HotelPassenger.find(p => p.LeadPassenger === "true") || firstRoom.HotelPassenger[0];
                    leadGuestName = `${leadGuest.Title || ''} ${leadGuest.FirstName || ''} ${leadGuest.LastName || ''}`.trim();
                    contactNumber = leadGuest.Phoneno || leadGuest.phone || 'N/A';
                    email = leadGuest.Email || leadGuest.email || 'N/A';
                }
            }

            const paymentStatus = booking.PaymentStatus ||
                booking.paymentStatus ||
                (bookingStatus === 'Confirmed' ? 'Completed' : 'Processing');

            const createdAt = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.createdAt ||
                new Date().toISOString();

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

            // Extract SearchTokenId for hotel voucher/confirmation download
            const searchTokenId = bookingWrapper.SearchTokenId ||
                booking.SearchTokenId ||
                booking.searchTokenId ||
                booking.token_id ||
                null;

            const formattedBooking = {
                bookingId: String(bookingId),
                hotelName: String(hotelName),
                hotelCode: String(hotelCode),
                city: String(city),
                checkInDate: String(checkInDate),
                checkOutDate: String(checkOutDate),
                roomType: String(roomType),
                numberOfRooms: String(numberOfRooms),
                numberOfGuests: String(numberOfGuests),
                nights: nights,
                confirmationNo: String(confirmationNo),
                bookingStatus: String(bookingStatus),
                totalAmount: String(totalAmount),
                leadGuestName: String(leadGuestName),
                contactNumber: String(contactNumber),
                email: String(email),
                paymentStatus: String(paymentStatus),
                createdAt: formatCreatedDate(createdAt),
                rawCreatedDate: new Date(createdAt),
                // Agent/customer fields
                bookedByRole: booking.bookedByRole || userRole || 'customer',
                isAgentBooking: booking.isAgentBooking || userRole === 'agent',
                bookingSource: booking.bookingSource || (userRole === 'agent' ? 'AGENT_PORTAL' : 'CUSTOMER_PORTAL'),
                searchTokenId: searchTokenId, // Add for voucher download
                rawData: bookingWrapper
            };

            console.log(`Hotel booking ${index + 1} formatted with confirmation: ${confirmationNo}`, formattedBooking);
            return formattedBooking;
        });

        return formattedBookings;
    };

    // Sort bookings by date function
    const sortBookingsByDate = (bookings, order = 'desc') => {
        console.log(`Sorting ${bookings.length} hotel bookings by date (${order})`);

        const sortedBookings = [...bookings].sort((a, b) => {
            const dateA = a.rawCreatedDate || new Date(a.createdAt || 0);
            const dateB = b.rawCreatedDate || new Date(b.createdAt || 0);

            if (order === 'desc') {
                return dateB - dateA; // Newest first
            } else {
                return dateA - dateB; // Oldest first
            }
        });

        return sortedBookings;
    };

    // Main function to load hotel bookings using the service
    const loadHotelBookings = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo(null);
        setInitialStatusLoaded(false); // Reset status loading flag

        // Check authentication
        if (!isHotelUserAuthenticated()) {
            setError('Please login to view your hotel booking history.');
            setLoading(false);
            return;
        }

        try {
            console.log('Starting to load hotel bookings using service...');

            let upcomingData = [];
            let allData = [];
            let debugData = {
                upcomingSuccess: false,
                allBookingsSuccess: false,
                errors: []
            };

            // Try to fetch upcoming bookings
            try {
                console.log('Fetching upcoming hotel bookings...');
                const upcomingResponse = await fetchUpcomingHotelBookings(userRole);

                if (upcomingResponse.success) {
                    upcomingData = formatHotelBookingData(upcomingResponse.data, true);
                    upcomingData = sortBookingsByDate(upcomingData, sortOrder);
                    debugData.upcomingSuccess = true;
                    debugData.upcomingResponse = upcomingResponse.data;
                    console.log('Upcoming hotel bookings loaded:', upcomingData.length, 'bookings');
                }
            } catch (err) {
                console.warn('Failed to fetch upcoming hotel bookings:', err.message);
                debugData.errors.push(`Upcoming: ${err.message || 'Unknown error'}`);
            }

            // Try to fetch all bookings
            try {
                console.log('Fetching all hotel bookings...');
                const allResponse = await fetchAllHotelBookings(userRole);

                if (allResponse.success) {
                    allData = formatHotelBookingData(allResponse.data, false);
                    allData = sortBookingsByDate(allData, sortOrder);
                    debugData.allBookingsSuccess = true;
                    debugData.allResponse = allResponse.data;
                    console.log('All hotel bookings loaded:', allData.length, 'bookings');
                }
            } catch (err) {
                console.warn('Failed to fetch all hotel bookings:', err.message);
                debugData.errors.push(`All bookings: ${err.message || 'Unknown error'}`);
            }

            // Update state with loaded data
            console.log('Updating state with hotel booking data...');
            setUpcomingBookings([...upcomingData]);
            setAllBookings([...allData]);
            setDebugInfo(debugData);

            // Immediately fetch real-time status for the loaded bookings
            const allLoadedBookings = [...upcomingData, ...allData];
            if (allLoadedBookings.length > 0) {
                console.log('Immediately fetching real-time status for loaded hotel bookings...');
                setTimeout(() => {
                    autoFetchRealTimeStatus(allLoadedBookings);
                }, 500); // Small delay to ensure state is updated
            } else {
                setInitialStatusLoaded(true);
            }

            // Show success or partial success message
            if (upcomingData.length > 0 || allData.length > 0) {
                console.log('Successfully loaded hotel booking data - Upcoming:', upcomingData.length, 'All:', allData.length);
            } else if (debugData.errors.length === 0) {
                console.log('No hotel bookings found in API response');
            }

        } catch (error) {
            console.error('Error loading hotel bookings:', error);
            setError(error.message || 'Failed to load hotel booking history. Please try again.');
            setDebugInfo({ error: error.message, fullError: error });
            setInitialStatusLoaded(true);
        } finally {
            setLoading(false);
        }
    };

    // Load bookings when component mounts
    useEffect(() => {
        loadHotelBookings();
    }, []);

    // Re-sort when sort order changes
    useEffect(() => {
        if (upcomingBookings.length > 0) {
            setUpcomingBookings(prev => sortBookingsByDate(prev, sortOrder));
        }
        if (allBookings.length > 0) {
            setAllBookings(prev => sortBookingsByDate(prev, sortOrder));
        }
    }, [sortOrder]);

    // Auto-refresh real-time status every 5 minutes (only after initial load)
    useEffect(() => {
        if (!initialStatusLoaded) return;

        const interval = setInterval(() => {
            console.log('Auto-refreshing hotel real-time status...');
            autoFetchRealTimeStatus();
        }, 300000); // 5 minutes for hotels

        return () => clearInterval(interval);
    }, [allBookings, upcomingBookings, initialStatusLoaded]);

    // Get current bookings based on selected type
    const getCurrentBookings = () => {
        console.log('Getting current hotel bookings for type:', bookingType);
        if (bookingType === 'upcoming') {
            return upcomingBookings;
        }
        return allBookings;
    };

    const currentBookings = getCurrentBookings();

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

    // Handle sort order toggle
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const statusLower = String(status).toLowerCase();

        switch (statusLower) {
            case 'confirmed':
            case 'booked':
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'checked-in':
            case 'in-stay':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
            case 'checked-out':
                return 'bg-purple-100 text-purple-700';
            case 'cancelled':
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'no-show':
            case 'waiting':
                return 'bg-yellow-100 text-yellow-700';
            case 'pending':
            case 'processing':
                return 'bg-orange-100 text-orange-700';
            case 'error':
                return 'bg-red-100 text-red-700';
            case 'unknown':
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Render real-time status for hotel bookings
    const renderRealTimeStatus = (booking) => {
        const bookingId = booking.bookingId;
        const isLoading = loadingStatuses.has(bookingId);
        const statusData = realTimeStatuses[bookingId];

        // Show loading initially if we haven't loaded statuses yet
        if (!initialStatusLoaded && !statusData &&
            (booking.bookingStatus?.toLowerCase() === 'confirmed' ||
                booking.bookingStatus?.toLowerCase() === 'booked')) {
            return (
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-xs text-gray-500">Loading...</span>
                </div>
            );
        }

        // Show manual loading when button is clicked
        if (isLoading) {
            return (
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-xs text-gray-500">Checking...</span>
                </div>
            );
        }

        if (statusData?.error) {
            return (
                <div className="flex flex-col items-start">
                    <span className="text-xs text-red-500">Error: {statusData.error}</span>
                    <button
                        onClick={() => handleRealTimeCheck(booking)}
                        className="mt-1 text-xs text-blue-500 hover:text-blue-700"
                        title="Retry"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (statusData?.status && statusData.success) {
            return (
                <div className="flex flex-col items-start">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusData.status)}`}>
                        {statusData.status}
                    </span>
                    <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">
                            {statusData.lastUpdated.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        <button
                            onClick={() => handleRealTimeCheck(booking)}
                            className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                            title="Refresh Status"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            );
        }

        // For non-confirmed bookings or when no status available
        const isConfirmed = booking.bookingStatus?.toLowerCase() === 'confirmed' ||
            booking.bookingStatus?.toLowerCase() === 'booked';

        if (!isConfirmed) {
            return (
                <div className="flex items-center">
                    <span className="text-xs text-gray-400">Not applicable</span>
                </div>
            );
        }

        return (
            <div className="flex items-center">
                <span className="text-xs text-gray-400">No live data</span>
                <button
                    onClick={() => handleRealTimeCheck(booking)}
                    className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                    title="Check Status"
                >
                    Check
                </button>
            </div>
        );
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
                <div>
                    <h5 className="text-2xl font-bold text-gray-800">My Hotel Bookings</h5>
                </div>

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
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                                    onClick={toggleSortOrder}
                                    title="Click to change sort order">
                                    Booked On {sortOrder === 'desc' ? '↓' : '↑'}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Real-Time Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-50">
                            {console.log('Rendering table rows for:', currentBookings.length, 'hotel bookings')}
                            {currentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="16" className="px-4 py-12 text-center">
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
                                                <br />
                                                Sort Order: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
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
                                    console.log(`Rendering row ${index + 1}:`, booking);
                                    return (
                                        <tr key={`${booking.bookingId}-${index}`} className="border-b border-gray-200 hover:bg-gray-100">
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                    {booking.bookingStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {formatAmount(booking.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`font-medium ${booking.paymentStatus?.toLowerCase() === 'completed' ? 'text-green-600' :
                                                    booking.paymentStatus?.toLowerCase() === 'processing' ? 'text-orange-600' :
                                                        booking.paymentStatus?.toLowerCase() === 'failed' ? 'text-red-600' :
                                                            'text-blue-600'
                                                    }`}>
                                                    {booking.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{booking.createdAt}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <button
                                                    onClick={() => {
                                                        console.log('View hotel booking details:', booking);
                                                        // You can add your view details logic here
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
                                                >
                                                    <span className="mr-1">👁️</span>
                                                    View
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {renderRealTimeStatus(booking)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};

export default HotelBookingHistory;