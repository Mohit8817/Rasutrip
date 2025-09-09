import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../Context/AuthContext'; // Adjust path as needed
import { getPaymentHistory } from '../../services/API';

const PaymentHistory = () => {
    const { user } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [userType, setUserType] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filterOptions = [
        { value: 'ALL', label: 'All Payments' },
        { value: 'FLIGHT', label: 'Flight' },
        { value: 'HOTEL', label: 'Hotel' },
        { value: 'BUS', label: 'Bus' }
    ];

    // Detect user type from multiple sources
    const detectUserType = () => {
        console.log('🔍 Detecting user type...');

        const storedUserType = localStorage.getItem('userType') || localStorage.getItem('user_type');

        let detectedType = null;
        const customerTokenKeys = ['token', 'authToken', 'customer_token', 'customerToken'];
        const agentTokenKeys = ['agent_token', 'agentToken', 'agent_auth_token'];

        const hasCustomerToken = customerTokenKeys.some(key => localStorage.getItem(key));
        const hasAgentToken = agentTokenKeys.some(key => localStorage.getItem(key));

        if (user) {
            if (user.isAgent || user.userType === 'agent' || user.role === 'agent') {
                detectedType = 'agent';
            } else if (user.isCustomer || user.userType === 'customer' || user.role === 'customer') {
                detectedType = 'customer';
            }
        }

        if (storedUserType) {
            detectedType = storedUserType.toLowerCase();
        } else if (hasAgentToken && !hasCustomerToken) {
            detectedType = 'agent';
        } else if (hasCustomerToken && !hasAgentToken) {
            detectedType = 'customer';
        } else {
            const hasAnyToken = localStorage.getItem('token') || localStorage.getItem('authToken');
            detectedType = hasAnyToken ? 'customer' : null;
        }

        console.log('✅ Final detected user type:', detectedType);
        return detectedType;
    };

    // Fetch payment history using service
    const fetchPaymentHistory = async (type = null) => {
        setLoading(true);
        setError(null);

        // Detect and set user type
        const detectedUserType = detectUserType();
        setUserType(detectedUserType);

        try {
            // Use the API service to fetch payment history
            const result = await getPaymentHistory(type);

            if (result.success && result.data) {
                // Sort by date (newest first)
                const sortedPayments = result.data.sort((a, b) => new Date(b.date || b.createdAt || b.bookingDate) - new Date(a.date || a.createdAt || a.bookingDate));
                setPayments(sortedPayments);
                setCurrentPage(1); // Reset to first page when filter changes
            } else {
                setPayments([]);
                setError(result.message || 'Failed to fetch payment history');
            }

        } catch (err) {
            console.error('Error fetching payment history:', err);
            setError(err.message || 'Failed to fetch payment history');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentHistory();
    }, [user]);

    const handleFilterChange = (filterType) => {
        setActiveFilter(filterType);
        fetchPaymentHistory(filterType === 'ALL' ? null : filterType);
    };

    // Pagination calculations
    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPayments = payments.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            SUCCESS: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            REFUNDED: 'bg-blue-100 text-blue-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status?.toUpperCase()] || 'bg-gray-100 text-gray-800'}`}>
                {status || 'UNKNOWN'}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getServiceDetails = (payment) => {
        // Helper function to get safe value
        const getSafeValue = (value, fallback = 'Not specified') => {
            return value && value !== 'N/A' && value.toString().trim() ? value : fallback;
        };

        // Determine payment type - check multiple possible fields
        const paymentType = payment.type || payment.serviceType || 
            (payment.flightNumber ? 'FLIGHT' : '') ||
            (payment.hotelName ? 'HOTEL' : '') ||
            (payment.busOperator ? 'BUS' : '') ||
            'UNKNOWN';

        switch (paymentType.toUpperCase()) {
            case 'FLIGHT':
                // Handle flight data from your flight booking structure
                const flightFrom = payment.from || payment.origin || payment.departure || 
                    payment.serviceDetails?.from || payment.fromCity || '';
                const flightTo = payment.to || payment.destination || payment.arrival || 
                    payment.serviceDetails?.to || payment.toCity || '';
                
                // Create route string
                const flightRoute = flightFrom && flightTo ? `${flightFrom} → ${flightTo}` :
                    payment.route || 'Route not specified';

                // Get airline and flight info
                const airlineInfo = payment.airlineName || payment.airline?.AirlineName || 
                    payment.serviceName || payment.flightDetails || 'Flight Booking';
                
                const flightNumber = payment.flightNumber || payment.airline?.FlightNumber || '';

                // Get passenger count
                const passengerCount = payment.totalPassengers || payment.passengers || 
                    payment.serviceDetails?.passengers || 
                    (payment.Result?.Passenger ? payment.Result.Passenger.length : null) || 1;

                return {
                    title: getSafeValue(flightNumber ? `${airlineInfo} - ${flightNumber}` : airlineInfo, 'Flight Booking'),
                    subtitle: getSafeValue(flightRoute, 'Route not specified'),
                    additionalInfo: `${passengerCount} Passenger${passengerCount > 1 ? 's' : ''}`,
                    icon: '✈️'
                };

            case 'HOTEL':
                const hotelLocation = payment.serviceDetails?.hotelLocation || payment.city || 
                    payment.location || payment.toCity || '';
                const hotelName = payment.hotelName || payment.serviceDetails?.hotelName || 
                    payment.serviceName || 'Hotel Booking';
                const roomCount = payment.serviceDetails?.rooms || payment.rooms || 1;

                return {
                    title: getSafeValue(hotelName, 'Hotel Booking'),
                    subtitle: getSafeValue(hotelLocation, 'Location not specified'),
                    additionalInfo: `${roomCount} Room${roomCount > 1 ? 's' : ''}`,
                    icon: '🏨'
                };

            case 'BUS':
                const busRoute = payment.route || payment.serviceDetails?.route ||
                    (payment.serviceDetails?.from && payment.serviceDetails?.to ?
                        `${payment.serviceDetails.from} → ${payment.serviceDetails.to}` : '') ||
                    (payment.from && payment.to ? `${payment.from} → ${payment.to}` : '');

                const busName = payment.busOperator || payment.serviceDetails?.busName || 
                    payment.serviceName || 'Bus Booking';
                const seatCount = payment.serviceDetails?.seats || payment.seats || 1;

                return {
                    title: getSafeValue(busName, 'Bus Booking'),
                    subtitle: getSafeValue(busRoute, 'Route not specified'),
                    additionalInfo: `${seatCount} Seat${seatCount > 1 ? 's' : ''}`,
                    icon: '🚌'
                };

            default:
                return {
                    title: getSafeValue(payment.serviceName || payment.description || 
                        payment.airlineName || payment.hotelName || payment.busOperator, 'Booking'),
                    subtitle: getSafeValue(payment.serviceType || payment.type, 'Service not specified'),
                    additionalInfo: null,
                    icon: '📋'
                };
        }
    };

    // Pagination component
    const Pagination = () => {
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
                    pages.push(1, 2, 3, 4, '...', totalPages);
                } else if (currentPage >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                } else {
                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                }
            }

            return pages;
        };

        return (
            <div className=" rounded-sm card p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(endIndex, payments.length)} of {payments.length} payments
                    </div>

                    <div className="flex items-center space-x-1">
                        {/* Previous button */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Previous
                        </button>

                        {/* Page numbers */}
                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' ? goToPage(page) : null}
                                disabled={page === '...'}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${page === currentPage
                                    ? 'bg-red-500 text-white'
                                    : page === '...'
                                        ? 'bg-white text-gray-400 cursor-default'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next button */}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-sm shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="">
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => handleFilterChange(filter.value)}
                            className={`flex items-center px-4 py-2 font-medium transition-all duration-200 ${activeFilter === filter.value
                                ? 'bg-red-500 text-white transform scale-105'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-200 hover:scale-102'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment Cards */}
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-2">⚠️</span>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {payments.length === 0 && !loading ? (
                    <div className="bg-white rounded-lg  p-8 text-center">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Payment History</h3>
                        <p className="text-gray-600">
                            {activeFilter === 'ALL'
                                ? "You haven't made any payments yet."
                                : `No ${activeFilter.toLowerCase()} payments found.`
                            }
                        </p>
                        <button
                            onClick={() => fetchPaymentHistory(activeFilter === 'ALL' ? null : activeFilter)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Refresh
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Current page payments */}
                        {currentPayments.map((payment) => {
                            const serviceDetails = getServiceDetails(payment);
                            return (
                                <div key={payment._id || payment.id || payment.bookingId} className=" rounded-lg card duration-200">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            {/* Left Section */}
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <h5 className="text-lg font-semibold text-gray-900 truncate">
                                                            {serviceDetails.title}
                                                        </h5>
                                                        {getStatusBadge(payment.status || payment.bookingStatus)}
                                                    </div>

                                                    <p className="text-gray-600 mb-1">{serviceDetails.subtitle}</p>

                                                    {serviceDetails.additionalInfo && (
                                                        <p className="text-sm text-gray-500 mb-1">{serviceDetails.additionalInfo}</p>
                                                    )}

                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>Booking ID: {payment.bookingId || payment.id || payment._id || 'Not available'}</span>
                                                        <span>•</span>
                                                        <span>{payment.paymentMethod || payment.paymentMode || payment.gateway || 'Online Payment'}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <span>
                                                            {payment.pnr ? `PNR: ${payment.pnr}` : 
                                                             payment.transactionId ? `Transaction ID: ${payment.transactionId}` :
                                                             payment.txnId ? `Transaction ID: ${payment.txnId}` :
                                                             payment.paymentId ? `Payment ID: ${payment.paymentId}` : 
                                                             'Transaction ID: Not available'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section */}
                                            <div className="flex-shrink-0 text-right ml-4">
                                                <div className="text-xl font-bold text-gray-900 mb-1">
                                                    {formatAmount(payment.amount || payment.totalAmount || payment.price || payment.invoiceAmount)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(payment.createdAt || payment.date || payment.paymentDate || payment.timestamp || payment.bookingDate)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        <Pagination />
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;