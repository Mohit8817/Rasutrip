// src/components/Hotel/HotelConfirmation.js - SIMPLIFIED VERSION

import React, { useEffect } from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHotel, FaRupeeSign, FaCalendarAlt, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Extract data from navigation state
    const {
        booking = {},
        amount = 0,
        reviewData = {},
        hotelDetails = {},
        paymentDetails = {},
        confirmationDetails = {},
        bookingDetails = {},
        bookingResult = {},
        isBooked = false
    } = state || {};

    const actualBooking = booking || bookingResult || {};
    const actualAmount = amount || 0;
    const actualHotelDetails = hotelDetails || reviewData || {};

    const contactData = bookingDetails?.contactData ||
        actualBooking?.HotelRoomsDetails?.[0]?.HotelPassenger?.find(p => p.LeadPassenger === "true") ||
        actualBooking?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0] ||
        {};

    // Show success toast on mount
    useEffect(() => {
        if ((isBooked && actualBooking) || confirmationDetails?.message) {
            toast.success('🎉 Hotel booking confirmed successfully! Invoice sent to your email.', {
                position: "top-right",
                autoClose: 8000
            });
        }
    }, [isBooked, actualBooking, confirmationDetails]);

    // Redirect if no booking data
    if (!state || (!isBooked && !confirmationDetails?.bookingId) || (!actualBooking && !confirmationDetails)) {
        return (
            <Container className="py-4 mt-5">
                <Card className="shadow-sm border-danger">
                    <Card.Body className="text-center">
                        <h5 className="text-danger">No Booking Information Found</h5>
                        <p>Please start the booking process again.</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Back to Home
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Get booking ID for display
    const getBookingId = () => {
        return actualBooking?.BookingID || 
               actualBooking?.bookingId || 
               actualBooking?.userId || 
               confirmationDetails?.bookingId || 
               'N/A';
    };

    // Get booking date
    const getBookingDate = () => {
        const bookingTime = confirmationDetails?.bookingTime || new Date().toISOString();
        return new Date(bookingTime).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <Container className="py-4 innerpagecontainer mt-5 pt-5">
            {/* Success Header */}
            <Card className="shadow-lg border-success mb-4">
                <Card.Body className="text-center bg-success text-white">
                    <FaCheckCircle size={60} className="mb-3" />
                    <h2 className="fw-bold mb-2">Booking Confirmed!</h2>
                    <h5 className="mb-0">Your hotel reservation has been successfully completed</h5>
                </Card.Body>
            </Card>

            <Row>
                {/* Booking Details */}
                <Col lg={8}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0 fw-bold">
                                <FaHotel className="me-2" />
                                Booking Details
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Booking ID:</strong>
                                    <div className="text-primary fs-5 fw-bold">{getBookingId()}</div>
                                </Col>
                                <Col md={6}>
                                    <strong>Booking Date:</strong>
                                    <div>{getBookingDate()}</div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <strong>Hotel:</strong>
                                    <div className="fs-6 fw-bold text-dark">
                                        {actualHotelDetails?.name || actualBooking?.HotelName || 'Hotel Name'}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Total Amount Paid:</strong>
                                    <div className="text-success fs-4 fw-bold">
                                        <FaRupeeSign className="me-1" />
                                        {actualAmount.toFixed(2)}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <strong>Payment Status:</strong>
                                    <div className="text-success fw-bold">✅ Successfully Paid</div>
                                </Col>
                            </Row>

                            {paymentDetails && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <strong>Payment ID:</strong>
                                        <div className="small text-muted">{paymentDetails.paymentId}</div>
                                    </Col>
                                    <Col md={6}>
                                        <strong>Order ID:</strong>
                                        <div className="small text-muted">{paymentDetails.orderId}</div>
                                    </Col>
                                </Row>
                            )}

                            {confirmationDetails?.message && (
                                <Alert variant="success" className="mt-3">
                                    <strong>Status:</strong> {confirmationDetails.message}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Guest Information */}
                    {contactData && Object.keys(contactData).length > 0 && (
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="bg-info text-white">
                                <h5 className="mb-0 fw-bold">
                                    <FaUser className="me-2" />
                                    Lead Guest Information
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <strong>Name:</strong>
                                            <div>{`${contactData.Title || ''} ${contactData.FirstName || ''} ${contactData.LastName || ''}`.trim()}</div>
                                        </div>
                                        {contactData.Email && (
                                            <div className="mb-3">
                                                <strong><FaEnvelope className="me-1" /> Email:</strong>
                                                <div>{contactData.Email}</div>
                                            </div>
                                        )}
                                    </Col>
                                    <Col md={6}>
                                        {contactData.Phoneno && (
                                            <div className="mb-3">
                                                <strong><FaPhone className="me-1" /> Phone:</strong>
                                                <div>{contactData.Phoneno}</div>
                                            </div>
                                        )}
                                        {contactData.Age && (
                                            <div className="mb-3">
                                                <strong>Age:</strong>
                                                <div>{contactData.Age} years</div>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                                
                                {contactData.GSTNumber && (
                                    <Row className="mt-3">
                                        <Col md={12}>
                                            <div className="p-2 bg-light rounded">
                                                <strong>GST Information:</strong>
                                                <div><strong>GST Number:</strong> {contactData.GSTNumber}</div>
                                                {contactData.GSTCompanyName && (
                                                    <div><strong>Company:</strong> {contactData.GSTCompanyName}</div>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* Right Sidebar - Important Information */}
                <Col lg={4}>
                    <Card className="shadow-sm border-warning mb-4">
                        <Card.Header className="bg-warning text-dark">
                            <h6 className="mb-0 fw-bold">📧 Important Information</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <h6 className="text-success fw-bold">✅ Invoice Sent</h6>
                                <p className="small mb-2">
                                    Your booking invoice has been automatically sent to your registered email address.
                                </p>
                                <p className="small text-muted mb-0">
                                    Email: {contactData?.Email || 'Registered email'}
                                </p>
                            </div>

                            <hr />

                            <div className="mb-3">
                                <h6 className="fw-bold">📋 What's Next?</h6>
                                <ul className="small mb-0">
                                    <li>Check your email for booking confirmation</li>
                                    <li>Save your Booking ID: <strong>{getBookingId()}</strong></li>
                                    <li>Carry valid ID proof during check-in</li>
                                    <li>Contact hotel directly for special requests</li>
                                </ul>
                            </div>

                            <hr />

                            <div>
                                <h6 className="fw-bold">🆘 Need Help?</h6>
                                <p className="small mb-2">
                                    For booking modifications or queries, contact our support team with your Booking ID.
                                </p>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="w-100"
                                    onClick={() => window.location.href = 'tel:+911234567890'}
                                >
                                    Call Support
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Body className="text-center">
                            <h6 className="fw-bold mb-3">Continue Your Journey</h6>
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="primary" 
                                    onClick={() => navigate('/')}
                                >
                                    Book Another Hotel
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => navigate('/my-bookings')}
                                >
                                    View All Bookings
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HotelConfirmation;