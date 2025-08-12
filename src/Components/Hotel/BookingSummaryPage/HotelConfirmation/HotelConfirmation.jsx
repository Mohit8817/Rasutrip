// src/components/Hotel/HotelConfirmation.js - ENHANCED VERSION

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaHotel, FaReceipt, FaRupeeSign, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadHotelInvoice } from '../../../APIS/HotelApi/HotelAPi';

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Extract data from navigation state (matching your payment flow structure)
    const {
        booking = {},
        amount = 0,
        reviewData = {},
        hotelDetails = {},
        paymentDetails = {},
        confirmationDetails = {},
        bookingDetails = {},
        bookingResult = {},
        isBooked = false,
        invoiceData = null
    } = state || {};

    // Handle both old and new state structures
    const actualBooking = booking || bookingResult || {};
    const actualAmount = amount || 0;
    const actualHotelDetails = hotelDetails || reviewData || {};
    
    // Extract contact data from various possible locations
    const contactData = bookingDetails?.contactData || 
                       actualBooking?.HotelRoomsDetails?.[0]?.HotelPassenger?.find(p => p.LeadPassenger === "true") ||
                       actualBooking?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0] ||
                       {};
    
    const searchTokenId = confirmationDetails?.searchTokenId || 
                         bookingDetails?.searchTokenId || 
                         actualBooking?.SearchTokenId || 
                         '';

    const userIp = confirmationDetails?.userIp || 
                   actualBooking?.UserIp || 
                   "122.161.64.143";

    // Extract BookingId from result (handle multiple possible formats)
    const extractBookingIdFromResult = (result) => {
        const possiblePaths = [
            result?.BookingID,           // Your payment flow uses BookingID
            result?.bookingId,
            result?.BookingId,
            result?.data?.BookingID,
            result?.data?.BookingId,
            result?.data?.bookingId,
            result?.response?.BookingID,
            result?.response?.BookingId,
            result?.result?.BookingID,
            result?.booking?.BookingID,
            confirmationDetails?.bookingId  // From your payment success
        ];

        for (let candidateId of possiblePaths) {
            if (candidateId && String(candidateId).trim() !== '') {
                return String(candidateId);
            }
        }
        return null;
    };

    const bookingId = extractBookingIdFromResult(actualBooking);

    // Get invoice payload (matching your payment flow data structure)
    const getInvoicePayload = () => {
        // First priority: use provided invoiceData
        if (invoiceData && invoiceData.BookingId && invoiceData.SearchTokenId) {
            return invoiceData;
        }

        // Second priority: construct from confirmation details
        if (bookingId && searchTokenId) {
            return {
                UserIp: userIp,
                SearchTokenId: searchTokenId,
                BookingId: String(bookingId),
                receiverEmail: contactData?.Email ||
                    contactData?.email ||
                    confirmationDetails?.email ||
                    "mohitverma8817@gmail.com"
            };
        }
        
        return null;
    };

    // Show success toast on mount
    useEffect(() => {
        if ((isBooked && actualBooking) || confirmationDetails?.message) {
            toast.success('🎉 Hotel booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        }
    }, [isBooked, actualBooking, confirmationDetails]);

    // Enhanced invoice download handler with better error handling
    const handleDownloadInvoice = async () => {
        const payload = getInvoicePayload();

        if (!payload) {
            toast.error('❌ Cannot download invoice - missing booking information');
            return;
        }

        console.log('📤 Sending hotel invoice request with payload:', payload);
        setLoading(true);

        try {
            const result = await downloadHotelInvoice(payload);

            console.log('🏨 Raw API response:', result);
            console.log('🏨 Response type:', typeof result);

            // Check if the result is a Blob (PDF file)
            if (result instanceof Blob) {
                // Handle PDF blob response
                const url = window.URL.createObjectURL(result);
                const link = document.createElement('a');
                link.href = url;
                link.download = `hotel-invoice-${bookingId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success('✅ Hotel invoice downloaded successfully!', {
                    position: "top-right",
                    autoClose: 5000
                });
                return;
            }

            // Handle JSON response
            if (result && typeof result === 'object') {
                console.log('🏨 JSON response received:', result);

                // Check for success in various response formats
                if (result.success === true || result.status === 'success') {
                    if (result.alreadyExists) {
                        toast.success('✅ Hotel invoice already generated and sent to your email!', {
                            position: "top-right",
                            autoClose: 6000
                        });
                    } else if (result.downloaded) {
                        toast.success(`✅ Hotel invoice downloaded successfully! (${result.filename})`, {
                            position: "top-right",
                            autoClose: 5000
                        });
                    } else {
                        toast.success(result.message || '✅ Hotel invoice processed successfully!', {
                            position: "top-right",
                            autoClose: 5000
                        });
                    }
                } else {
                    // Handle API error responses
                    const errorMessage = result.message || 
                                       result.error || 
                                       result.errorMessage || 
                                       'Unknown error occurred';
                    
                    console.error('❌ Hotel API Error Response:', result);
                    toast.error(`❌ ${errorMessage}`, {
                        position: "top-right",
                        autoClose: 6000
                    });
                }
            } else {
                // Handle unexpected response format
                console.error('❌ Unexpected response format:', result);
                toast.error('❌ Unexpected response format from server', {
                    position: "top-right",
                    autoClose: 6000
                });
            }

        } catch (error) {
            console.error('❌ Hotel invoice download error:', error);
            
            // Handle different types of errors
            let errorMessage = 'Failed to download hotel invoice. Please try again.';
            
            if (error.response) {
                // HTTP error response
                console.error('❌ HTTP Error Response:', error.response);
                errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              `HTTP ${error.response.status}: ${error.response.statusText}`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(`❌ ${errorMessage}`, {
                position: "top-right",
                autoClose: 6000
            });
        } finally {
            setLoading(false);
        }
    };

    // Redirect if no booking data (handle both structures)
    if (!state || (!isBooked && !confirmationDetails?.bookingId) || (!actualBooking && !confirmationDetails)) {
        navigate('/');
        return null;
    }

    const invoicePayload = getInvoicePayload();

    return (
        <Container className="py-4 innerpagecontainer mt-5 pt-5">
            {/* Success Header */}
            <Card className="mb-4 shadow-lg border-success">
                <Card.Body className="text-center bg-success text-white">
                    <FaCheckCircle className="mb-3" size={64} />
                    <h2 className="fw-bold mb-2">🎉 Hotel Booking Confirmed!</h2>
                    <p className="mb-0 fs-5">Your hotel reservation has been successfully booked</p>
                    {bookingId && (
                        <p className="mb-0 mt-2">
                            <small>Booking ID: <strong>{bookingId}</strong></small>
                        </p>
                    )}
                </Card.Body>
            </Card>

            {/* Booking Details Section */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h6 className="fw-bold mb-0">🏨 Booking Summary</h6>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    {(actualHotelDetails?.name || actualHotelDetails?.HotelName) && (
                                        <p className="mb-2">
                                            <FaHotel className="me-2 text-primary" />
                                            <strong>Hotel:</strong> {actualHotelDetails.name || actualHotelDetails.HotelName}
                                        </p>
                                    )}
                                    <p className="mb-2">
                                        <FaReceipt className="me-2 text-primary" />
                                        <strong>Booking ID:</strong> {bookingId || 'Processing...'}
                                    </p>
                                    <p className="mb-2">
                                        <FaRupeeSign className="me-2 text-primary" />
                                        <strong>Total Paid:</strong> ₹{actualAmount}
                                    </p>
                                    {paymentDetails?.paymentId && (
                                        <p className="mb-2">
                                            <FaReceipt className="me-2 text-success" />
                                            <strong>Payment ID:</strong> {paymentDetails.paymentId}
                                        </p>
                                    )}
                                </Col>
                                <Col md={6}>
                                    {(contactData?.FirstName || contactData?.name) && (
                                        <p className="mb-2">
                                            <FaUser className="me-2 text-primary" />
                                            <strong>Guest Name:</strong> {`${contactData.Title || ''} ${contactData.FirstName || contactData.name || ''} ${contactData.LastName || ''}`.trim()}
                                        </p>
                                    )}
                                    {contactData?.Email && (
                                        <p className="mb-2">
                                            <FaUser className="me-2 text-primary" />
                                            <strong>Email:</strong> {contactData.Email}
                                        </p>
                                    )}
                                    {(actualHotelDetails?.checkIn || reviewData?.checkIn) && (
                                        <p className="mb-2">
                                            <FaCalendarAlt className="me-2 text-primary" />
                                            <strong>Check-in:</strong> {actualHotelDetails.checkIn || reviewData.checkIn}
                                        </p>
                                    )}
                                    {(actualHotelDetails?.checkOut || reviewData?.checkOut) && (
                                        <p className="mb-2">
                                            <FaCalendarAlt className="me-2 text-primary" />
                                            <strong>Check-out:</strong> {actualHotelDetails.checkOut || reviewData.checkOut}
                                        </p>
                                    )}
                                    {confirmationDetails?.bookingTime && (
                                        <p className="mb-2">
                                            <FaCalendarAlt className="me-2 text-success" />
                                            <strong>Booked On:</strong> {new Date(confirmationDetails.bookingTime).toLocaleString()}
                                        </p>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Invoice Download Section */}
            <Card className="shadow-sm">
                <Card.Header className="bg-danger text-white">
                    <h6 className="fw-bold mb-0">📄 Download Your Hotel Invoice</h6>
                </Card.Header>
                <Card.Body>
                    <div className="text-center">
                        <Button
                            variant="danger"
                            size="lg"
                            className="fw-bold px-5"
                            onClick={handleDownloadInvoice}
                            disabled={loading || !invoicePayload}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaDownload className="me-2" />
                                    Download Hotel Invoice
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
                                📄 Click above to download your hotel booking invoice as a PDF file.
                            </small>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Additional Information */}
            <Card className="mt-4 shadow-sm">
                <Card.Body>
                    <div className="text-center">
                        <h6 className="fw-bold text-primary mb-3">📧 Important Information</h6>
                        <p className="mb-2 text-muted">
                            • A confirmation email has been sent to your registered email address
                        </p>
                        <p className="mb-2 text-muted">
                            • Please carry a valid ID proof during check-in
                        </p>
                        <p className="mb-0 text-muted">
                            • For any queries, contact our customer support
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default HotelConfirmation;