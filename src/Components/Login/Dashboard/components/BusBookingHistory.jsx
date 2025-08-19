import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../../Context/AuthContext';
import { downloadBusInvoice } from '../../../APIS/BusApi/BusApis'; // Import your existing API
import { toast } from 'react-toastify';

// API configuration
const API_BASE_URL = "https://api.rasutrip.com/api/v1";

const BusBookingHistory = () => {
    const { user } = useContext(AuthContext); // Get user from context
    const [bookingType, setBookingType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [userType, setUserType] = useState(null); // customer or  agent
    const [debugInfo, setDebugInfo] = useState(null);
    const [downloadingInvoices, setDownloadingInvoices] = useState(new Set()); // Track downloading states

    // Detect user type from multiple sources
    const detectUserType = () => {
        console.log('🔍 Detecting user type...');
        console.log('👤 User from context:', user);

        // Method 1: Check localStorage for userType
        const storedUserType = localStorage.getItem('userType') || localStorage.getItem('user_type');
        console.log('💾 Stored user type:', storedUserType);

        // Method 2: Check token key patterns (from your login components)
        let detectedType = null;

        // Check for customer token patterns
        const customerTokenKeys = ['token', 'authToken', 'customer_token', 'customerToken'];
        const hasCustomerToken = customerTokenKeys.some(key => localStorage.getItem(key));

        // Check for agent token patterns
        const agentTokenKeys = ['agent_token', 'agentToken', 'agent_auth_token'];
        const hasAgentToken = agentTokenKeys.some(key => localStorage.getItem(key));

        console.log('🏪 Customer token found:', hasCustomerToken);
        console.log('🏢 Agent token found:', hasAgentToken);

        // Method 3: Check user context properties
        if (user) {
            // Check if user has agent-specific properties
            if (user.isAgent || user.userType === 'agent' || user.role === 'agent') {
                detectedType = 'agent';
            } else if (user.isCustomer || user.userType === 'customer' || user.role === 'customer') {
                detectedType = 'customer';
            }
        }

        // Priority logic for user type detection
        if (storedUserType) {
            detectedType = storedUserType.toLowerCase();
        } else if (hasAgentToken && !hasCustomerToken) {
            detectedType = 'agent';
        } else if (hasCustomerToken && !hasAgentToken) {
            detectedType = 'customer';
        } else if (detectedType) {
            // Use context-based detection
        } else {
            // Default fallback - assume customer if we have any token
            const hasAnyToken = localStorage.getItem('token') || localStorage.getItem('authToken');
            detectedType = hasAnyToken ? 'customer' : null;
        }

        console.log('✅ Final detected user type:', detectedType);
        return detectedType;
    };

    // Enhanced authentication headers with user type awareness
    const getAuthHeaders = () => {
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
        }

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Type': currentUserType || 'customer', // Send user type in headers
        };
    };

    // API call function with user type awareness
    const makeAuthenticatedRequest = async (url, method = 'GET', data = null) => {
        try {
            console.log(`🚀 Making ${method} request to:`, url);
            console.log('👤 Current user type:', userType);

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
                        throw new Error(`Authentication failed for ${userType || 'user'}. Please login again.`);
                    case 403:
                        throw new Error(`Access denied. ${userType === 'agent' ? 'Agent' : 'Customer'} permissions required.`);
                    case 404:
                        throw new Error('Booking service endpoint not found.');
                    default:
                        throw new Error(`Request failed with status ${response.status}`);
                }
            }

            const responseData = await response.json();
            console.log('✅ API Response data:', responseData);
            return responseData;

        } catch (error) {
            console.error('❌ API Request failed:', error);
            throw error;
        }
    };

    // User type specific API endpoints
    const getBookingEndpoints = (currentUserType) => {
        console.log('🎯 Getting endpoints for user type:', currentUserType);

        if (currentUserType === 'agent') {
            return {
                upcoming: `${API_BASE_URL}/agent/bus-bookings/upcoming`, // Agent-specific endpoint
                all: `${API_BASE_URL}/agent/bus-bookings/all`, // Agent-specific endpoint
                // Fallback to customer endpoints if agent endpoints don't exist
                upcomingFallback: `${API_BASE_URL}/busservice/up-comming-bookings`,
                allFallback: `${API_BASE_URL}/busservice/my-bookings`
            };
        } else {
            return {
                upcoming: `${API_BASE_URL}/busservice/up-comming-bookings`, // Customer endpoints
                all: `${API_BASE_URL}/busservice/my-bookings` // Customer endpoints
            };
        }
    };

    // Fetch upcoming bookings with user type awareness
    const fetchUpcomingBookings = async () => {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType);

        console.log('🚀 Fetching upcoming bookings for:', currentUserType);

        try {
            return await makeAuthenticatedRequest(endpoints.upcoming);
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.upcomingFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                return await makeAuthenticatedRequest(endpoints.upcomingFallback);
            }
            throw error;
        }
    };

    // Fetch all bookings with user type awareness
    const fetchAllBookings = async () => {
        const currentUserType = userType || detectUserType();
        const endpoints = getBookingEndpoints(currentUserType);

        console.log('🚀 Fetching all bookings for:', currentUserType);

        try {
            return await makeAuthenticatedRequest(endpoints.all);
        } catch (error) {
            // Try fallback for agents if available
            if (currentUserType === 'agent' && endpoints.allFallback) {
                console.log('⚠️ Trying fallback endpoint for agent...');
                return await makeAuthenticatedRequest(endpoints.allFallback);
            }
            throw error;
        }
    };

    // Enhanced data formatting with user type context
    const formatBookingData = (apiResponse, isUpcoming = false) => {
        console.log('📊 Formatting booking data for user type:', userType);
        console.log('📊 Raw API response:', apiResponse);

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
            } else {
                console.warn('⚠️ No array found in response object:', apiResponse);
                return [];
            }
        } else {
            console.warn('⚠️ Unknown response structure:', apiResponse);
            return [];
        }

        console.log('📋 Bookings array extracted:', bookingsArray.length, 'items');

        const formattedBookings = bookingsArray.map((bookingWrapper, index) => {
            // Extract booking data (might be nested in "Result" field)
            const booking = bookingWrapper.Result || bookingWrapper;

            // Enhanced booking ID extraction with user type prefix
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

            // Extract route information
            const fromCity = booking.Origin || booking.FromCity || booking.fromCity ||
                booking.from || booking.origin || booking.source || 'N/A';
            const toCity = booking.Destination || booking.ToCity || booking.toCity ||
                booking.to || booking.destination || 'N/A';

            // Extract travel date
            const travelDate = booking.DateOfJourney || booking.TravelDate || booking.travelDate ||
                booking.departureDate || booking.journeyDate || booking.date || 'N/A';

            // Extract bus information
            const busType = booking.BusType || booking.busType || booking.TravelName ||
                booking.operator || booking.busName || booking.serviceName || 'N/A';

            // Extract seat information from Passenger array
            let seatNumber = 'N/A';
            if (booking.Passenger && Array.isArray(booking.Passenger) && booking.Passenger.length > 0) {
                const seats = booking.Passenger.map(p => p.SeatName || p.seatName).filter(Boolean);
                seatNumber = seats.join(', ') || 'N/A';
            } else {
                seatNumber = booking.SeatNumbers || booking.seatNumbers || booking.seats ||
                    booking.seatNumber || booking.SeatName || 'N/A';
            }

            // Extract other booking details
            const ticketNo = booking.TicketNo || booking.ticketNo || booking.ticketNumber ||
                booking.ticket || 'N/A';
            const pnr = booking.TravelOperatorPNR || booking.PNR || booking.pnr ||
                booking.referenceNumber || booking.confirmationNumber || 'N/A';
            const bookingStatus = booking.Status || booking.status || booking.bookingStatus || 'Confirmed';

            // Extract amount information
            const totalAmount = bookingWrapper.RasuTripInvoiceAmount || booking.InvoiceAmount ||
                booking.TotalAmount || booking.totalAmount || booking.amount ||
                booking.fare || booking.price || booking.Price?.PublishedPrice ||
                booking.Price?.OfferedPrice || '0';

            // Extract passenger information
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

            // Extract payment and booking dates
            const paymentStatus = booking.PaymentStatus || booking.paymentStatus ||
                (bookingStatus === 'Confirmed' ? 'Completed' : 'Processing');
            const createdAt = bookingWrapper.createdAt || booking.BookingDate || booking.bookingDate ||
                booking.InvoiceCreatedOn || booking.createdAt || booking.created_at ||
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

            // Extract SearchTokenId for invoice download
            const searchTokenId = bookingWrapper.SearchTokenId ||
                booking.SearchTokenId ||
                booking.searchTokenId ||
                booking.token_id ||
                null;

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
                status: String(bookingStatus), // For backward compatibility
                passengerName: String(passengerName),
                contactNumber: String(contactNumber),
                paymentStatus: String(paymentStatus),
                createdAt: formatCreatedDate(createdAt),
                bookingDate: formatCreatedDate(createdAt),
                userType: userType || 'customer', // Add user type to booking data
                searchTokenId: searchTokenId, // Add for invoice download
                rawData: bookingWrapper // Keep original data for debugging
            };

            console.log(`✅ Formatted booking ${index + 1} for ${userType}:`, formattedBooking);
            return formattedBooking;
        });

        console.log('📊 All formatted bookings:', formattedBookings.length, 'items');
        return formattedBookings;
    };

    // Main function to load bookings with user type awareness
    const loadBookings = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo(null);

        // Detect and set user type
        const detectedUserType = detectUserType();
        setUserType(detectedUserType);

        console.log('🚀 Loading bookings for user type:', detectedUserType);

        // Check authentication
        if (!detectedUserType) {
            setError('Unable to determine user type. Please login again.');
            setLoading(false);
            return;
        }

        const headers = getAuthHeaders();
        if (!headers.Authorization || headers.Authorization === 'Bearer null') {
            setError(`Please login as ${detectedUserType} to view booking history.`);
            setLoading(false);
            return;
        }

        try {
            let upcomingData = [];
            let allData = [];
            let debugData = {
                userType: detectedUserType,
                upcomingSuccess: false,
                allBookingsSuccess: false,
                errors: []
            };

            // Fetch upcoming bookings
            try {
                console.log('📅 Fetching upcoming bookings...');
                const upcomingResponse = await fetchUpcomingBookings();
                upcomingData = formatBookingData(upcomingResponse, true);
                debugData.upcomingSuccess = true;
                debugData.upcomingResponse = upcomingResponse;
                console.log(`✅ Upcoming bookings loaded for ${detectedUserType}:`, upcomingData.length);
            } catch (err) {
                console.warn('⚠️ Failed to fetch upcoming bookings:', err.message);
                debugData.errors.push(`Upcoming: ${err.message}`);
            }

            // Fetch all bookings
            try {
                console.log('📋 Fetching all bookings...');
                const allResponse = await fetchAllBookings();
                allData = formatBookingData(allResponse, false);
                debugData.allBookingsSuccess = true;
                debugData.allResponse = allResponse;
                console.log(`✅ All bookings loaded for ${detectedUserType}:`, allData.length);
            } catch (err) {
                console.warn('⚠️ Failed to fetch all bookings:', err.message);
                debugData.errors.push(`All bookings: ${err.message}`);
            }

            // Update state
            setUpcomingBookings([...upcomingData]);
            setAllBookings([...allData]);
            setDebugInfo(debugData);

            if (upcomingData.length > 0 || allData.length > 0) {
                console.log(`✅ Successfully loaded ${detectedUserType} booking data - Upcoming: ${upcomingData.length}, All: ${allData.length}`);
            } else if (debugData.errors.length === 0) {
                console.log(`ℹ️ No bookings found for ${detectedUserType}`);
            }

        } catch (error) {
            console.error(`❌ Error loading ${detectedUserType} bookings:`, error);
            setError(error.message || `Failed to load ${detectedUserType} booking history. Please try again.`);
            setDebugInfo({ userType: detectedUserType, error: error.message, fullError: error });
        } finally {
            setLoading(false);
        }
    };

    // Load bookings when component mounts or user changes
    useEffect(() => {
        loadBookings();
    }, [user]); // Re-load when user context changes

    // Enhanced Invoice download function with better error handling
    const handleDownloadInvoice = async (booking) => {
        const bookingId = booking.bookingId;

        console.log('📄 Starting invoice download process for booking:', bookingId);
        console.log('📤 Booking data:', booking);

        // Validation checks
        if (!booking.searchTokenId) {
            console.error('❌ SearchTokenId not available for booking:', bookingId);
            toast.error('Cannot download invoice - SearchTokenId not available for this booking');
            return;
        }

        // Check if already downloading
        if (downloadingInvoices.has(bookingId)) {
            console.warn('⚠️ Invoice already being downloaded for booking:', bookingId);
            return;
        }

        // Add booking to downloading set
        setDownloadingInvoices(prev => new Set(prev.add(bookingId)));

        try {
            // Prepare invoice data with enhanced information
            const invoiceData = {
                UserIp: "122.161.64.143", // You might want to get actual user IP
                SearchTokenId: booking.searchTokenId,
                BookingId: String(bookingId),
                receiverEmail: user?.email ||
                    user?.mail ||
                    booking.contactNumber ||
                    "support@rasutrip.com"
            };

            console.log('📤 Invoice download data prepared:', invoiceData);

            // Show loading toast
            const loadingToastId = toast.loading('Downloading invoice...');

            // Call your existing API
            const result = await downloadBusInvoice(invoiceData);

            console.log('✅ Invoice download API result:', result);

            // Dismiss loading toast
            toast.dismiss(loadingToastId);

            // Handle different response scenarios
            if (result && result.success) {
                if (result.downloaded) {
                    toast.success('Invoice downloaded successfully!');
                } else if (result.alreadyExists) {
                    toast.success('Invoice already generated and sent to email!');
                } else if (result.sent) {
                    toast.success('Invoice has been sent to your email!');
                } else {
                    toast.success('Invoice processed successfully!');
                }
            } else if (result && result.message) {
                // Handle API error messages
                toast.error(`Invoice download failed: ${result.message}`);
            } else {
                toast.error('Failed to download invoice. Please try again.');
            }

        } catch (error) {
            console.error('❌ Invoice download error:', error);

            // Handle different error types
            if (error.message) {
                toast.error(`Failed to download invoice: ${error.message}`);
            } else if (error.response?.data?.message) {
                toast.error(`Invoice download failed: ${error.response.data.message}`);
            } else {
                toast.error('Failed to download invoice. Please check your internet connection and try again.');
            }
        } finally {
            // Remove booking from downloading set
            setDownloadingInvoices(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookingId);
                return newSet;
            });
        }
    };

    // Get current bookings based on selected type
    const getCurrentBookings = () => {
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

    // Get user type display name
    const getUserTypeDisplay = () => {
        return userType === 'agent' ? 'Agent' : 'Customer';
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

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {/* Header with user type indicator */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Bus Bookings</h2>
                    <p className="text-gray-600 text-sm mt-1">Manage your {getUserTypeDisplay().toLowerCase()} bookings and download invoices</p>
                </div>
                <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {getUserTypeDisplay()}
                    </span>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <span className="text-red-500 text-xl mr-2">⚠️</span>
                        <div>
                            <h3 className="text-red-800 font-medium">Error Loading {getUserTypeDisplay()} Bookings</h3>
                            <p className="text-red-600 mt-1">{error}</p>
                            <button
                                onClick={loadBookings}
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
            <div className="flex w-full mb-6 gap-2">
                <button
                    className={`flex-1 text-center px-4 py-2 rounded transition-all duration-200 font-medium
                        ${bookingType === 'upcoming'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                    onClick={() => setBookingType('upcoming')}
                >
                    Upcoming Trips
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-50">
                            {currentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-4 py-12 text-center">
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
                                                onClick={loadBookings}
                                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Refresh Bookings
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (

                                currentBookings.map((booking, index) => (
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
                                        <td className="px-4 py-3 text-sm">
                                            <button
                                                onClick={() => handleDownloadInvoice(booking)}
                                                disabled={downloadingInvoices.has(booking.bookingId)}
                                                className={`px-3 py-1 rounded text-white text-xs ${downloadingInvoices.has(booking.bookingId)
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-blue-500 hover:bg-blue-600"
                                                    }`}
                                            >
                                                {downloadingInvoices.has(booking.bookingId) ? "Downloading..." : "Download Invoice"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>




            {/* Footer with user context info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                        Logged in as: {getUserTypeDisplay()}
                        {user?.mobile && ` (${user.mobile})`}
                        {user?.name && ` - ${user.name}`}
                    </span>
                    <span>
                        Last updated: {new Date().toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BusBookingHistory;