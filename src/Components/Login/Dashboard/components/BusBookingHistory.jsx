import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../../Context/AuthContext';
import { toast } from 'react-toastify';
import { Button } from "react-bootstrap";

import {
    fetchUpcomingBookings,
    fetchAllBookings,
    fetchAllBookingsComplete, // Import the new complete fetch function
    getUserType,
    isUserAuthenticated,
    fetchRealTimeStatus,
    fetchMultipleRealTimeStatus,
    busInvoiceServices
} from '../../services/bookingApi';

const BusBookingHistory = () => {
    const { user } = useContext(AuthContext);
    const [bookingType, setBookingType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [userType, setUserType] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);

    // API Pagination states - track pagination from API response
    const [upcomingPagination, setUpcomingPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    const [allPagination, setAllPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    // Client-side pagination states - for displaying the current data
    const [currentPageUpcoming, setCurrentPageUpcoming] = useState(1);
    const [currentPageAll, setCurrentPageAll] = useState(1);
    const itemsPerPage = 10;

    // Real-time status states
    const [realTimeStatuses, setRealTimeStatuses] = useState({});
    const [loadingStatuses, setLoadingStatuses] = useState(new Set());

    // Status popup states
    const [statusPopup, setStatusPopup] = useState({
        isOpen: false,
        booking: null,
        loading: false,
        data: null,
        error: null
    });

    // Get current pagination info based on active tab
    const getCurrentPagination = () => {
        return bookingType === 'upcoming' ? upcomingPagination : allPagination;
    };

    // Get current page based on active tab
    const getCurrentPage = () => {
        return bookingType === 'upcoming' ? currentPageUpcoming : currentPageAll;
    };

    // Set current page based on active tab
    const setCurrentPage = (page) => {
        if (bookingType === 'upcoming') {
            setCurrentPageUpcoming(page);
        } else {
            setCurrentPageAll(page);
        }
    };

    // Get current bookings based on active tab
    const getCurrentBookings = () => {
        return bookingType === 'upcoming' ? upcomingBookings : allBookings;
    };

    // Get paginated bookings for display
    const getPaginatedBookings = () => {
        const bookings = getCurrentBookings();
        const currentPage = getCurrentPage();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        console.log("Current bookings for display:", bookings.length);

        return {
            paginatedBookings: bookings.slice(startIndex, endIndex),
            totalPages: Math.ceil(bookings.length / itemsPerPage),
            totalItems: bookings.length,
            currentPage: currentPage
        };
    };

    // Handle tab change
    const handleTabChange = (newBookingType) => {
        setBookingType(newBookingType);
        // Reset to first page when switching tabs
        if (newBookingType === 'upcoming') {
            setCurrentPageUpcoming(1);
        } else {
            setCurrentPageAll(1);
        }
    };

    // Handle pagination change - this will trigger new API calls
    const handleApiPaginationChange = (page) => {
        if (bookingType === 'upcoming') {
            setUpcomingPagination(prev => ({ ...prev, page }));
            loadUpcomingBookings(page);
        } else {
            setAllPagination(prev => ({ ...prev, page }));
            loadAllBookings(page);
        }
    };

    // Load all bookings from all pages (for complete data)
    const loadAllBookingsComplete = async () => {
        setLoading(true);
        setError(null);

        try {
            const detectedUserType = getUserType();
            setUserType(detectedUserType);

            if (!detectedUserType || !isUserAuthenticated(detectedUserType)) {
                throw new Error(`Please login as ${detectedUserType || 'user'} to view booking history.`);
            }

            console.log('Loading complete bus bookings for user type:', detectedUserType);

            // Fetch all bookings from all pages
            const allResponse = await fetchAllBookingsComplete(detectedUserType, 50); // Higher limit per page
            
            if (allResponse.success) {
                const formattedBookings = formatBookingData(allResponse.data, false);
                setAllBookings(formattedBookings);
                setAllPagination({
                    page: 1,
                    limit: formattedBookings.length,
                    total: allResponse.pagination.total,
                    totalPages: 1 // Since we have all data
                });
                console.log(`All ${formattedBookings.length} bookings loaded successfully`);
            } else {
                throw new Error(allResponse.message);
            }

            // Also load upcoming bookings
            await loadUpcomingBookings(1);

        } catch (error) {
            console.error('Error loading complete bookings:', error);
            setError(error.message || 'Failed to load booking history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load upcoming bookings with API pagination
    const loadUpcomingBookings = async (page = 1) => {
        try {
            const detectedUserType = getUserType();
            console.log('Loading upcoming bookings - Page:', page);

            const upcomingResponse = await fetchUpcomingBookings(detectedUserType, page, 10);
            
            if (upcomingResponse.success) {
                const formattedBookings = formatBookingData(upcomingResponse.data, true);
                
                if (page === 1) {
                    // Replace data for first page
                    setUpcomingBookings(formattedBookings);
                } else {
                    // Append data for subsequent pages
                    setUpcomingBookings(prev => [...prev, ...formattedBookings]);
                }
                
                setUpcomingPagination(upcomingResponse.pagination);
                console.log(`Upcoming bookings loaded - Page ${page}:`, formattedBookings.length);
            }
        } catch (error) {
            console.warn('Failed to fetch upcoming bookings:', error.message);
        }
    };

    // Load all bookings with API pagination
    const loadAllBookings = async (page = 1) => {
        try {
            const detectedUserType = getUserType();
            console.log('Loading all bookings - Page:', page);

            const allResponse = await fetchAllBookings(detectedUserType, page, 10);
            
            if (allResponse.success) {
                const formattedBookings = formatBookingData(allResponse.data, false);
                
                if (page === 1) {
                    // Replace data for first page
                    setAllBookings(formattedBookings);
                } else {
                    // Append data for subsequent pages
                    setAllBookings(prev => [...prev, ...formattedBookings]);
                }
                
                setAllPagination(allResponse.pagination);
                console.log(`All bookings loaded - Page ${page}:`, formattedBookings.length);
            }
        } catch (error) {
            console.warn('Failed to fetch all bookings:', error.message);
        }
    };

    const handleInvoiceSend = (bookingIdForInvoice, UserIpForInvoice, SearchTokenIdForInvoice, passengerEmailForInvoice) => {
        busInvoiceServices({
            bookingId: bookingIdForInvoice,
            userIp: UserIpForInvoice,
            searchTokenId: SearchTokenIdForInvoice,
            receiverEmail: passengerEmailForInvoice
        });
        alert(`Invoice download initiated for booking: ${bookingIdForInvoice}`);
    };

    // Function to fetch detailed booking status for popup
    const fetchDetailedBookingStatus = async (booking) => {
        setStatusPopup(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await fetchRealTimeStatus(booking, userType);

            const detailedData = {
                bookingInfo: {
                    bookingId: booking.bookingId,
                    pnr: booking.pnr,
                    ticketNo: booking.ticketNo,
                    route: `${booking.from} → ${booking.to}`,
                    travelDate: booking.travelDate,
                    busType: booking.busType,
                    seatNumber: booking.seatNumber,
                    passengerName: booking.passengerName,
                    contactNumber: booking.contactNumber,
                    totalAmount: booking.totalAmount,
                    bookingStatus: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                    bookingDate: booking.bookingDate
                },
                realTimeStatus: result.success ? {
                    currentStatus: result.status,
                    lastUpdated: result.lastUpdated || new Date(),
                    busLocation: result.location || 'Not available',
                    estimatedArrival: result.estimatedArrival || 'Not available',
                    delay: result.delay || 'On time',
                    nextStop: result.nextStop || 'Not available'
                } : null,
                error: result.success ? null : result.error
            };

            setStatusPopup(prev => ({
                ...prev,
                data: detailedData,
                loading: false
            }));

            if (result.success) {
                toast.success('Status details updated!');
            } else {
                toast.warn('Some status information may not be available');
            }

        } catch (error) {
            console.error('Error fetching detailed status:', error);
            setStatusPopup(prev => ({
                ...prev,
                error: error.message || 'Failed to fetch detailed status',
                loading: false
            }));
            toast.error('Failed to fetch detailed status');
        }
    };

    // Open status popup
    const openStatusPopup = (booking) => {
        setStatusPopup({
            isOpen: true,
            booking: booking,
            loading: false,
            data: null,
            error: null
        });
        fetchDetailedBookingStatus(booking);
    };

    // Close status popup
    const closeStatusPopup = () => {
        setStatusPopup({
            isOpen: false,
            booking: null,
            loading: false,
            data: null,
            error: null
        });
    };

    // Handle real-time status check for single booking
    const handleRealTimeCheck = async (booking) => {
        const bookingId = booking.bookingId;

        if (!bookingId) {
            toast.error('No booking ID available for real-time check');
            return;
        }

        setLoadingStatuses(prev => new Set(prev.add(bookingId)));

        try {
            const result = await fetchRealTimeStatus(booking, userType);

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

    // Auto-fetch real-time status for all current bookings
    const autoFetchRealTimeStatus = async () => {
        const { paginatedBookings } = getPaginatedBookings();

        const activeBookings = paginatedBookings.filter(booking =>
            booking.bookingStatus?.toLowerCase() === 'confirmed' ||
            booking.status?.toLowerCase() === 'confirmed'
        );

        if (activeBookings.length === 0) {
            console.log('No active bookings found for real-time status check');
            return;
        }

        console.log(`Auto-fetching real-time status for ${activeBookings.length} active bookings`);

        try {
            const results = await fetchMultipleRealTimeStatus(activeBookings, userType);
            setRealTimeStatuses(prev => ({
                ...prev,
                ...results
            }));
        } catch (error) {
            console.error('Error in auto-fetch real-time status:', error);
        }
    };

    // Enhanced data formatting with user type context
    const formatBookingData = (apiResponse, isUpcoming = false) => {
        console.log('Formatting booking data for user type:', userType);
        console.log('Raw API response:', apiResponse);

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
            } else {
                console.warn('No array found in response object:', apiResponse);
                return [];
            }
        } else {
            console.warn('Unknown response structure:', apiResponse);
            return [];
        }

        console.log('Bookings array extracted:', bookingsArray.length, 'items');

        const formattedBookings = bookingsArray.map((bookingWrapper, index) => {
            const booking = bookingWrapper.Result || bookingWrapper;

            const rawBookingId = bookingWrapper.bookingId ||
                bookingWrapper.BookingId ||
                booking.BookingId ||
                booking.bookingId ||
                booking.booking_id ||
                booking.id ||
                booking.Id ||
                booking.referenceId ||
                booking.confirmationId ||
                `${userType?.toUpperCase() || 'BUS'}${Date.now()}${index}`;

            const bookingId = String(rawBookingId);

            const fromCity = booking.Origin || booking.FromCity || booking.fromCity ||
                booking.from || booking.origin || booking.source || 'N/A';
            const toCity = booking.Destination || booking.ToCity || booking.toCity ||
                booking.to || booking.destination || 'N/A';

            const travelDate = booking.DateOfJourney || booking.TravelDate || booking.travelDate ||
                booking.departureDate || booking.journeyDate || booking.date || 'N/A';

            const busType = booking.BusType || booking.busType || booking.TravelName ||
                booking.operator || booking.busName || booking.serviceName || 'N/A';

            let seatNumber = 'N/A';
            if (booking.Passenger && Array.isArray(booking.Passenger) && booking.Passenger.length > 0) {
                const seats = booking.Passenger.map(p => p.SeatName || p.seatName).filter(Boolean);
                seatNumber = seats.join(', ') || 'N/A';
            } else {
                seatNumber = booking.SeatNumbers || booking.seatNumbers || booking.seats ||
                    booking.seatNumber || booking.SeatName || 'N/A';
            }

            const ticketNo = booking.TicketNo || booking.ticketNo || booking.ticketNumber ||
                booking.ticket || 'N/A';
            const pnr = booking.TravelOperatorPNR || booking.PNR || booking.pnr ||
                booking.referenceNumber || booking.confirmationNumber || 'N/A';
            const bookingStatus = booking.Status || booking.status || booking.bookingStatus || 'Confirmed';

            const totalAmount = bookingWrapper.RasuTripInvoiceAmount || booking.InvoiceAmount ||
                booking.TotalAmount || booking.totalAmount || booking.amount ||
                booking.fare || booking.price || booking.Price?.PublishedPrice ||
                booking.Price?.OfferedPrice || '0';

            let passengerName = 'N/A';
            let contactNumber = 'N/A';
            if (booking.Passenger && Array.isArray(booking.Passenger) && booking.Passenger.length > 0) {
                const leadPassenger = booking.Passenger.find(p => p.LeadPassenger) || booking.Passenger[0];
                passengerName = `${leadPassenger.FirstName || ''} ${leadPassenger.LastName || ''}`.trim() ||
                    leadPassenger.name || 'N/A';
                contactNumber = leadPassenger.Phoneno || leadPassenger.phone || 'N/A';
            } else {
                passengerName = booking.PassengerName || booking.passengerName ||
                    booking.leadPassengerName || booking.name || 'N/A';
                contactNumber = booking.ContactNumber || booking.contactNumber ||
                    booking.mobile || booking.phone || 'N/A';
            }

            const paymentStatus = booking.PaymentStatus || booking.paymentStatus ||
                (bookingStatus === 'Confirmed' ? 'Completed' : 'Processing');
            const createdAt = bookingWrapper.createdAt || booking.BookingDate || booking.bookingDate ||
                booking.InvoiceCreatedOn || booking.createdAt || booking.created_at ||
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

            const formattedBooking = {
                bookingId: String(bookingId),
                from: String(fromCity),
                to: String(toCity),
                travelDate: String(travelDate),
                busType: String(busType),
                seatNumber: String(seatNumber),
                ticketNo: String(ticketNo),
                pnr: String(pnr),
                bookingStatus: String(bookingStatus),
                totalAmount: String(totalAmount),
                status: String(bookingStatus),
                passengerName: String(passengerName),
                contactNumber: String(contactNumber),
                paymentStatus: String(paymentStatus),
                createdAt: formatCreatedDate(createdAt),
                bookingDate: formatCreatedDate(createdAt),
                userType: userType || 'customer',
                rawData: bookingWrapper
            };

            console.log(`Formatted booking ${index + 1} for ${userType}:`, formattedBooking);
            return formattedBooking;
        });

        console.log('All formatted bookings:', formattedBookings.length, 'items');
        return formattedBookings;
    };

    // Load bookings when component mounts or user changes
    useEffect(() => {
        loadAllBookingsComplete(); // Load all bookings from all pages
    }, [user]);

    // Auto-refresh real-time status every 3 minutes for current page only
    useEffect(() => {
        const interval = setInterval(() => {
            autoFetchRealTimeStatus();
        }, 180000); // 3 minutes

        return () => clearInterval(interval);
    }, [allBookings, upcomingBookings, getCurrentPage()]);

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

    // Get user type display name
    const getUserTypeDisplay = () => {
        return userType === 'agent' ? 'Agent' : 'Customer';
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const statusLower = String(status).toLowerCase();

        switch (statusLower) {
            case 'confirmed':
            case 'booked':
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'departed':
            case 'in-transit':
            case 'running':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
            case 'arrived':
                return 'bg-purple-100 text-purple-700';
            case 'cancelled':
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'delayed':
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

    // Render real-time status
    const renderRealTimeStatus = (booking) => {
        const bookingId = booking.bookingId;
        const isLoading = loadingStatuses.has(bookingId);
        const statusData = realTimeStatuses[bookingId];

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
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => handleRealTimeCheck(booking)}
                            className="text-xs text-blue-500 hover:text-blue-700"
                            title="Retry"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => openStatusPopup(booking)}
                            className="text-xs text-green-500 hover:text-green-700"
                            title="View Details"
                        >
                            Status
                        </button>
                    </div>
                </div>
            );
        }

        if (statusData?.status && statusData.success) {
            return (
                <div className="flex flex-col items-start">
                    <div className="flex items-center mt-1 gap-2">
                        <button
                            onClick={() => openStatusPopup(booking)}
                            className="text-xs text-green-500 hover:text-green-700 font-medium"
                            title="View Details"
                        >
                            Status
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => openStatusPopup(booking)}
                    className="text-xs text-green-500 hover:text-green-700 font-medium"
                    title="View Details"
                >
                    Status
                </button>
            </div>
        );
    };

    // Pagination Component
    const PaginationComponent = () => {
        const { totalPages, currentPage, totalItems } = getPaginatedBookings();

        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                }
            }

            return pages;
        };

        return (
            <div className="float-right flex-col sm:flex-row px-6 py-4 border-t border-gray-200 bg-gray-50">
                {/* Show API pagination info */}
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600">
                        Showing {getCurrentBookings().length} of {getCurrentPagination().total} total bookings
                        {getCurrentPagination().totalPages > 1 && (
                            <span className="ml-2">
                                (API has {getCurrentPagination().totalPages} pages total)
                            </span>
                        )}
                    </div>
                    {getCurrentPagination().totalPages > 1 && getCurrentBookings().length < getCurrentPagination().total && (
                        <button
                            onClick={() => loadAllBookingsComplete()}
                            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                            Load All Bookings ({getCurrentPagination().total})
                        </button>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                        Previous
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => page !== '...' && setCurrentPage(page)}
                            disabled={page === '...'}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                page === currentPage
                                    ? 'bg-red-500 text-white'
                                    : page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    {/* Next Button */}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    // Status Popup Component
    const StatusPopup = () => {
        if (!statusPopup.isOpen) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
            >
                <div
                    className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
                    style={{
                        maxWidth: 'min(95vw, 1024px)',
                        zIndex: 10000
                    }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h3 className="text-xl font-bold text-gray-800">
                            Booking Status Details
                        </h3>
                        <button
                            onClick={closeStatusPopup}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            title="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {statusPopup.loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-600">Loading booking details...</p>
                            </div>
                        ) : statusPopup.error ? (
                            <div className="text-center py-12">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <h4 className="text-lg font-medium text-red-600 mb-2">Error Loading Details</h4>
                                <p className="text-gray-600 mb-4">{statusPopup.error}</p>
                                <button
                                    onClick={() => fetchDetailedBookingStatus(statusPopup.booking)}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : statusPopup.data ? (
                            <div className="space-y-6">
                                {/* Booking Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Booking Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Bus Type</label>
                                            <p className="text-sm text-gray-800">{statusPopup.data.bookingInfo.busType}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Seat Number(s)</label>
                                            <p className="text-sm text-gray-800">{statusPopup.data.bookingInfo.seatNumber}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Passenger Name</label>
                                            <p className="text-sm text-gray-800">{statusPopup.data.bookingInfo.passengerName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                                            <p className="text-sm text-gray-800">{statusPopup.data.bookingInfo.contactNumber}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                                            <p className="text-sm font-bold text-green-600">{formatAmount(statusPopup.data.bookingInfo.totalAmount)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Booking Status</label>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusPopup.data.bookingInfo.bookingStatus)}`}>
                                                {statusPopup.data.bookingInfo.bookingStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusPopup.data.bookingInfo.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {statusPopup.data.bookingInfo.paymentStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Booking Date</label>
                                            <p className="text-sm text-gray-800">{statusPopup.data.bookingInfo.bookingDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-Time Status */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold text-gray-800">Real-Time Status</h4>
                                        <button
                                            onClick={() => fetchDetailedBookingStatus(statusPopup.booking)}
                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                            disabled={statusPopup.loading}
                                        >
                                            {statusPopup.loading ? 'Refreshing...' : 'Refresh Status'}
                                        </button>
                                    </div>

                                    {statusPopup.data.realTimeStatus ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Current Status</label>
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusPopup.data.realTimeStatus.currentStatus)}`}>
                                                    {statusPopup.data.realTimeStatus.currentStatus}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                                                <p className="text-sm text-gray-800">
                                                    {new Date(statusPopup.data.realTimeStatus.lastUpdated).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Bus Location</label>
                                                <p className="text-sm text-gray-800">{statusPopup.data.realTimeStatus.busLocation}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Estimated Arrival</label>
                                                <p className="text-sm text-gray-800">{statusPopup.data.realTimeStatus.estimatedArrival}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Delay Status</label>
                                                <p className="text-sm text-gray-800">{statusPopup.data.realTimeStatus.delay}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Next Stop</label>
                                                <p className="text-sm text-gray-800">{statusPopup.data.realTimeStatus.nextStop}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Real-time status not available</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {statusPopup.data.error || 'Status tracking may not be supported for this booking'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Information */}
                                <div className="bg-yellow-50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Important Information</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <div className="text-yellow-500 mr-3 mt-1">ℹ️</div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    <strong>Real-time tracking:</strong> Status updates are fetched from the bus operator's system and may have delays.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="text-blue-500 mr-3 mt-1">📱</div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    <strong>Contact Support:</strong> For immediate assistance, please contact our support team with your booking ID.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="text-green-500 mr-3 mt-1">🎫</div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    <strong>E-ticket:</strong> Please carry a valid ID along with your e-ticket during travel.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📄</div>
                                <p className="text-gray-600">No booking details available</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                        <button
                            onClick={closeStatusPopup}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your {getUserTypeDisplay().toLowerCase()} bus bookings...</p>
                    <p className="text-gray-400 text-sm">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    const { paginatedBookings, totalPages, totalItems, currentPage } = getPaginatedBookings();

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {/* Header with user type indicator */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h5 className="text-2xl font-bold text-gray-800">My Bus Bookings</h5>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <div>
                            <h3 className="text-red-800 font-medium">Error Loading {getUserTypeDisplay()} Bookings</h3>
                            <p className="text-red-600 mt-1">{error}</p>
                            <button
                                onClick={loadAllBookingsComplete}
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
                    <strong>Debug Info ({debugInfo.userType}):</strong> {debugInfo.errors.join(', ')}
                </div>
            )}

            {/* Booking Type Tabs */}
            <div className="flex w-full mb-6 bg-gray-50 p-2 shadow-sm">
                <button
                    className={`flex-1 text-center rounded-lg transition-all duration-300 font-semibold text-sm
                ${bookingType === 'upcoming'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70'}
            `}
                    onClick={() => handleTabChange('upcoming')}
                >
                    Upcoming Bookings
                    {upcomingBookings.length > 0 && (
                        <span className={`ml-2 px-2.5 py-1 text-xs rounded-full font-bold
                    ${bookingType === 'upcoming'
                                ? 'bg-white text-red-500'
                                : 'bg-red-100 text-red-600'}
                `}>
                            {upcomingBookings.length}
                        </span>
                    )}
                </button>

                <button
                    className={`flex-1 text-center px-6 py-2 rounded-lg transition-all duration-300 font-semibold text-sm
                ${bookingType === 'all'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70'}
            `}
                    onClick={() => handleTabChange('all')}
                >
                    All Bookings
                    {allBookings.length > 0 && (
                        <span className={`ml-2 px-2.5 py-1 text-xs rounded-full font-bold
                    ${bookingType === 'all'
                                ? 'bg-white text-red-500'
                                : 'bg-red-100 text-red-600'}
                `}>
                            {allBookings.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booking ID</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Route</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Travel Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bus Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Seats</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Passenger</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Real-Time Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-50">
                            {paginatedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl mb-4">🚌</span>
                                            <span className="text-lg font-medium text-gray-600">
                                                No {getUserTypeDisplay().toLowerCase()} bookings found
                                            </span>
                                            <span className="text-sm text-gray-400 mt-1">
                                                {bookingType === 'upcoming'
                                                    ? `Your upcoming trips as ${getUserTypeDisplay().toLowerCase()} will appear here`
                                                    : `Your booking history as ${getUserTypeDisplay().toLowerCase()} will appear here`
                                                }
                                            </span>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Type: {userType} | Upcoming: {upcomingBookings.length} | All: {allBookings.length}
                                            </div>
                                            <button
                                                onClick={loadAllBookingsComplete}
                                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Refresh Bookings
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedBookings.map((booking, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="px-4 py-3 text-sm text-gray-700">{booking.bookingId}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {booking.from} → {booking.to}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(booking.travelDate)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{booking.busType}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{booking.seatNumber}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{booking.passengerName}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-green-600">
                                            {formatAmount(booking.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${booking.bookingStatus.toLowerCase() === "confirmed"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {booking.bookingStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{booking.createdAt}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            <div>
                                                <Button
                                                    onClick={() => handleInvoiceSend(booking.rawData.bookingId, booking.rawData.UserIp, booking.rawData.SearchTokenId, booking.rawData.Result.Passenger?.[0].Email)}
                                                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs btn-red"
                                                >Invoice</Button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {renderRealTimeStatus(booking)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <PaginationComponent />
            </div>

            {/* Status Popup */}
            <StatusPopup />
        </div>
    );
};

export default BusBookingHistory;