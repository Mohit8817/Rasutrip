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

    const filterOptions = [
        { value: 'ALL', label: 'All Payments', icon: '📋' },
        { value: 'FLIGHT', label: 'Flight', icon: '✈️' },
        { value: 'HOTEL', label: 'Hotel', icon: '🏨' },
        { value: 'BUS', label: 'Bus', icon: '🚌' }
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
                const sortedPayments = result.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setPayments(sortedPayments);
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

    const getStatusBadge = (status) => {
        const statusStyles = {
            SUCCESS: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            REFUNDED: 'bg-blue-100 text-blue-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getServiceDetails = (payment) => {
        switch (payment.type) {
            case 'FLIGHT':
                return {
                    title: payment.flightDetails || payment.serviceName || 'Flight Booking',
                    subtitle: payment.route || `${payment.serviceDetails?.from || ''} → ${payment.serviceDetails?.to || ''}` || 'N/A',
                    additionalInfo: payment.serviceDetails?.passengers ? `${payment.serviceDetails.passengers} Passengers` : null,
                    icon: '✈️'
                };
            case 'HOTEL':
                return {
                    title: payment.hotelName || payment.serviceDetails?.hotelName || payment.serviceName || 'Hotel Booking',
                    subtitle: payment.city || payment.serviceDetails?.hotelLocation || 'N/A',
                    additionalInfo: payment.serviceDetails?.rooms ? `${payment.serviceDetails.rooms} Rooms` : null,
                    icon: '🏨'
                };
            case 'BUS':
                return {
                    title: payment.busOperator || payment.serviceDetails?.busName || payment.serviceName || 'Bus Booking',
                    subtitle: payment.route || payment.serviceDetails?.route || 'N/A',
                    additionalInfo: payment.serviceDetails?.seats ? `Seats: ${payment.serviceDetails.seats}` : null,
                    icon: '🚌'
                };
            default:
                return {
                    title: payment.serviceName || 'Booking',
                    subtitle: 'N/A',
                    additionalInfo: null,
                    icon: '📋'
                };
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
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
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-3xl font-bold text-gray-700 mb-2">Payment History</h4>
                        <p className="text-gray-400">Track all your booking payments and transactions</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {userType === 'agent' ? 'Agent' : 'Customer'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => handleFilterChange(filter.value)}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeFilter === filter.value
                                ? 'bg-red-500 text-white shadow-lg transform scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                                }`}
                        >
                            <span className="mr-2">{filter.icon}</span>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment Cards */}
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-2">⚠️</span>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {payments.length === 0 && !loading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">💳</div>
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
                    payments.map((payment) => {
                        const serviceDetails = getServiceDetails(payment);
                        return (
                            <div key={payment._id || payment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        {/* Left Section */}
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                                                    {serviceDetails.icon}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h5 className="text-lg font-semibold text-gray-900 truncate">
                                                        {serviceDetails.title}
                                                    </h5>
                                                    {getStatusBadge(payment.status)}
                                                </div>

                                                <p className="text-gray-600 mb-1">{serviceDetails.subtitle}</p>

                                                {serviceDetails.additionalInfo && (
                                                    <p className="text-sm text-gray-500 mb-1">{serviceDetails.additionalInfo}</p>
                                                )}

                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>Booking ID: {payment.bookingId || payment.id || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span>{payment.paymentMethod || payment.paymentMode || 'Online Payment'}</span>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                    <span>Transaction ID: {payment.transactionId || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section */}
                                        <div className="flex-shrink-0 text-right ml-4">
                                            <div className="text-xl font-bold text-gray-900 mb-1">
                                                {formatAmount(payment.amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(payment.createdAt || payment.date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;