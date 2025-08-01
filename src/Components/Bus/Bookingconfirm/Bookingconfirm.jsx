// src/components/Bus/BusConfirmation.js - FIXED Version with Correct Payload

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const Bookingconfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [invoiceReady, setInvoiceReady] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Extract data from navigation state
    const {
        bookingDetails = {},
        bookingResult = {},
        isBooked = false,
        invoiceData = null, // ✅ NEW: Get pre-formatted invoice data from payment component
        invoiceDownloaded = false,
        invoiceDownloadResult = null
    } = state || {};

    const {
        contactData = {},
        passengerData = [],
        searchTokenId = ''
    } = bookingDetails || {};

    // ✅ FIXED: Get booking ID from booking result with better fallback handling
    const bookingId = bookingResult?.data?.BookingId ||
        bookingResult?.BookingId ||
        bookingResult?.booking_id;

    // ✅ FIXED: Use the invoiceData passed from payment component or create fallback
    const getInvoicePayload = () => {
        // Priority 1: Use pre-formatted invoice data from payment component
        if (invoiceData && invoiceData.BookingId && invoiceData.SearchTokenId) {
            console.log('✅ Using pre-formatted invoice data:', invoiceData);
            return invoiceData;
        }

        // Priority 2: Create payload from available data
        if (bookingId && searchTokenId) {
            const fallbackPayload = {
                UserIp: "223.177.107.156", // ✅ Your specified IP
                SearchTokenId: searchTokenId,
                BookingId: String(bookingId), // ✅ Ensure string format
                receiverEmail: contactData?.email || 
                              passengerData[0]?.email || 
                              passengerData[0]?.Email || 
                              "ay942115@gmail.com" // ✅ Your fallback email
            };
            console.log('✅ Created fallback invoice payload:', fallbackPayload);
            return fallbackPayload;
        }

        console.warn('⚠️ Cannot create invoice payload - missing data');
        return null;
    };

    // Show success toast on component mount
    useEffect(() => {
        if (isBooked && bookingResult) {
            if (invoiceDownloaded) {
                toast.success('🎉 Bus booking confirmed and invoice downloaded successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.success('🎉 Bus booking confirmed successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    }, [isBooked, bookingResult, invoiceDownloaded]);

    // Check if booking data is available on component mount
    useEffect(() => {
        const payload = getInvoicePayload();
        if (payload) {
            setInvoiceReady(true);
            setCheckingStatus(false);
        } else {
            setInvoiceReady(false);
            setCheckingStatus(false);
        }
    }, [bookingId, searchTokenId, invoiceData]);

    // ✅ FIXED: Enhanced invoice download handler with correct payload format
    const handleDownloadInvoice = async () => {
        // Get the correct invoice payload
        const payload = getInvoicePayload();
        
        if (!payload) {
            toast.error('❌ Cannot download invoice - missing booking information', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        // Additional validation
        if (!payload.BookingId) {
            toast.error('❌ Booking ID is missing', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (!payload.SearchTokenId) {
            toast.error('❌ Search Token ID is missing', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        setLoading(true);

        try {
            console.log('🚀 Starting invoice download...');
            console.log('📤 Invoice payload being sent:', payload);

            // Show loading toast
            const loadingToastId = toast.info('📄 Preparing your invoice...', {
                position: "top-right",
                autoClose: false,
                hideProgressBar: false,
            });

            // ✅ FIXED: Use the exact payload format you specified
            const result = await downloadBusInvoice(payload);

            // Dismiss loading toast
            toast.dismiss(loadingToastId);

            console.log('✅ Invoice download result:', result);

            // Success message
            if (result?.filename) {
                toast.success(`✅ Invoice downloaded successfully! (${result.filename})`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.success('✅ Invoice downloaded successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }

        } catch (error) {
            console.error('❌ Invoice download error:', error);
            
            // Enhanced error handling
            let errorMessage = 'Failed to download invoice. Please try again.';
            
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.Error?.ErrorMessage) {
                errorMessage = error.response.data.Error.ErrorMessage;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.status) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = 'Invalid invoice request. Please check booking details.';
                        break;
                    case 404:
                        errorMessage = 'Invoice not found. It may not be generated yet.';
                        break;
                    case 500:
                        errorMessage = 'Server error while generating invoice. Please try again later.';
                        break;
                    default:
                        errorMessage = `Invoice download failed (Status: ${error.response.status})`;
                }
            }

            toast.error(`❌ ${errorMessage}`, {
                position: "top-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

        } finally {
            setLoading(false);
        }
    };

    // ✅ Enhanced debug logging
    useEffect(() => {
        console.log('🐛 Debug - BusConfirmation Component State:');
        console.log('📋 Booking ID:', bookingId);
        console.log('🔑 Search Token ID:', searchTokenId);
        console.log('👤 Contact Data:', contactData);
        console.log('🧳 Passenger Data:', passengerData);
        console.log('✅ Is Booked:', isBooked);
        console.log('📄 Booking Result:', bookingResult);
        console.log('🎫 Invoice Data (from payment):', invoiceData);
        console.log('📥 Invoice Downloaded:', invoiceDownloaded);
        console.log('📊 Invoice Download Result:', invoiceDownloadResult);
        console.log('🔧 Final Invoice Payload:', getInvoicePayload());
    }, [bookingId, searchTokenId, contactData, passengerData, isBooked, bookingResult, invoiceData, invoiceDownloaded, invoiceDownloadResult]);

    // Redirect if no booking data
    if (!state || !isBooked || !bookingResult) {
        console.warn('⚠️ Missing booking data, redirecting to home');
        navigate('/');
        return null;
    }

    // ✅ Get invoice payload for validation
    const invoicePayload = getInvoicePayload();

    return (
        <Container className="py-4 innerpagecontainer mt-5 pt-5">
            {/* Success Header */}
            <Card className="mb-4 shadow-lg border-success">
                <Card.Body className="text-center bg-success text-white">
                    <FaCheckCircle className="mb-3" size={64} />
                    <h2 className="fw-bold mb-2">🎉 Booking Confirmed!</h2>
                    <p className="mb-0 fs-5">Your bus ticket has been successfully booked</p>
                    {bookingId && (
                        <p className="mb-0 mt-2">
                            <small>Booking ID: <strong>{bookingId}</strong></small>
                        </p>
                    )}
                    {invoiceDownloaded && (
                        <p className="mb-0 mt-1">
                            <small className="badge bg-light text-success">✅ Invoice Downloaded</small>
                        </p>
                    )}
                </Card.Body>
            </Card>

            {/* ✅ Invoice Download Status */}
            {invoiceDownloaded && invoiceDownloadResult && (
                <Alert variant="success" className="mb-4">
                    <FaCheckCircle className="me-2" />
                    <strong>Invoice Status:</strong> Your invoice has been automatically downloaded during booking.
                    {invoiceDownloadResult.success && (
                        <div className="mt-2">
                            <small>You can download it again using the button below if needed.</small>
                        </div>
                    )}
                </Alert>
            )}

            {/* ✅ Enhanced Debug Information (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
                <Alert variant="info" className="mb-4">
                    <h6>🐛 Debug Info:</h6>
                    <small>
                        <strong>Booking ID:</strong> {bookingId || 'Not found'}<br/>
                        <strong>Search Token:</strong> {searchTokenId || 'Not found'}<br/>
                        <strong>Email:</strong> {contactData?.email || passengerData[0]?.email || 'Not found'}<br/>
                        <strong>Invoice Data Available:</strong> {invoiceData ? 'Yes' : 'No'}<br/>
                        <strong>Invoice Payload Ready:</strong> {invoicePayload ? 'Yes' : 'No'}<br/>
                        {invoicePayload && (
                            <>
                                <strong>UserIp:</strong> {invoicePayload.UserIp}<br/>
                                <strong>receiverEmail:</strong> {invoicePayload.receiverEmail}
                            </>
                        )}
                    </small>
                </Alert>
            )}

            {/* ✅ Enhanced Missing Data Warning */}
            {!invoicePayload && (
                <Alert variant="warning" className="mb-4">
                    <FaExclamationTriangle className="me-2" />
                    <strong>Warning:</strong> Invoice download information is not available.
                    <ul className="mb-0 mt-2">
                        {!bookingId && <li>Booking ID is missing</li>}
                        {!searchTokenId && <li>Search Token ID is missing</li>}
                        {!invoiceData && <li>Invoice data was not passed from payment process</li>}
                    </ul>
                    <div className="mt-2">
                        <small className="text-muted">
                            This may happen if the booking process was interrupted. 
                            Please contact support with your booking details.
                        </small>
                    </div>
                </Alert>
            )}

            {/* Download Invoice Button */}
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h6 className="fw-bold mb-0">📄 Invoice & Actions</h6>
                </Card.Header>
                <Card.Body className="text-center">
                    {checkingStatus ? (
                        <div className="mb-3">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <span>Checking invoice status...</span>
                        </div>
                    ) : (
                        <>
                            {invoicePayload ? (
                                <Button
                                    variant="success"
                                    size="lg"
                                    className="fw-bold px-5"
                                    onClick={handleDownloadInvoice}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload className="me-2" />
                                            {invoiceDownloaded ? 'Download Invoice Again' : 'Download Invoice'}
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="fw-bold px-5"
                                    disabled
                                >
                                    <FaExclamationTriangle className="me-2" />
                                    Invoice Not Available
                                </Button>
                            )}

                            {/* ✅ Enhanced help text */}
                            <div className="mt-3">
                                {invoicePayload ? (
                                    <small className="text-muted">
                                        {invoiceDownloaded 
                                            ? 'Your invoice was downloaded during booking. Click above to download again.'
                                            : 'Click above to download your booking invoice.'
                                        }
                                    </small>
                                ) : (
                                    <small className="text-muted">
                                        Invoice download is not available due to missing booking information.
                                        Please contact support for assistance.
                                    </small>
                                )}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* ✅ Booking Details Summary */}
            {bookingDetails && Object.keys(bookingDetails).length > 0 && (
                <Card className="shadow-sm mt-4">
                    <Card.Header className="bg-light">
                        <h6 className="fw-bold mb-0">🎫 Booking Summary</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="row">
                            {bookingDetails.fromCity && bookingDetails.toCity && (
                                <div className="col-md-6 mb-2">
                                    <strong>Route:</strong> {bookingDetails.fromCity} → {bookingDetails.toCity}
                                </div>
                            )}
                            {bookingDetails.departDate && (
                                <div className="col-md-6 mb-2">
                                    <strong>Travel Date:</strong> {new Date(bookingDetails.departDate).toDateString()}
                                </div>
                            )}
                            {bookingDetails.bus?.operator && (
                                <div className="col-md-6 mb-2">
                                    <strong>Bus Operator:</strong> {bookingDetails.bus.operator}
                                </div>
                            )}
                            {bookingDetails.finalAmount && (
                                <div className="col-md-6 mb-2">
                                    <strong>Total Amount:</strong> <span className="text-success fw-bold">₹{bookingDetails.finalAmount}</span>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Additional Actions */}
            <Card className="shadow-sm mt-4">
                <Card.Body className="text-center">
                    <Button
                        variant="outline-primary"
                        onClick={() => navigate('/bus-bookings')}
                        className="me-3"
                    >
                        View My Bookings
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/')}
                    >
                        Book Another Ticket
                    </Button>
                </Card.Body>
            </Card>

            {/* ✅ Support Information */}
            <Card className="shadow-sm mt-4">
                <Card.Body className="text-center bg-light">
                    <small className="text-muted">
                        <strong>Need Help?</strong><br/>
                        If you have any issues with your booking or invoice download, 
                        please contact our support team with your Booking ID: <strong>{bookingId}</strong>
                    </small>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Bookingconfirm;