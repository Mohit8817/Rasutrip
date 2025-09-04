import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
// Import the flight booking services
import {
  fetchUpcomingFlightBookings,
  fetchAllFlightBookings,
  fetchFlightRealTimeStatus,
  fetchMultipleFlightRealTimeStatus,
  getFlightUserType,
  isFlightUserAuthenticated
} from "../../services/bookingApi";

const FlightBookingComponent = () => {
  const [bookingType, setBookingType] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [userRole, setUserRole] = useState('user');
  const [realTimeStatuses, setRealTimeStatuses] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);

  // Get current bookings based on selected type
  const currentBookings = bookingType === 'upcoming' ? upcomingBookings : allBookings;

  // Load flight bookings using the new service
  const loadFlightBookings = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🛫 Loading flight bookings using service...');

      // Check if user is authenticated
      if (!isFlightUserAuthenticated()) {
        throw new Error('User is not authenticated. Please login again.');
      }

      const currentUserType = getFlightUserType();
      console.log('👤 Current user type:', currentUserType);

      // Fetch all bookings
      try {
        const allResponse = await fetchAllFlightBookings(currentUserType);
        if (allResponse.success && allResponse.data) {
          // Handle different response structures
          let bookingsData = [];

          if (allResponse.data?.Error?.ErrorCode === 0) {
            bookingsData = allResponse.data.data || [];
          } else if (allResponse.data?.data) {
            bookingsData = allResponse.data.data;
          } else if (Array.isArray(allResponse.data)) {
            bookingsData = allResponse.data;
          }

          const sortedAll = bookingsData.sort((a, b) => {
            const dateA = new Date(a.bookingDate || a.createdAt);
            const dateB = new Date(b.bookingDate || b.createdAt);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          });

          setAllBookings(sortedAll);
          console.log('✅ All flight bookings loaded:', sortedAll.length);
        } else {
          console.warn('⚠️ All bookings response error:', allResponse.message);
        }
      } catch (err) {
        console.error('❌ Error fetching all bookings:', err);
        setError(err.message || 'Failed to fetch all bookings');
      }

      // Fetch upcoming bookings
      try {
        const upcomingResponse = await fetchUpcomingFlightBookings(currentUserType);
        if (upcomingResponse.success && upcomingResponse.data) {
          // Handle different response structures
          let bookingsData = [];

          if (upcomingResponse.data?.Error?.ErrorCode === 0) {
            bookingsData = upcomingResponse.data.data || [];
          } else if (upcomingResponse.data?.data) {
            bookingsData = upcomingResponse.data.data;
          } else if (Array.isArray(upcomingResponse.data)) {
            bookingsData = upcomingResponse.data;
          }

          const sortedUpcoming = bookingsData.sort((a, b) => {
            const dateA = new Date(a.departureTime || a.bookingDate);
            const dateB = new Date(b.departureTime || b.bookingDate);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          });

          setUpcomingBookings(sortedUpcoming);
          console.log('✅ Upcoming flight bookings loaded:', sortedUpcoming.length);
        } else {
          console.warn('⚠️ Upcoming bookings response error:', upcomingResponse.message);
        }
      } catch (err) {
        console.error('❌ Error fetching upcoming bookings:', err);
        // Don't set error for upcoming bookings as it's not critical
      }

    } catch (err) {
      console.error('❌ Error loading flight bookings:', err);
      setError(err.message || 'Failed to load flight bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load real-time status for visible bookings
  const loadRealTimeStatuses = async (bookings) => {
    if (bookings.length === 0) return;

    setStatusLoading(true);
    try {
      console.log('🔄 Loading real-time statuses for flight bookings...');
      const currentUserType = getFlightUserType();
      const statuses = await fetchMultipleFlightRealTimeStatus(bookings, currentUserType);
      setRealTimeStatuses(statuses);
      console.log('✅ Real-time statuses loaded:', Object.keys(statuses).length);
    } catch (error) {
      console.error('❌ Error loading real-time statuses:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    loadFlightBookings(); // Reload with new sort order
  };

  // Load data on component mount
  useEffect(() => {
    // Get user type
    const userType = getFlightUserType();
    setUserRole(userType || 'customer');

    // Load bookings
    loadFlightBookings();
  }, [sortOrder]);

  // Load real-time statuses when current bookings change
  useEffect(() => {
    if (currentBookings.length > 0) {
      loadRealTimeStatuses(currentBookings);
    }
  }, [currentBookings]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // Calculate flight duration
  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'N/A';
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get real-time status for booking
  const getRealTimeStatus = (booking) => {
    const bookingId = booking?.bookingId || booking?.BookingId || booking?.booking_id;
    const statusInfo = realTimeStatuses[bookingId];

    if (statusLoading) return { status: 'Loading...', className: 'text-blue-600' };

    if (statusInfo) {
      if (statusInfo.success) {
        const status = statusInfo.status;
        let className = 'text-green-600';

        if (status.toLowerCase().includes('cancelled')) className = 'text-red-600';
        else if (status.toLowerCase().includes('delayed')) className = 'text-orange-600';
        else if (status.toLowerCase().includes('boarding')) className = 'text-blue-600';

        return { status, className };
      } else {
        return { status: 'Error', className: 'text-gray-500' };
      }
    }

    // Fallback to booking status
    const fallbackStatus = booking.status || booking.bookingStatus || 'Confirmed';
    let className = 'text-green-600';

    if (fallbackStatus.toLowerCase() === 'cancelled') className = 'text-red-600';
    else if (fallbackStatus.toLowerCase() === 'pending') className = 'text-orange-600';

    return { status: fallbackStatus, className };
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h5 className="text-2xl font-bold text-gray-800">My Flight Bookings</h5>
          <p className="text-sm text-gray-500 mt-1">
            User Type: {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)} |
            Status: {statusLoading ? ' Loading real-time data...' : ' Real-time data loaded'}
          </p>
        </div>
        <button
          onClick={loadFlightBookings}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-2">⚠️</span>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Flight Bookings</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={loadFlightBookings}
                className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Type Tabs */}
      <div className="flex w-full mb-6 bg-gray-50 p-2 shadow-sm">
        <button
          className={`flex-1 text-center rounded-lg transition-all duration-300 font-semibold text-sm px-6 py-2
            ${bookingType === 'upcoming'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70'}
          `}
          onClick={() => setBookingType('upcoming')}
        >
          Upcoming Flights
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
          onClick={() => setBookingType('all')}
        >
          All Flights
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

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading flight bookings...</span>
        </div>
      )}

      {/* Flight Bookings Table */}
      {!loading && (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                    onClick={toggleSortOrder}
                    title="Click to change sort order">
                    Booked On {sortOrder === 'desc' ? '↓' : '↑'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-50">
                {console.log('✈️ Rendering table rows for:', currentBookings.length, 'flight bookings')}
                {currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium text-gray-600">No flight bookings found</span>
                        <span className="text-sm text-gray-400 mt-1">
                          {bookingType === 'upcoming'
                            ? 'Your upcoming flights will appear here'
                            : 'Your flight booking history will appear here'
                          }
                        </span>
                        <div className="mt-2 text-xs text-gray-500">
                          Debug: Upcoming={upcomingBookings.length}, All={allBookings.length}, Current={currentBookings.length}
                          <br />
                          Sort Order: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                          <br />
                          User Role: {userRole}
                        </div>
                        <button
                          onClick={loadFlightBookings}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Refresh Bookings
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking, index) => {
                    console.log(`Rendering flight booking row ${index + 1}:`, booking);
                    const realTimeStatus = getRealTimeStatus(booking);

                    return (
                      <tr key={booking.bookingId || index} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                          {booking.bookingId || booking.pnr}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          <div className="max-w-xs truncate" title={`${booking.airline?.AirlineName || booking.airlineName} ${booking.flightNumber}`}>
                            {booking.airline?.AirlineName || booking.airlineName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.flightNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">
                            {booking.origin?.AirportCode || booking.from} → {booking.destination?.AirportCode || booking.to}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.origin?.CityName || booking.fromCity} - {booking.destination?.CityName || booking.toCity}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">{formatTime(booking.departureTime)}</div>
                          <div className="text-xs text-gray-500">{formatDate(booking.departureTime)}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">{formatTime(booking.arrivalTime)}</div>
                          <div className="text-xs text-gray-500">{formatDate(booking.arrivalTime)}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {calculateDuration(booking.departureTime, booking.arrivalTime)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">
                            {booking.passengers?.length || booking.totalPassengers || 1}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.passengers?.length === 1 ? 'passenger' : 'passengers'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="max-w-xs truncate" title={booking.cabinClass || booking.class}>
                            {booking.cabinClass || booking.class || 'Economy'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                          {booking.pnr || booking.confirmationNo || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${realTimeStatus.className}`}>
                            {realTimeStatus.status}
                          </span>
                          {statusLoading && (
                            <div className="text-xs text-blue-500 mt-1">Updating...</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatAmount(booking.totalAmount || booking.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${booking.paymentStatus?.toLowerCase() === 'completed' || booking.paymentStatus?.toLowerCase() === 'paid'
                            ? 'text-green-600' :
                            booking.paymentStatus?.toLowerCase() === 'processing'
                              ? 'text-orange-600' :
                              booking.paymentStatus?.toLowerCase() === 'failed'
                                ? 'text-red-600' :
                                'text-green-600'
                            }`}>
                            {booking.paymentStatus || 'Completed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(booking.bookingDate || booking.createdAt)}</span>
                            <span className="text-xs text-gray-400">
                              {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => {
                              console.log('View flight booking details:', booking);
                              // You can add navigation logic here
                            }}
                            className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
                          >
                            View
                          </button>
                          <button
                            onClick={async () => {
                              console.log('Refreshing real-time status for:', booking.bookingId);
                              const currentUserType = getFlightUserType();
                              const result = await fetchFlightRealTimeStatus(booking, currentUserType);
                              setRealTimeStatuses(prev => ({
                                ...prev,
                                [result.bookingId]: result
                              }));
                            }}
                            className="text-green-500 hover:text-green-700 font-medium text-xs mt-1"
                          >
                            Refresh Status
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
      )}
    </div>
  );
};

export default FlightBookingComponent; 