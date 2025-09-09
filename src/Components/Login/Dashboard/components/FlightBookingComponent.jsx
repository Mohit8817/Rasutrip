import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Clock, AlertCircle, CheckCircle, Info, Loader } from 'lucide-react';
// Import the updated flight booking services with real-time status
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
  const [currentBookingForStatus, setCurrentBookingForStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [statusError, setStatusError] = useState('');

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
        // Additional fields for real-time status API
        searchTokenId: booking.searchTokenId || booking.SearchTokenId,
        airlineCode: firstSegment.Airline?.AirlineCode
      };
    });
  };

  // Handle real-time status check
  const handleRealTimeStatusCheck = async (booking) => {
    console.log('🚀 Checking real-time status for flight booking:', booking);

    setCurrentBookingForStatus(booking);
    setShowStatusPopup(true);
    setStatusLoading(true);
    setStatusError('');
    setStatusData(null);

    try {
      const currentUserType = getFlightUserType();
      console.log('👤 User type for status check:', currentUserType);

      const statusResult = await fetchFlightRealTimeStatus(booking, currentUserType);
      console.log('📋 Status result:', statusResult);

      if (statusResult.success) {
        setStatusData(statusResult);
      } else {
        setStatusError(statusResult.error || 'Failed to fetch real-time status');
      }
    } catch (error) {
      console.error('❌ Error checking flight real-time status:', error);
      setStatusError(error.message || 'Failed to check real-time status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Close status popup
  const closeStatusPopup = () => {
    setShowStatusPopup(false);
    setCurrentBookingForStatus(null);
    setStatusData(null);
    setStatusError('');
    setStatusLoading(false);
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('confirmed') || statusLower.includes('booked')) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    } else if (statusLower.includes('cancelled')) {
      return {
        icon: <X className="w-4 h-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    } else if (statusLower.includes('pending')) {
      return {
        icon: <Clock className="w-4 h-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      };
    } else {
      return {
        icon: <Info className="w-4 h-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    }
  };

  // Format status data for display
  const formatStatusData = (data) => {
    if (!data || !data.data) return [];

    const formatted = [];
    const responseData = data.data;

    // Basic information
    formatted.push({
      label: 'Booking ID',
      value: data.bookingId || 'N/A'
    });

    formatted.push({
      label: 'Status',
      value: data.status || 'Unknown'
    });

    formatted.push({
      label: 'Last Updated',
      value: new Date(data.lastUpdated).toLocaleString()
    });

    // Extract additional data from response
    if (responseData.PNR) {
      formatted.push({
        label: 'PNR',
        value: responseData.PNR
      });
    }

    if (responseData.FlightStatus) {
      formatted.push({
        label: 'Flight Status',
        value: responseData.FlightStatus
      });
    }

    if (responseData.DepartureTime) {
      formatted.push({
        label: 'Departure Time',
        value: new Date(responseData.DepartureTime).toLocaleString()
      });
    }

    if (responseData.ArrivalTime) {
      formatted.push({
        label: 'Arrival Time',
        value: new Date(responseData.ArrivalTime).toLocaleString()
      });
    }

    if (responseData.Gate) {
      formatted.push({
        label: 'Gate',
        value: responseData.Gate
      });
    }

    if (responseData.Terminal) {
      formatted.push({
        label: 'Terminal',
        value: responseData.Terminal
      });
    }

    if (responseData.Delay) {
      formatted.push({
        label: 'Delay',
        value: responseData.Delay
      });
    }

    // Add any other fields from the response
    Object.keys(responseData).forEach(key => {
      if (!['PNR', 'FlightStatus', 'DepartureTime', 'ArrivalTime', 'Gate', 'Terminal', 'Delay'].includes(key)) {
        if (responseData[key] && typeof responseData[key] !== 'object') {
          formatted.push({
            label: key,
            value: String(responseData[key])
          });
        }
      }
    });

    return formatted;
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

  // Get real-time status
  const getRealTimeStatus = (booking) => {
    // This is a mock implementation - replace with actual real-time API call
    const now = new Date();
    const departureTime = new Date(booking.departureTime);
    const arrivalTime = new Date(booking.arrivalTime);

    if (now < departureTime) {
      return { status: 'On Time', className: 'text-green-600 bg-green-100' };
    } else if (now >= departureTime && now <= arrivalTime) {
      return { status: 'In Flight', className: 'text-blue-600 bg-blue-100' };
    } else {
      return { status: 'Arrived', className: 'text-gray-600 bg-gray-100' };
    }
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                    onClick={toggleSortOrder}
                    title="Click to change sort order">
                    Booked On {sortOrder === 'desc' ? '↓' : '↑'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Real Time Status</th>
                </tr>
              </thead>
              <tbody className="bg-gray-50">
                {console.log('✈️ Rendering table rows for:', currentBookings.length, 'flight bookings')}
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
                    console.log(`Rendering flight booking row ${index + 1}:`, booking);
                    const bookingStatus = getBookingStatus(booking);
                    const realTimeStatus = getRealTimeStatus(booking);

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
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs "
                          >
                            Invoice
                          </button>
                        </td>

                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleRealTimeStatusCheck(booking)}
                            className="px-2 py-1 text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200 flex items-center space-x-1 bg-transparent"
                            title="Check real-time flight status"
                          >
                            <span>Status</span>
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

      {/* Real-time Status Popup */}
      {showStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-500" />
                Real-time Flight Status
              </h3>
              <button
                onClick={closeStatusPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Booking Info */}
              {currentBookingForStatus && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Flight Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="ml-2 font-mono">{currentBookingForStatus.bookingId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">PNR:</span>
                      <span className="ml-2 font-mono">{currentBookingForStatus.pnr}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Flight:</span>
                      <span className="ml-2">{currentBookingForStatus.flightNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Route:</span>
                      <span className="ml-2">{currentBookingForStatus.from} → {currentBookingForStatus.to}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {statusLoading && (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
                  <p className="text-gray-600">Fetching real-time status...</p>
                </div>
              )}

              {/* Error State */}
              {statusError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <h4 className="text-red-800 font-medium">Error</h4>
                      <p className="text-red-600 text-sm mt-1">{statusError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {statusData && !statusLoading && !statusError && (
                <div className="space-y-4">
                  {/* Status Header */}
                  <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    {(() => {
                      const statusDisplay = getStatusDisplay(statusData.status);
                      return (
                        <div className={`flex items-center px-3 py-1 rounded-full ${statusDisplay.bgColor}`}>
                          <span className={statusDisplay.color}>{statusDisplay.icon}</span>
                          <span className={`ml-2 font-semibold ${statusDisplay.color}`}>
                            {statusData.status}
                          </span>
                        </div>
                      );
                    })()}
                    <div className="ml-auto text-xs text-gray-500">
                      Last updated: {new Date(statusData.lastUpdated).toLocaleString()}
                    </div>
                  </div>

                  {/* Status Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Status Details</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {formatStatusData(statusData).map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-600 font-medium">{item.label}:</span>
                          <span className="text-gray-900 font-mono text-sm">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw Data (Debug) */}
                  {statusData.data && Object.keys(statusData.data).length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        View Raw API Response (Debug)
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(statusData.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={closeStatusPopup}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              {currentBookingForStatus && !statusLoading && (
                <button
                  onClick={() => handleRealTimeStatusCheck(currentBookingForStatus)}
                  className="ml-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightBookingComponent;