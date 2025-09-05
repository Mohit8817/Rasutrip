// hooks/useAgentBookingStats.js - Simplified for booking history only
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../Context/AuthContext';

import {
    fetchAllBookings,
    getUserType,
    isUserAuthenticated
} from '../../services/bookingApi';

import {
    fetchAllHotelBookings,
    getHotelUserType,
    isHotelUserAuthenticated
} from '../../services/bookingApi';

import {
    fetchAllFlightBookings,
    getFlightUserType,
    isFlightUserAuthenticated
} from '../../services/bookingApi';

const useAgentBookingStats = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bookingStats, setBookingStats] = useState({
        busBookings: {
            total: 0,
            thisMonth: 0,
            revenue: 0
        },
        hotelBookings: {
            total: 0,
            thisMonth: 0,
            revenue: 0
        },
        flightBookings: {
            total: 0,
            thisMonth: 0,
            revenue: 0
        },
        lastUpdated: null
    });

    // Format booking data for bus bookings
    const formatBusBookingDataForStats = (apiResponse) => {
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

        return bookingsArray.map((bookingWrapper) => {
            const booking = bookingWrapper.Result || bookingWrapper;

            const totalAmount = parseFloat(
                bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                booking.Price?.PublishedPrice ||
                booking.Price?.OfferedPrice ||
                '0'
            ) || 0;

            const bookingDate = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.createdAt ||
                booking.created_at ||
                new Date().toISOString();

            return {
                bookingId: String(bookingWrapper.bookingId || booking.BookingId || booking.bookingId || Date.now()),
                totalAmount: totalAmount,
                bookingDate: new Date(bookingDate)
            };
        });
    };

    // Format hotel booking data for stats
    const formatHotelBookingDataForStats = (apiResponse) => {
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

        return bookingsArray.map((bookingWrapper) => {
            const booking = bookingWrapper.Result || bookingWrapper;

            const totalAmount = parseFloat(
                bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                booking.Amount ||
                '0'
            ) || 0;

            const bookingDate = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.createdAt ||
                booking.created_at ||
                new Date().toISOString();

            return {
                bookingId: String(bookingWrapper.bookingId || booking.BookingId || booking.bookingId || Date.now()),
                totalAmount: totalAmount,
                bookingDate: new Date(bookingDate)
            };
        });
    };

    // Format flight booking data for stats
    const formatFlightBookingDataForStats = (apiResponse) => {
        let bookingsArray = [];

        if (Array.isArray(apiResponse)) {
            bookingsArray = apiResponse;
        } else if (apiResponse?.data && Array.isArray(apiResponse.data)) {
            bookingsArray = apiResponse.data;
        } else if (apiResponse?.Error?.ErrorCode === 0 && apiResponse?.data) {
            bookingsArray = Array.isArray(apiResponse.data) ? apiResponse.data : [];
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

        return bookingsArray.map((booking) => {
            const totalAmount = parseFloat(
                booking.totalAmount ||
                booking.amount ||
                booking.TotalAmount ||
                booking.fare ||
                booking.price ||
                booking.Price?.PublishedPrice ||
                booking.Price?.OfferedPrice ||
                '0'
            ) || 0;

            const bookingDate = booking.bookingDate ||
                booking.createdAt ||
                booking.created_at ||
                booking.BookingDate ||
                new Date().toISOString();

            return {
                bookingId: String(booking.bookingId || booking.BookingId || booking.booking_id || Date.now()),
                totalAmount: totalAmount,
                bookingDate: new Date(bookingDate)
            };
        });
    };

    // Calculate statistics from booking data - only for booking history
    const calculateBookingStats = (allBookings) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter bookings for current month
        const thisMonthBookings = allBookings.filter(booking => {
            const bookingDate = booking.bookingDate;
            return bookingDate.getMonth() === currentMonth &&
                bookingDate.getFullYear() === currentYear;
        });

        // Calculate total revenue
        const totalRevenue = allBookings.reduce((sum, booking) => {
            return sum + (booking.totalAmount || 0);
        }, 0);

        return {
            total: allBookings.length,
            thisMonth: thisMonthBookings.length,
            revenue: totalRevenue
        };
    };

    // Main function to fetch agent booking statistics
    const fetchAgentBookingStats = async () => {
        setLoading(true);
        setError(null);

        try {
            // Detect user types
            const busUserType = getUserType();
            const hotelUserType = getHotelUserType();
            const flightUserType = getFlightUserType();

            // Check if user is agent
            if (busUserType !== 'agent' && hotelUserType !== 'agent' && flightUserType !== 'agent') {
                throw new Error('Access restricted to agents only');
            }

            console.log('Fetching agent booking statistics...');

            let allBusBookingsData = [];
            let allHotelBookingsData = [];
            let allFlightBookingsData = [];

            // Fetch bus bookings if user is authenticated
            if (busUserType === 'agent' && isUserAuthenticated(busUserType)) {
                try {
                    const allBusResponse = await fetchAllBookings(busUserType);
                    if (allBusResponse.success) {
                        allBusBookingsData = formatBusBookingDataForStats(allBusResponse.data);
                    }
                } catch (err) {
                    console.warn('Failed to fetch all bus bookings for stats:', err.message);
                }
            }

            // Fetch hotel bookings if user is authenticated
            if (hotelUserType === 'agent' && isHotelUserAuthenticated()) {
                try {
                    const allHotelResponse = await fetchAllHotelBookings(hotelUserType);
                    if (allHotelResponse.success) {
                        allHotelBookingsData = formatHotelBookingDataForStats(allHotelResponse.data);
                    }
                } catch (err) {
                    console.warn('Failed to fetch all hotel bookings for stats:', err.message);
                }
            }

            // Fetch flight bookings if user is authenticated
            if (flightUserType === 'agent' && isFlightUserAuthenticated()) {
                try {
                    const allFlightResponse = await fetchAllFlightBookings(flightUserType);
                    if (allFlightResponse.success) {
                        allFlightBookingsData = formatFlightBookingDataForStats(allFlightResponse.data);
                    }
                } catch (err) {
                    console.warn('Failed to fetch all flight bookings for stats:', err.message);
                }
            }

            // Calculate statistics - only booking history related
            const busStats = calculateBookingStats(allBusBookingsData);
            const hotelStats = calculateBookingStats(allHotelBookingsData);
            const flightStats = calculateBookingStats(allFlightBookingsData);

            // Update state
            setBookingStats({
                busBookings: busStats,
                hotelBookings: hotelStats,
                flightBookings: flightStats,
                lastUpdated: new Date()
            });

            console.log('Agent booking stats updated - Bus:', busStats, 'Hotel:', hotelStats, 'Flight:', flightStats);

        } catch (error) {
            console.error('Error fetching agent booking stats:', error);
            setError(error.message || 'Failed to fetch booking statistics');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when user changes
    useEffect(() => {
        if (user) {
            fetchAgentBookingStats();
        }
    }, [user]);

    // Refresh function for manual updates
    const refreshStats = () => {
        fetchAgentBookingStats();
    };

    return {
        bookingStats,
        loading,
        error,
        refreshStats,
        lastUpdated: bookingStats.lastUpdated
    };
};

export default useAgentBookingStats;