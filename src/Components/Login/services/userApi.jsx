import axios from "axios";
import baseURL from "../../../Services/Config";

// ✅ Define financial service endpoints
const FinancialServices = {
    getPaymentHistory: `${baseURL}/user/payment-history`,
    getWalletBalance: `${baseURL}/user/wallet-balance`,
};

// ✅ Get user payment history with enhanced booking data extraction
export const getPaymentHistory = async (type = null) => {
    try {
        // Get auth token - adjust based on your auth implementation
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        // Build endpoint with type filter if provided
        const endpoint = type && type !== 'ALL'
            ? `${FinancialServices.getPaymentHistory}?type=${type}`
            : FinancialServices.getPaymentHistory;

        const res = await axios.get(endpoint, {
            headers: {
                "Content-Type": "application/json",
                // Adjust authorization header format based on your API requirements
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });

        // API response format - handle your specific structure
        let paymentData = res.data.data || res.data.payments || res.data || [];

        // Enhanced data processing for booking details
        paymentData = paymentData.map(payment => {
            // Extract booking details from various possible locations
            const bookingDetails = payment.bookingDetails || payment.booking || payment.details || {};
            const metadata = payment.metadata || payment.meta || {};
            
            return {
                // Basic payment info
                id: payment.id || payment._id || payment.paymentId,
                amount: payment.amount || 0,
                status: payment.status || 'PENDING',
                type: payment.type || payment.paymentType || 'BOOKING',
                createdAt: payment.createdAt || payment.created_at || payment.date,
                
                // Transaction details
                transactionId: payment.transactionId || payment.transaction_id || payment.txnId || 'N/A',
                paymentMode: payment.paymentMode || payment.payment_mode || payment.mode,
                
                // Booking specific details
                bookingId: payment.bookingId || bookingDetails.bookingId || bookingDetails.id || 'N/A',
                bookingType: payment.bookingType || bookingDetails.type || payment.type || 'N/A',
                
                // Service details (Hotel, Flight, Bus)
                serviceName: bookingDetails.hotelName || bookingDetails.flightName || bookingDetails.busName || 
                           bookingDetails.serviceName || bookingDetails.name || metadata.serviceName || 'N/A',
                
                serviceDetails: {
                    // Hotel details
                    hotelName: bookingDetails.hotelName || metadata.hotelName,
                    hotelLocation: bookingDetails.hotelLocation || bookingDetails.location || metadata.location,
                    checkIn: bookingDetails.checkIn || bookingDetails.check_in,
                    checkOut: bookingDetails.checkOut || bookingDetails.check_out,
                    rooms: bookingDetails.rooms || bookingDetails.roomCount,
                    guests: bookingDetails.guests || bookingDetails.guestCount,
                    
                    // Flight details
                    flightNumber: bookingDetails.flightNumber || bookingDetails.flight_number,
                    airline: bookingDetails.airline || bookingDetails.airlineName,
                    from: bookingDetails.from || bookingDetails.departure,
                    to: bookingDetails.to || bookingDetails.arrival,
                    departureDate: bookingDetails.departureDate || bookingDetails.departure_date,
                    returnDate: bookingDetails.returnDate || bookingDetails.return_date,
                    passengers: bookingDetails.passengers || bookingDetails.passengerCount,
                    
                    // Bus details
                    busName: bookingDetails.busName || bookingDetails.bus_name,
                    busType: bookingDetails.busType || bookingDetails.bus_type,
                    route: bookingDetails.route,
                    boardingPoint: bookingDetails.boardingPoint || bookingDetails.boarding_point,
                    droppingPoint: bookingDetails.droppingPoint || bookingDetails.dropping_point,
                    travelDate: bookingDetails.travelDate || bookingDetails.travel_date,
                    seats: bookingDetails.seats || bookingDetails.seatNumbers
                },
                
                // Keep original payment object for fallback
                originalPayment: payment
            };
        });

        console.log("✅ Processed payment data:", paymentData);

        return {
            success: true,
            data: paymentData,
            message: "Payment history fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching payment history:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch payment history",
            error: err,
            data: []
        };
    }
};

// ✅ Get payment by ID (optional - for future use)
export const getPaymentById = async (paymentId) => {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        const res = await axios.get(`${FinancialServices.getPaymentHistory}/${paymentId}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });

        return {
            success: true,
            data: res.data.data || res.data,
            message: "Payment details fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching payment details:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch payment details",
            error: err,
            data: null
        };
    }
};

// ✅ Get user wallet balance
export const getWalletBalance = async () => {
    try {
        // Get auth token - adjust based on your auth implementation
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        const res = await axios.get(FinancialServices.getWalletBalance, {
            headers: {
                "Content-Type": "application/json",
                // Adjust authorization header format based on your API requirements
                ...(token && { "Authorization": `Bearer ${token}` })
            },
        });

        // API response format - handle your specific structure
        const walletData = res.data.data || res.data.wallet || res.data;
        const balance = walletData.balance || walletData.walletBalance || walletData.amount || 0;

        return {
            success: true,
            data: walletData,
            balance: balance,
            message: "Wallet balance fetched successfully"
        };
    } catch (err) {
        console.error("❌ Error fetching wallet balance:", err.response?.data || err.message);
        throw {
            success: false,
            message: err.response?.data?.message || err.message || "Failed to fetch wallet balance",
            error: err,
            balance: 0
        };
    }
};

// ✅ Financial utility functions
export const FinancialUtils = {
    // Format currency for display
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    },

    // Format amount without currency symbol
    formatAmount: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    },

    // Format date for display
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get status color class
    getStatusClass: (status) => {
        const statusStyles = {
            SUCCESS: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            REFUNDED: 'bg-blue-100 text-blue-800'
        };
        return statusStyles[status] || 'bg-gray-100 text-gray-800';
    },

    // Calculate total amount for successful payments
    calculateTotalAmount: (payments) => {
        return payments.reduce((sum, payment) => 
            payment.status === 'SUCCESS' ? sum + payment.amount : sum, 0
        );
    },

    // Group payments by type
    groupByType: (payments) => {
        return payments.reduce((groups, payment) => {
            const type = payment.type || 'OTHER';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(payment);
            return groups;
        }, {});
    },

    // Check if user has sufficient wallet balance
    hasSufficientBalance: (walletBalance, requiredAmount) => {
        return walletBalance >= requiredAmount;
    },

    // Get booking details for display
    getBookingDetails: (payment) => {
        if (!payment || !payment.serviceDetails) return 'N/A';
        
        const details = payment.serviceDetails;
        const type = payment.bookingType?.toLowerCase();
        
        switch (type) {
            case 'hotel':
                return details.hotelName || 'Hotel Booking';
            case 'flight':
                return `${details.airline || 'Flight'} ${details.flightNumber || ''}`.trim();
            case 'bus':
                return details.busName || 'Bus Booking';
            default:
                return payment.serviceName || 'Booking';
        }
    },

    // Get detailed booking info for expanded view
    getDetailedBookingInfo: (payment) => {
        if (!payment || !payment.serviceDetails) return [];
        
        const details = payment.serviceDetails;
        const type = payment.bookingType?.toLowerCase();
        const info = [];
        
        switch (type) {
            case 'hotel':
                if (details.hotelLocation) info.push(`Location: ${details.hotelLocation}`);
                if (details.checkIn) info.push(`Check-in: ${FinancialUtils.formatDate(details.checkIn)}`);
                if (details.checkOut) info.push(`Check-out: ${FinancialUtils.formatDate(details.checkOut)}`);
                if (details.rooms) info.push(`Rooms: ${details.rooms}`);
                if (details.guests) info.push(`Guests: ${details.guests}`);
                break;
                
            case 'flight':
                if (details.from && details.to) info.push(`Route: ${details.from} → ${details.to}`);
                if (details.departureDate) info.push(`Departure: ${FinancialUtils.formatDate(details.departureDate)}`);
                if (details.returnDate) info.push(`Return: ${FinancialUtils.formatDate(details.returnDate)}`);
                if (details.passengers) info.push(`Passengers: ${details.passengers}`);
                break;
                
            case 'bus':
                if (details.route) info.push(`Route: ${details.route}`);
                if (details.travelDate) info.push(`Travel Date: ${FinancialUtils.formatDate(details.travelDate)}`);
                if (details.boardingPoint) info.push(`Boarding: ${details.boardingPoint}`);
                if (details.seats) info.push(`Seats: ${details.seats}`);
                break;
        }
        
        return info;
    },

    // Format transaction type for display
    formatTransactionType: (type) => {
        const typeMap = {
            'WALLET_RECHARGE': 'Wallet Recharge',
            'PAYMENT': 'Payment',
            'BOOKING': 'Booking',
            'HOTEL': 'Hotel Booking',
            'FLIGHT': 'Flight Booking',
            'BUS': 'Bus Booking',
            'REFUND': 'Refund',
            'WITHDRAWAL': 'Withdrawal',
            'CASHBACK': 'Cashback',
            'OTHER': 'Other'
        };
        return typeMap[type] || type;
    },

    // Check if booking has valid details
    hasValidBookingDetails: (payment) => {
        return payment && (
            payment.bookingId !== 'N/A' || 
            payment.transactionId !== 'N/A' ||
            payment.serviceName !== 'N/A'
        );
    }
};

// ✅ Export individual utility objects for specific use cases
export const PaymentUtils = {
    formatCurrency: FinancialUtils.formatCurrency,
    formatAmount: FinancialUtils.formatAmount,
    formatDate: FinancialUtils.formatDate,
    getStatusClass: FinancialUtils.getStatusClass,
    calculateTotalAmount: FinancialUtils.calculateTotalAmount,
    groupByType: FinancialUtils.groupByType,
    formatTransactionType: FinancialUtils.formatTransactionType,
    getBookingDetails: FinancialUtils.getBookingDetails,
    getDetailedBookingInfo: FinancialUtils.getDetailedBookingInfo,
    hasValidBookingDetails: FinancialUtils.hasValidBookingDetails
};

export const WalletUtils = {
    formatCurrency: FinancialUtils.formatCurrency,
    formatAmount: FinancialUtils.formatAmount,
    hasSufficientBalance: FinancialUtils.hasSufficientBalance
};

// ✅ Export comprehensive financial service (recommended)
const FinancialService = {
    // Payment methods
    getPaymentHistory,
    getPaymentById,
    
    // Wallet methods
    getWalletBalance,
    
    // Utility methods
    formatCurrency: FinancialUtils.formatCurrency,
    formatAmount: FinancialUtils.formatAmount,
    formatDate: FinancialUtils.formatDate,
    getStatusClass: FinancialUtils.getStatusClass,
    calculateTotalAmount: FinancialUtils.calculateTotalAmount,
    groupByType: FinancialUtils.groupByType,
    hasSufficientBalance: FinancialUtils.hasSufficientBalance,
    formatTransactionType: FinancialUtils.formatTransactionType,
    getBookingDetails: FinancialUtils.getBookingDetails,
    getDetailedBookingInfo: FinancialUtils.getDetailedBookingInfo,
    hasValidBookingDetails: FinancialUtils.hasValidBookingDetails,
};

// ✅ Export backward compatibility objects
export const PaymentService = {
    getPaymentHistory,
    getPaymentById,
    formatCurrency: PaymentUtils.formatCurrency,
    formatAmount: PaymentUtils.formatAmount,
    formatDate: PaymentUtils.formatDate,
    getStatusClass: PaymentUtils.getStatusClass,
    calculateTotalAmount: PaymentUtils.calculateTotalAmount,
    groupByType: PaymentUtils.groupByType,
};

export const WalletService = {
    getWalletBalance,
    formatCurrency: WalletUtils.formatCurrency,
    formatAmount: WalletUtils.formatAmount,
    hasSufficientBalance: WalletUtils.hasSufficientBalance,
};

export default FinancialService;