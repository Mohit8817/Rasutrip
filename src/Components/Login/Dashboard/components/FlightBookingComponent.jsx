import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

// API configuration
const API_BASE_URL = "https://api.rasutrip.com/api/v1";

const FlightBookingComponent = () => {
  const [bookingType, setBookingType] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [userRole, setUserRole] = useState('user'); // You can get this from your auth context

  // Get current bookings based on selected type
  const currentBookings = bookingType === 'upcoming' ? upcomingBookings : allBookings;

  // API call function
  const apiCall = async (endpoint) => {
    try {
      const token = localStorage.getItem('authToken'); // Adjust token key as needed
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Load flight bookings
  const loadFlightBookings = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🛫 Loading flight bookings...');

      // Fetch all bookings
      const allResponse = await apiCall('/airservice/booking-details');
      if (allResponse?.Error?.ErrorCode === 0) {
        const sortedAll = (allResponse.data || []).sort((a, b) => {
          const dateA = new Date(a.bookingDate || a.createdAt);
          const dateB = new Date(b.bookingDate || b.createdAt);
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        setAllBookings(sortedAll);
        console.log('✅ All bookings loaded:', sortedAll.length);
      } else {
        setError(allResponse?.Error?.ErrorMessage || 'Failed to fetch all bookings');
      }

      // Fetch upcoming bookings
      const upcomingResponse = await apiCall('/airservice/up-comming-bookings');
      if (upcomingResponse?.Error?.ErrorCode === 0) {
        const sortedUpcoming = (upcomingResponse.data || []).sort((a, b) => {
          const dateA = new Date(a.departureTime || a.bookingDate);
          const dateB = new Date(b.departureTime || b.bookingDate);
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        setUpcomingBookings(sortedUpcoming);
        console.log('✅ Upcoming bookings loaded:', sortedUpcoming.length);
      } else {
        console.log('⚠️ Upcoming bookings error:', upcomingResponse?.Error?.ErrorMessage);
      }

    } catch (err) {
      console.error('❌ Error loading flight bookings:', err);
      setError('Failed to load flight bookings. Please try again.');
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
    loadFlightBookings();
  }, []);

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h5 className="text-2xl font-bold text-gray-800">My Flight Bookings</h5>

        </div>

      </div>

      {/* Error Display
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
      )} */}

      {/* Booking Type Tabs */}
      <div className="flex w-full mb-6 bg-gray-50 p-2 shadow-sm">
        <button
          className={`flex-1 text-center rounded-lg transition-all duration-300 font-semibold text-sm
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
      {/* Flight Bookings Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booking ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Flight</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Route</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Departure</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Arrival</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Passengers</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Class</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PNR</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
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
                  console.log(`Rendering row ${index + 1}:`, booking);
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
                        <span className={`font-medium ${booking.status?.toLowerCase() === 'confirmed' || booking.bookingStatus?.toLowerCase() === 'confirmed'
                          ? 'text-green-600' :
                          booking.status?.toLowerCase() === 'pending' || booking.bookingStatus?.toLowerCase() === 'pending'
                            ? 'text-orange-600' :
                            booking.status?.toLowerCase() === 'cancelled' || booking.bookingStatus?.toLowerCase() === 'cancelled'
                              ? 'text-red-600' :
                              'text-blue-600'
                          }`}>
                          {booking.status || booking.bookingStatus || 'Confirmed'}
                        </span>
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
                          }}
                          className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
                        >
                          <span className="mr-1"></span>
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
    </div>
  );
};

export default FlightBookingComponent;