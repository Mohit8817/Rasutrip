import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, CheckCircle, Info, Loader } from 'lucide-react';
// Import the flight booking services WITH real-time status
import {
  fetchUpcomingFlightBookings,
  fetchAllFlightBookings,
  fetchFlightRealTimeStatus,
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

  // Real-time status popup state
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Get current bookings based on selected type
  const currentBookings = bookingType === 'upcoming' ? upcomingBookings : allBookings;

  // Transform API response to component-friendly format
  const transformBookingData = (apiBookings) => {
    if (!Array.isArray(apiBookings)) return [];

    return apiBookings.map(booking => {
      const result = booking.Result || {};
      const segments = result.Segments?.[0] || [];
      const firstSegment = segments[0] || {};
      const lastSegment = segments[segments.length - 1] || {};
      const passenger = result.Passenger?.[0] || {};

      return {
        bookingId: result.BookingId || booking.bookingId,
        pnr: result.PNR,
        airline: firstSegment.Airline,
        airlineName: firstSegment.Airline?.AirlineName,
        flightNumber: firstSegment.Airline?.FlightNumber,
        origin: firstSegment.Origin,
        destination: lastSegment.Destination || firstSegment.Destination,
        from: firstSegment.Origin?.AirportCode,
        to: (lastSegment.Destination || firstSegment.Destination)?.AirportCode,
        fromCity: firstSegment.Origin?.CityName,
        toCity: (lastSegment.Destination || firstSegment.Destination)?.CityName,
        departureTime: firstSegment.Origin?.DepartTime,
        arrivalTime: (lastSegment.Destination || firstSegment.Destination)?.ArrivalTime,
        cabinClass: firstSegment.CabinClass,
        class: firstSegment.CabinClass,
        passengers: result.Passenger,
        totalPassengers: result.Passenger?.length || 1,
        totalAmount: result.InvoiceAmount || result.Fare?.PublishedPrice,
        amount: result.InvoiceAmount || result.Fare?.PublishedPrice,
        status: result.CancelStatus === 'none' ? 'Confirmed' : result.CancelStatus,
        bookingStatus: result.CancelStatus === 'none' ? 'Confirmed' : result.CancelStatus,
        paymentStatus: 'Completed', // Default since API doesn't provide this
        bookingDate: booking.createdAt,
        createdAt: booking.createdAt,
        confirmationNo: result.PNR,
        journeyType: result.JourneyType, // 1 = One Way, 2 = Round Trip
        isDomestic: result.IsDomestic,
        fareType: result.FareType,
        segments: result.Segments,
        invoiceNo: result.InvoiceNo,
        invoiceAmount: result.InvoiceAmount,
        airlineCode: firstSegment.Airline?.AirlineCode
      };
    });
  };

  // Load flight bookings using the simplified service
  const loadFlightBookings = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🛫 Loading flight bookings using simplified service...');

      // Check if user is authenticated
      if (!isFlightUserAuthenticated()) {
        throw new Error('User is not authenticated. Please login again.');
      }

      const currentUserType = getFlightUserType();
      console.log('👤 Current user type:', currentUserType);

      // Fetch all bookings
      try {
        const allResponse = await fetchAllFlightBookings(currentUserType);
        console.log('📦 All bookings raw response:', allResponse);

        if (allResponse.success && allResponse.data) {
          let bookingsData = [];

          // Handle the response structure based on your API format
          if (allResponse.data.data && Array.isArray(allResponse.data.data)) {
            bookingsData = allResponse.data.data;
          } else if (Array.isArray(allResponse.data)) {
            bookingsData = allResponse.data;
          }

          console.log('📋 Raw all bookings data:', bookingsData);

          const transformedBookings = transformBookingData(bookingsData);
          console.log('✨ Transformed all bookings:', transformedBookings);

          const sortedAll = transformedBookings.sort((a, b) => {
            const dateA = new Date(a.bookingDate || a.createdAt);
            const dateB = new Date(b.bookingDate || b.createdAt);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          });

          setAllBookings(sortedAll);
          console.log('✅ All flight bookings loaded:', sortedAll.length);
        } else {
          console.warn('⚠️ All bookings response error:', allResponse.message);
          setError(allResponse.message || 'Failed to fetch all bookings');
        }
      } catch (err) {
        console.error('❌ Error fetching all bookings:', err);
        setError(err.message || 'Failed to fetch all bookings');
      }

      // Fetch upcoming bookings
      try {
        const upcomingResponse = await fetchUpcomingFlightBookings(currentUserType);
        console.log('📦 Upcoming bookings raw response:', upcomingResponse);

        if (upcomingResponse.success && upcomingResponse.data) {
          let bookingsData = [];

          // Handle the response structure based on your API format
          if (upcomingResponse.data.data && Array.isArray(upcomingResponse.data.data)) {
            bookingsData = upcomingResponse.data.data;
          } else if (Array.isArray(upcomingResponse.data)) {
            bookingsData = upcomingResponse.data;
          }

          console.log('📋 Raw upcoming bookings data:', bookingsData);

          const transformedBookings = transformBookingData(bookingsData);
          console.log('✨ Transformed upcoming bookings:', transformedBookings);

          // Filter for future flights only
          const now = new Date();
          const futureBookings = transformedBookings.filter(booking => {
            const departureDate = new Date(booking.departureTime);
            return departureDate > now;
          });

          const sortedUpcoming = futureBookings.sort((a, b) => {
            const dateA = new Date(a.departureTime || a.bookingDate);
            const dateB = new Date(b.departureTime || b.bookingDate);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          });

          setUpcomingBookings(sortedUpcoming);
          console.log('✅ Upcoming flight bookings loaded:', sortedUpcoming.length);
        } else {
          console.warn('⚠️ Upcoming bookings response error:', upcomingResponse.message);
          // Don't set error for upcoming bookings as it's not critical
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

  // ✅ FIXED: Real-time status API call using the proper service function
  const fetchRealTimeStatus = async (booking) => {
    setStatusLoading(true);
    setStatusError('');
    setSelectedBooking(booking);
    setShowStatusPopup(true);

    try {
      console.log('🔄 Fetching flight real-time status using service function...');
      console.log('📋 Booking data:', booking);

      // Use the proper service function from bookingApi
      const currentUserType = getFlightUserType();
      const result = await fetchFlightRealTimeStatus(booking, currentUserType);

      console.log('✅ Flight real-time status result:', result);

      if (result.success) {
        setStatusData(result);
        console.log('✅ Status fetched successfully:', result.status);
      } else {
        throw new Error(result.error || 'Failed to fetch status');
      }

    } catch (error) {
      console.error('❌ Error fetching flight real-time status:', error);

      let errorMessage = 'Failed to fetch real-time status';

      // Handle different types of errors
      if (error.response) {
        const { status } = error.response;
        switch (status) {
          case 400:
            errorMessage = 'Invalid booking data. Please check booking details.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please login again.';
            break;
          case 404:
            errorMessage = 'Flight booking not found in the system.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Request failed with status ${status}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setStatusError(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  // Close status popup
  const closeStatusPopup = () => {
    setShowStatusPopup(false);
    setStatusData(null);
    setStatusError('');
    setSelectedBooking(null);
  };

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

  // Get status with basic styling
  const getBookingStatus = (booking) => {
    const status = booking.status || booking.bookingStatus || 'Confirmed';
    let className = 'text-green-600';

    if (status.toLowerCase() === 'cancelled') className = 'text-red-600';
    else if (status.toLowerCase() === 'pending') className = 'text-orange-600';

    return { status, className };
  };

  // Get journey type display
  const getJourneyType = (journeyType) => {
    switch (journeyType) {
      case 1: return 'One Way';
      case 2: return 'Round Trip';
      default: return 'One Way';
    }
  };

  // Handle invoice download
  const handleInvoiceDownload = (booking) => {
    console.log('Download invoice for booking:', booking);
    // Add your invoice download logic here
    // You can make an API call to generate/download invoice
    alert(`Invoice download initiated for booking: ${booking.bookingId || booking.pnr}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h5 className="text-2xl font-bold text-gray-800">My Flight Bookings</h5>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-2" />
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booking ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Airline & Flight</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Route</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Departure</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Arrival</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Passengers</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Journey Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PNR</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Real-time Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                    onClick={toggleSortOrder}
                    title="Click to change sort order">
                    Booked On {sortOrder === 'desc' ? '↓' : '↑'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-50">
                {currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="px-4 py-12 text-center">
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
                    const bookingStatus = getBookingStatus(booking);

                    return (
                      <tr key={booking.bookingId || index} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                          {booking.bookingId || booking.pnr}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          <div className="max-w-xs truncate" title={`${booking.airlineName} ${booking.flightNumber}`}>
                            {booking.airlineName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.flightNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">
                            {booking.from} → {booking.to}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.fromCity} - {booking.toCity}
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
                            {booking.totalPassengers}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.totalPassengers === 1 ? 'passenger' : 'passengers'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="max-w-xs truncate" title={booking.class}>
                            {booking.class || 'Economy'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="max-w-xs truncate">
                            {getJourneyType(booking.journeyType)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.isDomestic ? 'Domestic' : 'International'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                          {booking.pnr || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${bookingStatus.className}`}>
                            {bookingStatus.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => fetchRealTimeStatus(booking)}
                            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-xs font-medium transition-colors duration-200"
                          >
                            Status
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatAmount(booking.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                            <span className="text-xs text-gray-400">
                              {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleInvoiceDownload(booking)}
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs"
                          >
                            Invoice
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

      {/* ✅ ENHANCED Real-time Status Popup with better status display */}
      {showStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Popup Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Real-time Flight Status</h3>
                {selectedBooking && (
                  <p className="text-sm text-gray-500 mt-1">
                    Booking ID: {selectedBooking.bookingId} | PNR: {selectedBooking.pnr}
                  </p>
                )}
              </div>
              <button
                onClick={closeStatusPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6">
              {statusLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin w-8 h-8 text-blue-500" />
                  <span className="ml-3 text-gray-600">Fetching real-time flight status...</span>
                </div>
              ) : statusError ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Flight Status</h4>
                    <p className="text-gray-600 mb-4">{statusError}</p>
                    <button
                      onClick={() => fetchRealTimeStatus(selectedBooking)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : statusData ? (
                <div className="space-y-6">
                  {/* Status Success/Info Indicator */}
                  <div className={`border rounded-lg p-4 ${statusData.success
                    ? statusData.isEmpty
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center">
                      {statusData.success ? (
                        statusData.isEmpty ? (
                          <Info className="text-yellow-500 w-6 h-6 mr-3" />
                        ) : (
                          <CheckCircle className="text-green-500 w-6 h-6 mr-3" />
                        )
                      ) : (
                        <AlertCircle className="text-red-500 w-6 h-6 mr-3" />
                      )}
                      <div>
                        <h4 className={`text-lg font-medium ${statusData.success
                          ? statusData.isEmpty
                            ? 'text-yellow-900'
                            : 'text-green-900'
                          : 'text-red-900'
                          }`}>
                          {statusData.success
                            ? statusData.isEmpty
                              ? 'API Call Successful - No Data'
                              : 'Status Retrieved Successfully'
                            : 'Status Error'
                          }
                        </h4>
                        <p className={`text-sm ${statusData.success
                          ? statusData.isEmpty
                            ? 'text-yellow-700'
                            : 'text-green-700'
                          : 'text-red-700'
                          }`}>
                          {statusData.success
                            ? statusData.isEmpty
                              ? 'API returned 200 OK but no real-time data available'
                              : `Current Status: ${statusData.status}`
                            : statusData.error
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last Updated: {new Date(statusData.lastUpdated).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Empty Response Info */}
                  {statusData.isEmpty && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h5 className="font-medium text-blue-900 mb-3">Why might this happen?</h5>
                      <div className="text-sm text-blue-800 space-y-2">
                        <div>• Real-time tracking may not be available for this specific flight</div>
                        <div>• The airline might not provide live status updates</div>
                        <div>• Booking is too recent or too old for real-time tracking</div>
                        <div>• Flight is not yet in the tracking system</div>
                        <div>• API payload was correct but no matching data found</div>
                      </div>
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="text-xs text-gray-600">
                          <strong>Request Details:</strong>
                          <br />✅ Booking ID: {statusData.bookingId}
                          <br />✅ API Endpoint: /airservice/real-time-booking-details
                          <br />✅ Response Status: 200 OK
                          <br />❌ Response Data: Empty or Null
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flight Details */}
                  {selectedBooking && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Flight Information</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">API Status:</span>
                            <span className={`font-medium ${statusData.success ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {statusData.success ? '200 OK' : 'Error'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Data Available:</span>
                            <span className={`font-medium ${statusData.isEmpty ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                              {statusData.isEmpty ? 'No' : 'Yes'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Type:</span>
                            <span className="font-medium">Flight</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Booking ID:</span>
                            <span className="font-medium font-mono">{statusData.bookingId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Flight Details</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Airline:</span>
                            <span className="font-medium">{selectedBooking.airlineName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Flight Number:</span>
                            <span className="font-medium">{selectedBooking.flightNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Route:</span>
                            <span className="font-medium">{selectedBooking.from} → {selectedBooking.to}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">PNR:</span>
                            <span className="font-medium font-mono">{selectedBooking.pnr}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* API Response Data */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">
                      API Response Data
                      <span className="ml-2 text-xs text-gray-500">
                        (Status Code: {statusData.success ? '200 OK' : 'Error'})
                      </span>
                    </h5>
                    <div className="bg-gray-50 rounded p-3 max-h-64 overflow-auto">
                      {statusData.data && Object.keys(statusData.data).length > 0 ? (
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(statusData.data, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Info className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-sm">No data returned from API</div>
                          <div className="text-xs mt-1">Response was successful but empty</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Debug Information */}
                  {statusData.debugInfo && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Debug Information</h5>
                      <div className="bg-gray-50 rounded p-3 max-h-48 overflow-auto">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(statusData.debugInfo, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Error Details if any */}
                  {(statusData?.errorDetails || statusData?.debugInfo) && (
                    <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <h5 className="font-medium text-yellow-900 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Debugging Information
                      </h5>

                      {statusData.errorDetails && (
                        <div className="text-sm text-yellow-800 mb-4 whitespace-pre-line">
                          {statusData.errorDetails}
                        </div>
                      )}

                      {statusData.debugInfo && (
                        <div className="text-xs text-gray-600">
                          <strong>Debug Data:</strong>
                          <pre className="mt-2 bg-white p-2 rounded border overflow-auto max-h-32">
                            {JSON.stringify(statusData.debugInfo, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Possible Solutions */}
                  {statusError && statusError.includes('Booking not found in local DB') && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h5 className="font-medium text-blue-900 mb-3">Possible Solutions</h5>
                      <div className="text-sm text-blue-800 space-y-2">
                        <div>• Wait a few minutes and try again (database sync issue)</div>
                        <div>• Check if you're logged in with the correct account</div>
                        <div>• Verify the booking exists in your "All Flights" list</div>
                        <div>• Contact support with Booking ID: <code className="bg-white px-1 rounded">{selectedBooking?.bookingId || 'N/A'}</code></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Status Data</h4>
                    <p className="text-gray-600">Click the Status button to fetch real-time flight information</p>
                  </div>
                </div>
              )}
            </div>

            {/* Popup Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                {statusData && (
                  <span>
                    API Endpoint: /airservice/real-time-booking-details |
                    Response: {statusData.success ? '200 OK' : 'Error'}
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                {selectedBooking && (
                  <button
                    onClick={() => fetchRealTimeStatus(selectedBooking)}
                    disabled={statusLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    {statusLoading ? 'Refreshing...' : 'Refresh Status'}
                  </button>
                )}

                <button
                  onClick={closeStatusPopup}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightBookingComponent;