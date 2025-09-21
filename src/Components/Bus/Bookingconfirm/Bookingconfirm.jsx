import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Bus, Ticket, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { downloadBusInvoice } from '../../APIS/BusApi/BusApis'; // Adjust import path
import BusInvoice from './BusInvoice'; // Adjust import path

const BookingConfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    console.log('Booking data:', invoiceData);

    // Extract data from navigation state
    const {
        paymentId,
        orderId,
        bookingDetails,
        finalAmount,
        validationResult,
        bookingResult,
        extractedBookingId,
        appliedCouponData,
        couponDiscount
    } = state || {};

    useEffect(() => {
        if (!state) {
            navigate('/');
            return;
        }

        // Auto-fetch invoice data on component mount
        if (extractedBookingId || bookingResult) {
            fetchInvoiceData();
        }
    }, [state, extractedBookingId]);

    const fetchInvoiceData = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching invoice data...');

            const invoicePayload = {
                UserIp: "122.161.64.143",
                SearchTokenId: bookingDetails?.searchTokenId || bookingDetails?.bus?.SearchTokenId || "",
                BookingId: extractedBookingId || bookingResult?.BookingId || bookingResult?.bookingId,
                receiverEmail: bookingDetails?.contactData?.email || ""
            };

            console.log('Invoice API payload:', invoicePayload);

            const response = await downloadBusInvoice(invoicePayload);
            console.log('Invoice API response:', response);

            if (response && (response.data || response)) {
                const invoiceDetails = response.data || response;
                setInvoiceData(invoiceDetails);

                toast.success('Invoice data loaded successfully!', {
                    position: "top-right",
                    autoClose: 3000
                });
            } else {
                throw new Error('Invalid invoice response');
            }

        } catch (err) {
            console.error('Failed to fetch invoice:', err);
            setError('Failed to load invoice data. You can still view your booking confirmation.');

            toast.error('Invoice loading failed', {
                position: "top-right",
                autoClose: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = () => {
        if (invoiceData) {
            setShowInvoice(true);
        } else {
            toast.warn('Invoice data not available. Please try refreshing.');
        }
    };

    if (!state) {
        return (
            <div className="container mx-auto py-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No booking data found. Please start a new booking.</p>
                </div>
            </div>
        );
    }

    // Extract passenger and booking details
    const passengers = bookingDetails?.passengerData || [];
    const contactInfo = bookingDetails?.contactData || {};
    const busInfo = bookingDetails?.bus || {};
    const selectedSeats = bookingDetails?.selectedSeats || [];

    return (
        <div className="container mx-auto py-4 px-4 max-w-6xl">
            {/* Success Header */}
            <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 mb-6">
                <div className="p-6 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-4">
                        Your bus ticket has been booked successfully
                    </p>
                    {extractedBookingId && (
                        <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                            Booking ID: {extractedBookingId}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="bg-gray-50 px-6 py-3 border-b rounded-t-lg">
                    <h5 className="font-bold text-lg flex items-center">
                        <Ticket className="mr-2" size={20} />
                        Payment Confirmation
                    </h5>
                </div>
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="mb-2"><strong>Payment ID:</strong> {paymentId || 'N/A'}</p>
                            <p className="mb-2"><strong>Order ID:</strong> {orderId || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="mb-2"><strong>Amount Paid:</strong> ₹{finalAmount || 'N/A'}</p>
                            <p className="mb-2">
                                <strong>Status:</strong>
                                <span className="text-green-600 font-bold ml-2">Confirmed</span>
                            </p>
                        </div>
                    </div>

                    {appliedCouponData && couponDiscount > 0 && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <h6 className="text-green-700 font-bold mb-2">Coupon Applied!</h6>
                            <p className="text-green-600 mb-0">
                                <strong>{appliedCouponData.code}</strong> -
                                You saved ₹{couponDiscount}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Travel Details */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="bg-gray-50 px-6 py-3 border-b rounded-t-lg">
                    <h5 className="font-bold text-lg flex items-center">
                        <Bus className="mr-2" size={20} />
                        Travel Details
                    </h5>
                </div>
                <div className="p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <div className="font-semibold text-gray-700">Route:</div>
                            <div className="text-gray-900">{bookingDetails?.fromCity} → {bookingDetails?.toCity}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-700">Travel Date:</div>
                            <div className="text-gray-900">{bookingDetails?.departDate ? new Date(bookingDetails.departDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-700">Bus Operator:</div>
                            <div className="text-gray-900">{busInfo?.operator || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-700">Seats:</div>
                            <div className="font-bold text-blue-600">
                                {selectedSeats.map((seat, index) => {
                                    const seatName = seat?.SeatName || seat?.Name || seat?.seatName || (index + 1);
                                    return seatName;
                                }).join(', ')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Passenger Details */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="bg-gray-50 px-6 py-3 border-b rounded-t-lg">
                    <h5 className="font-bold text-lg">Passenger Details</h5>
                </div>
                <div className="p-6">
                    {passengers.length > 0 ? passengers.map((passenger, index) => (
                        <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-2"><strong>Name:</strong> {passenger.firstName} {passenger.lastName}</p>
                                    <p className="mb-2"><strong>Age:</strong> {passenger.age}</p>
                                </div>
                                <div>
                                    <p className="mb-2"><strong>Gender:</strong> {passenger.gender}</p>
                                    {index === 0 && (
                                        <>
                                            <p className="mb-2"><strong>Contact:</strong> {contactInfo.mobile}</p>
                                            <p className="mb-2"><strong>Email:</strong> {contactInfo.email}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-600">No passenger details available</p>
                    )}
                </div>
            </div>

            {/* Invoice Section */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="bg-gray-50 px-6 py-3 border-b rounded-t-lg">
                    <h5 className="font-bold text-lg">Invoice & Receipt</h5>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading invoice data...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 mb-3">{error}</p>
                            <button
                                onClick={fetchInvoiceData}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : invoiceData ? (
                        <div className="text-center">
                            <p className="text-green-600 mb-4 flex items-center justify-center">
                                <CheckCircle size={20} className="mr-2" />
                                Invoice data loaded successfully
                            </p>
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
                            >
                                <Download className="mr-2" size={16} />
                                View & Download Invoice
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">Invoice will be generated shortly</p>
                            <button
                                onClick={fetchInvoiceData}
                                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg"
                            >
                                Load Invoice
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                <button
                    onClick={() => navigate('/')}
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg"
                >
                    Book Another Trip
                </button>
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                    View All Bookings
                </button>
            </div>

            {/* Invoice Modal */}
            {showInvoice && invoiceData && (
                <BusInvoice
                    invoiceData={invoiceData}
                    onClose={() => setShowInvoice(false)}
                />
            )}
        </div>
    );
};

export default BookingConfirm;