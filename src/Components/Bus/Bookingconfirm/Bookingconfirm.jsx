// src/components/Bus/BusConfirmation.js - ENHANCED VERSION

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaRedo, FaBus, FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaTicketAlt, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const Bookingconfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [invoiceStatus, setInvoiceStatus] = useState('pending');
    const [retryCount, setRetryCount] = useState(0);

    // Extract data from navigation state
    const {
        bookingDetails = {},
        bookingResult = {},
        isBooked = false,
        invoiceData = null,
        finalAmount = 0,
        paymentId = '',
        orderId = '',
        extractedBookingId = null
    } = state || {};

    const {
        contactData = {},
        passengerData = [],
        searchTokenId = '',
        bus = {},
        fromCity = '',
        toCity = '',
        departDate = '',
        selectedSeats = [],
        totalPrice = 0,
        selectedBoardingPoint = {},
        selectedDroppingPoint = {}
    } = bookingDetails || {};

    // Extract BookingId from result with multiple fallback strategies
    const extractBookingIdFromResult = (result) => {
        const possiblePaths = [
            extractedBookingId, // First check the extracted ID from payment flow
            result?.BookingId,
            result?.bookingId,
            result?.data?.BookingId,
            result?.data?.bookingId,
            result?.response?.BookingId,
            result?.result?.BookingId,
            result?.booking?.id,
            result?.id
        ];

        for (let candidateId of possiblePaths) {
            if (candidateId && String(candidateId).trim() !== '' && candidateId !== 'undefined' && candidateId !== 'null') {
                return String(candidateId);
            }
        }
        return null;
    };

    const bookingId = extractBookingIdFromResult(bookingResult);

    // Get invoice payload
    const getInvoicePayload = () => {
        if (invoiceData && invoiceData.BookingId && invoiceData.SearchTokenId) {
            return invoiceData;
        }

        if (bookingId && searchTokenId) {
            return {
                UserIp: "122.161.64.143",
                SearchTokenId: searchTokenId,
                BookingId: String(bookingId),
                receiverEmail: contactData?.email ||
                    passengerData[0]?.email ||
                    "mohitverma8817@gmail.com"
            };
        }
        return null;
    };

    // Extract seat names for display
    const extractSeatName = (seat, index) => {
        if (!seat) return `S${index + 1}`;

        let seatName = seat.SeatName || seat.seatName || seat.seatNumber || seat.name || seat.id || seat.number || seat;

        if (typeof seatName === 'string' && seatName.trim()) {
            return seatName.trim();
        }

        if (typeof seatName === 'number' && !isNaN(seatName)) {
            return seatName.toString();
        }

        return `S${index + 1}`;
    };

    // Show success toast on mount
    useEffect(() => {
        if (isBooked && bookingResult) {
            toast.success('Bus booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        }
    }, [isBooked, bookingResult]);

    // Enhanced response processing for file downloads
    const processApiResponse = async (result) => {
        console.log('Processing API response:', result);

        // Check if the result is a Blob (PDF file)
        if (result instanceof Blob) {
            console.log('Blob response detected, downloading PDF...');

            // Create download link
            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bus-invoice-${bookingId || 'booking'}-${Date.now()}.pdf`;
            link.style.display = 'none';

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);

            setInvoiceStatus('ready');
            toast.success('Invoice downloaded successfully!', {
                position: "top-right",
                autoClose: 5000
            });
            return true;
        }

        // Handle JSON response
        if (result && typeof result === 'object') {
            console.log('JSON response received:', result);

            // Check for success in various response formats
            if (result.success === true || result.status === 'success') {
                if (result.alreadyExists) {
                    setInvoiceStatus('ready');
                    toast.success('Invoice already generated and sent to your email!', {
                        position: "top-right",
                        autoClose: 6000
                    });
                    return true;
                } else if (result.downloaded || result.fileUrl || result.downloadUrl) {
                    // If there's a file URL, try to download it
                    if (result.fileUrl || result.downloadUrl) {
                        const fileUrl = result.fileUrl || result.downloadUrl;
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = result.filename || `bus-invoice-${bookingId}.pdf`;
                        link.click();
                    }

                    setInvoiceStatus('ready');
                    toast.success(`Invoice downloaded successfully! ${result.filename ? `(${result.filename})` : ''}`, {
                        position: "top-right",
                        autoClose: 5000
                    });
                    return true;
                } else if (result.generating || result.processing) {
                    setInvoiceStatus('generating');
                    toast.info('Invoice is being generated, retrying in 3 seconds...', {
                        position: "top-right",
                        autoClose: 3000
                    });
                    return 'retry';
                } else {
                    setInvoiceStatus('ready');
                    toast.success(result.message || 'Invoice processed successfully!', {
                        position: "top-right",
                        autoClose: 5000
                    });
                    return true;
                }
            } else {
                // Handle specific HTTP 409 conflict error (invoice already exists)
                if (result.status === 409 || result.code === 409 ||
                    (result.message && result.message.toLowerCase().includes('conflict')) ||
                    (result.message && result.message.toLowerCase().includes('already exists'))) {
                    setInvoiceStatus('ready');
                    toast.success('Invoice already exists and has been sent to your email!', {
                        position: "top-right",
                        autoClose: 6000
                    });
                    return true;
                }

                // Check if it's an error due to invoice generation in progress
                if (result.message &&
                    (result.message.toLowerCase().includes('generating') ||
                        result.message.toLowerCase().includes('processing') ||
                        result.message.toLowerCase().includes('not ready'))) {
                    setInvoiceStatus('generating');
                    return 'retry';
                }

                const errorMessage = result.message || result.error || result.errorMessage || 'Unknown error occurred';
                console.error('API Error Response:', result);
                setInvoiceStatus('error');
                toast.error(`${errorMessage}`, {
                    position: "top-right",
                    autoClose: 6000
                });
                return false;
            }
        } else {
            console.error('Unexpected response format:', result);
            setInvoiceStatus('error');
            toast.error('Unexpected response format from server', {
                position: "top-right",
                autoClose: 6000
            });
            return false;
        }
    };

    // Enhanced invoice download handler with retry mechanism
    const handleDownloadInvoice = async (isRetry = false) => {
        const payload = getInvoicePayload();

        if (!payload) {
            toast.error('Cannot download invoice - missing booking information');
            return;
        }

        if (!isRetry) {
            setRetryCount(0);
            setInvoiceStatus('pending');
        }

        console.log('Sending invoice request with payload:', payload);
        setLoading(true);

        try {
            const result = await downloadBusInvoice(payload);
            const processResult = await processApiResponse(result);

            if (processResult === 'retry' && retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    handleDownloadInvoice(true);
                }, 3000);
            } else if (processResult === 'retry' && retryCount >= 3) {
                setInvoiceStatus('error');
                toast.error('Invoice generation is taking too long. Please try again later.', {
                    position: "top-right",
                    autoClose: 6000
                });
            }

        } catch (error) {
            console.error('Invoice download error:', error);

            let errorMessage = 'Failed to download invoice. Please try again.';

            if (error.response) {
                console.error('HTTP Error Response:', error.response);
                const status = error.response.status;
                const data = error.response.data;

                // Handle specific HTTP status codes
                if (status === 409) {
                    // Conflict - invoice already exists
                    setInvoiceStatus('ready');
                    toast.success('Invoice already exists and has been sent to your email!', {
                        position: "top-right",
                        autoClose: 6000
                    });
                    return;
                }

                errorMessage = data?.message ||
                    data?.error ||
                    `HTTP ${status}: ${error.response.statusText}`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setInvoiceStatus('error');
            toast.error(`${errorMessage}`, {
                position: "top-right",
                autoClose: 6000
            });
        } finally {
            setLoading(false);
        }
    };

    // Manual retry function
    const handleRetry = () => {
        setRetryCount(0);
        handleDownloadInvoice();
    };

    // Navigate back to home
    const handleBackToHome = () => {
        navigate('/');
    };

    // Redirect if no booking data
    if (!state || !isBooked || !bookingResult) {
        navigate('/');
        return null;
    }

    const invoicePayload = getInvoicePayload();
    const seatNumbers = selectedSeats.map((seat, index) => extractSeatName(seat, index)).join(', ');
    const gstAmount = (totalPrice * 0.18).toFixed(2);

    return (
        <Container className="py-4 innerpagecontainer">
            {/* Success Header */}
            <div className="text-center mb-4">
                <div className="mb-3">
                    <FaCheckCircle className="text-success" size={60} />
                </div>
                <h2 className="text-success fw-bold mb-2">Booking Confirmed!</h2>
                <p className="text-muted">Your bus ticket has been booked successfully</p>
                {bookingId && (
                    <div className="mb-3">
                        <Badge bg="success" className="fs-6 px-3 py-2">
                            Booking ID: {bookingId}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Booking Details Card */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5 className="fw-bold mb-0"><FaTicketAlt className="me-2" />Booking Details</h5>
                </Card.Header>
                <Card.Body>
                    <Row className="g-4">
                        <Col md={6}>
                            <div className="border-end pe-4">
                                <h6 className="text-primary mb-3"><FaBus className="me-2" />Journey Information</h6>
                                <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <FaMapMarkerAlt className="text-danger me-2" />
                                        <strong>Route:</strong>
                                    </div>
                                    <div className="ms-4">
                                        <div className="fw-bold">{fromCity} → {toCity}</div>
                                        <small className="text-muted">{bus?.operator || 'N/A'}</small>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <FaCalendarAlt className="text-primary me-2" />
                                        <strong>Travel Date:</strong>
                                    </div>
                                    <div className="ms-4">
                                        {departDate ? new Date(departDate).toDateString() : 'N/A'}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <FaTicketAlt className="text-success me-2" />
                                        <strong>Seat Numbers:</strong>
                                    </div>
                                    <div className="ms-4">
                                        <Badge bg="secondary" className="me-1">{seatNumbers}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaUser className="text-info me-2" />
                                        <strong>Passengers:</strong>
                                    </div>
                                    <div className="ms-4">
                                        {passengerData.map((passenger, index) => (
                                            <div key={index} className="mb-1">
                                                {passenger.firstName} {passenger.lastName}
                                                <small className="text-muted ms-2">({passenger.age} years, {passenger.gender})</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col md={6}>
                            <h6 className="text-primary mb-3"><FaMapMarkerAlt className="me-2" />Boarding & Dropping Points</h6>

                            <div className="mb-4">
                                <strong className="text-success">Boarding Point:</strong>
                                <div className="mt-2 p-2 bg-light rounded">
                                    <div className="fw-bold">{selectedBoardingPoint?.BoardingPointName || 'N/A'}</div>
                                    <small className="text-muted">{selectedBoardingPoint?.Address || ''}</small>
                                    {selectedBoardingPoint?.Time && (
                                        <div className="mt-1">
                                            <FaClock className="me-1" />
                                            <small>{selectedBoardingPoint.Time}</small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <strong className="text-danger">Dropping Point:</strong>
                                <div className="mt-2 p-2 bg-light rounded">
                                    <div className="fw-bold">{selectedDroppingPoint?.DroppingPointName || 'N/A'}</div>
                                    <small className="text-muted">{selectedDroppingPoint?.Address || ''}</small>
                                    {selectedDroppingPoint?.Time && (
                                        <div className="mt-1">
                                            <FaClock className="me-1" />
                                            <small>{selectedDroppingPoint.Time}</small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong>Contact Information:</strong>
                                <div className="mt-2">
                                    <div><FaEnvelope className="me-2" />{contactData?.email || 'N/A'}</div>
                                    <div className="mt-1">📱 {contactData?.mobile || 'N/A'}</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Payment Summary Card */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-success text-white">
                    <h6 className="fw-bold mb-0">💳 Payment Summary</h6>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <div className="mb-2">
                                <span>Base Fare ({selectedSeats.length} seats):</span>
                                <span className="float-end fw-bold">₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="mb-2">
                                <span>Taxes & GST (18%):</span>
                                <span className="float-end fw-bold">₹{gstAmount}</span>
                            </div>
                            <hr />
                            <div className="mb-2 fs-5">
                                <span className="fw-bold">Total Amount Paid:</span>
                                <span className="float-end fw-bold text-success">₹{finalAmount}</span>
                            </div>
                        </Col>
                        <Col md={6}>
                            {paymentId && (
                                <div className="bg-light p-3 rounded">
                                    <div><strong>Payment ID:</strong></div>
                                    <small className="text-muted">{paymentId}</small>
                                    {orderId && (
                                        <>
                                            <div className="mt-2"><strong>Order ID:</strong></div>
                                            <small className="text-muted">{orderId}</small>
                                        </>
                                    )}
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Invoice Download Section */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-danger text-white">
                    <h6 className="fw-bold mb-0">📄 Download Your Invoice</h6>
                </Card.Header>
                <Card.Body>
                    {/* Status Alert */}
                    {invoiceStatus === 'generating' && (
                        <Alert variant="info" className="mb-3">
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" size="sm" className="me-2" />
                                <span>Invoice is being generated... Retry attempt {retryCount + 1}/3</span>
                            </div>
                        </Alert>
                    )}

                    {invoiceStatus === 'error' && (
                        <Alert variant="warning" className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <span>⚠️ There was an issue downloading the invoice.</span>
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={handleRetry}
                                    disabled={loading}
                                >
                                    <FaRedo className="me-1" />
                                    Retry
                                </Button>
                            </div>
                        </Alert>
                    )}

                    <div className="text-center">
                        <Button
                            variant="danger"
                            size="lg"
                            className="fw-bold px-5"
                            onClick={() => handleDownloadInvoice()}
                            disabled={loading || !invoicePayload}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    {invoiceStatus === 'generating' ? 'Retrying...' : 'Processing...'}
                                </>
                            ) : (
                                <>
                                    <FaDownload className="me-2" />
                                    Download Invoice
                                </>
                            )}
                        </Button>

                        {!invoicePayload && (
                            <div className="mt-3">
                                <small className="text-danger">
                                    ⚠️ Invoice download unavailable - missing booking information
                                </small>
                            </div>
                        )}

                        <div className="mt-3">
                            <small className="text-muted">
                                📄 Click above to download your booking invoice as a PDF file.
                                {retryCount > 0 && <><br />ℹ️ If first attempt fails, the system will automatically retry.</>}
                            </small>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="text-center">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleBackToHome}
                    className="px-5"
                >
                    Back to Home
                </Button>
            </div>
        </Container>
    );
};

export default Bookingconfirm;