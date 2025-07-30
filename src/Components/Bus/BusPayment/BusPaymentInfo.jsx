// src/components/Bus/BusPaymentInfo.js

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBusPaymentOrder, formatBusOrderData } from '../../APIS/BusApi/BusApis';

const BusPaymentInfo = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!state || !state.totalPrice || !state.selectedSeats || !state.passengerData) {
            setError('Missing required booking information. Please start over.');
        }
    }, [state]);

    const {
        bus = {},
        selectedSeats = [],
        totalPrice = 0,
        fromCity = '',
        toCity = '',
        departDate = '',
        passengerData = [],
        contactData = {},
    } = state || {};

    const convenienceFee = 0;
    const gstAmount = totalPrice * 0.18;
    const finalAmount = (totalPrice + gstAmount + convenienceFee).toFixed(2);

    const handlePayment = async () => {
        setError(null);
        setLoading(true);

        try {
            if (!totalPrice || !selectedSeats.length || !passengerData.length) {
                throw new Error('Missing required booking information');
            }

            const orderData = formatBusOrderData(state, finalAmount);
            const order = await createBusPaymentOrder(orderData);

            if (!order || !order.id || !order.amount) {
                throw new Error('Invalid order response from server');
            }

            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded');
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_glwdvx2PlFDStN',
                amount: order.amount,
                currency: 'INR',
                order_id: order.id,
                name: 'Bus Booking',
                description: `${fromCity} to ${toCity} - ${bus?.operator || 'Bus Service'}`,
                handler: (response) => {
                    navigate('/booking-success', {
                        state: {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            bookingDetails: state,
                            finalAmount: finalAmount,
                        },
                    });
                },
                prefill: {
                    name: `${passengerData[0]?.firstName || ''} ${passengerData[0]?.lastName || ''}`.trim(),
                    email: contactData?.email || '',
                    contact: contactData?.mobile || '',
                },
                notes: {
                    route: `${fromCity} to ${toCity}`,
                    travel_date: departDate,
                    seats: selectedSeats.map(seat => seat.SeatName || seat.seatNumber || seat.id).join(', '),
                    passenger_count: passengerData.length,
                },
                theme: { color: '#dc3545' },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', (response) => {
                console.error("❌ Payment Failed:", response.error);
                setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
                setLoading(false);
            });

            rzp1.open();

        } catch (err) {
            console.error("💥 Payment initiation failed:", err);
            setError(err?.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (error && !state) {
        return (
            <Container className="py-4">
                <Card className="text-center">
                    <Card.Body>
                        <h5 className="text-danger">⚠️ Error</h5>
                        <p>{error}</p>
                        <Button variant="primary" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Travel Summary */}
            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                    <h5 className="fw-bold mb-0">Travel Summary</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <strong>{fromCity} → {toCity}</strong>
                            <br />
                            <span className="text-muted">{bus?.operator || 'N/A'} - {bus?.busType || 'N/A'}</span>
                        </Col>
                        <Col md={3}>
                            <strong>Origin</strong><br />
                            <span className="text-muted">{fromCity}</span>
                        </Col>
                        <Col md={3}>
                            <strong>Destination</strong><br />
                            <span className="text-muted">{toCity}</span>
                        </Col>
                        <Col md={3}>
                            <strong>Travel Date</strong><br />
                            <span className="text-muted">{departDate ? new Date(departDate).toDateString() : 'N/A'}</span>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Passenger Details */}
            {passengerData.length > 0 && (
                <Card className="mb-3 shadow-sm">
                    <Card.Header className="bg-white">
                        <h6 className="fw-bold mb-0">Passenger Details</h6>
                    </Card.Header>
                    <Card.Body>
                        {passengerData.map((passenger, index) => (
                            <Row key={index} className="mb-2">
                                <Col md={6}>
                                    <strong>Traveller:</strong> {passenger.firstName} {passenger.lastName}
                                </Col>
                                <Col md={6}>
                                    <strong>Age:</strong> {passenger.age} &nbsp;
                                    <strong>Seat No:</strong> {
                                        selectedSeats[index]?.SeatName ||
                                        selectedSeats[index]?.seatNumber ||
                                        selectedSeats[index]?.id ||
                                        'N/A'
                                    }
                                </Col>
                            </Row>
                        ))}
                    </Card.Body>
                </Card>
            )}

            {/* Contact Info */}
            {contactData && Object.keys(contactData).length > 0 && (
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-white">
                        <h6 className="fw-bold mb-0">Contact Information</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}><strong>📞 Contact:</strong> {contactData.mobile || 'N/A'}</Col>
                            <Col md={6}><strong>✉️ Email:</strong> {contactData.email || 'N/A'}</Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Payment Summary */}
            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">Payment Summary</h6>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-2">
                        <Col xs={8}>Base Fare</Col>
                        <Col xs={4} className="text-end">₹{totalPrice.toFixed(2)}</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={8}>Taxes & GST (18%)</Col>
                        <Col xs={4} className="text-end">₹{gstAmount.toFixed(2)}</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={8}>Convenience Fee</Col>
                        <Col xs={4} className="text-end">₹{convenienceFee.toFixed(2)}</Col>
                    </Row>
                    <hr />
                    <Row className="fw-bold">
                        <Col xs={8}>Total Amount</Col>
                        <Col xs={4} className="text-end text-success">₹{finalAmount}</Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Pay Button */}
            <div className="mt-4">
                <p className="text-muted small">
                    <strong>Please note:</strong> By placing this order, you agree to our{' '}
                    <a href="#" onClick={(e) => e.preventDefault()}>Terms Of Use</a> and{' '}
                    <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </p>

                <div className="d-grid">
                    <Button
                        variant="danger"
                        size="lg"
                        className="btn-red"
                        disabled={!totalPrice || loading || !!error}
                        onClick={handlePayment}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Processing Payment...
                            </>
                        ) : (
                            `Pay Now ₹${finalAmount}`
                        )}
                    </Button>
                </div>
            </div>
        </Container>
    );
};

export default BusPaymentInfo;
