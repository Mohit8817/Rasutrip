// src/components/Bus/BusPaymentInfo.js

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createBusPaymentOrder, validateBusPayment } from '../../APIS/BusApi/BusApis';

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
        busBookingData = {},
        searchTokenId = '',
        selectedBoardingPoint = {},
        selectedDroppingPoint = {},
        boardingPoint = {},
        droppingPoint = {},
        couponDiscount = 0
    } = state || {};

    const convenienceFee = 0;
    const gstAmount = totalPrice * 0.18;
    const finalAmount = (totalPrice + gstAmount + convenienceFee).toFixed(2);

    // ✅ Load Razorpay script dynamically
    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    // ✅ Enhanced API error handler
    const handleApiError = (error, context = 'API') => {
        let errorMessage = `${context} failed. Please try again.`;
        let errorDetails = null;

        if (error?.response) {
            const status = error.response.status;
            const data = error.response.data;

            errorDetails = {
                status,
                data,
                headers: error.response.headers
            };

            switch (status) {
                case 400:
                    errorMessage = data?.Error?.ErrorMessage || data?.message || 'Invalid request data. Please check your booking details.';
                    break;
                case 401:
                    errorMessage = 'Authentication failed. Please refresh the page and try again.';
                    break;
                case 403:
                    errorMessage = 'Access denied. Please contact support.';
                    break;
                case 404:
                    errorMessage = 'Bus booking service not found. Please try again later.';
                    break;
                case 409:
                    errorMessage = 'Booking conflict. The seats may no longer be available.';
                    break;
                case 422:
                    errorMessage = data?.Error?.ErrorMessage || 'Invalid booking data. Please check all required fields.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                    break;
                case 500:
                    errorMessage = 'Bus booking service is temporarily unavailable. Please try again in a few minutes.';
                    if (data?.Error?.ErrorMessage) {
                        errorMessage += ` (${data.Error.ErrorMessage})`;
                    }
                    break;
                case 502:
                case 503:
                case 504:
                    errorMessage = 'Bus booking service is temporarily down. Please try again later.';
                    break;
                default:
                    errorMessage = data?.Error?.ErrorMessage || data?.message || `${context} failed with status ${status}`;
            }
        } else if (error?.request) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
            errorDetails = { request: 'No response received' };
        } else {
            errorMessage = error?.message || `${context} failed due to an unexpected error.`;
            errorDetails = { message: error?.message };
        }

        return { message: errorMessage, details: errorDetails };
    };

    // ✅ Show error toast function
    const showErrorToast = (message, additionalInfo = '') => {
        const toastMessage = additionalInfo ? `${message}\n${additionalInfo}` : message;

        toast.error(toastMessage, {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
                whiteSpace: 'pre-line',
                wordBreak: 'break-word'
            }
        });
    };

    // ✅ Show success toast function
    const showSuccessToast = (message) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    // ✅ Debug helper function to analyze API response structure
    const debugApiResponse = (response, apiName) => {
        console.log(`🔍 ${apiName} Response Analysis:`);
        console.log('Type:', typeof response);
        console.log('Keys:', response ? Object.keys(response) : 'null/undefined');
        console.log('Full Response:', response);
        
        if (response?.data) {
            console.log('Data Keys:', Object.keys(response.data));
            console.log('Data Content:', response.data);
        }
        
        if (response?.order) {
            console.log('Order Keys:', Object.keys(response.order));
            console.log('Order Content:', response.order);
        }
    };

    const formatBusOrderData = (bookingState, amount) => ({
        amount: parseFloat(amount),
        currency: 'INR',
        booking_type: 'bus',
        booking_details: {
            route: `${bookingState.fromCity} to ${bookingState.toCity}`,
            travel_date: bookingState.departDate,
            bus_operator: bookingState.bus?.operator,
            bus_type: bookingState.bus?.busType,
            selected_seats: bookingState.selectedSeats?.map(seat =>
                seat.SeatName || seat.seatNumber || seat.id
            ),
            passenger_count: bookingState.passengerData?.length || 0,
            base_fare: bookingState.totalPrice,
            taxes: gstAmount,
            total_amount: amount
        },
        customer_details: {
            name: `${bookingState.passengerData?.[0]?.firstName || ''} ${bookingState.passengerData?.[0]?.lastName || ''}`.trim(),
            email: bookingState.contactData?.email,
            phone: bookingState.contactData?.mobile
        }
    });

    const formatValidatePaymentData = (bookingState, paymentResponse, orderData) => {
        const passengers = bookingState.passengerData?.map((passenger, index) => ({
            LeadPassenger: index === 0,
            Title: passenger.title || (passenger.gender === 'Male' ? 'Mr' : 'Ms'),
            FirstName: passenger.firstName,
            LastName: passenger.lastName,
            Email: bookingState.contactData?.email || passenger.email || '',
            Phoneno: bookingState.contactData?.mobile || passenger.phone || '',
            Gender: passenger.gender === 'Male' ? '1' : '2',
            IdType: passenger.idType || null,
            IdNumber: passenger.idNumber || null,
            Address: passenger.address || bookingState.contactData?.address || '',
            Age: passenger.age?.toString(),
            SeatName: bookingState.selectedSeats?.[index]?.SeatName ||
                bookingState.selectedSeats?.[index]?.seatNumber ||
                bookingState.selectedSeats?.[index]?.id ||
                bookingState.selectedSeats?.[index]
        })) || [];

        return {
            amount: parseFloat(finalAmount),
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            bookingType: "BUS",
            Bus: {
                ResultIndex: bookingState.busBookingData?.ResultIndex || bookingState.bus?.ResultIndex || "TB-1",
                BoardingPointId: bookingState.selectedBoardingPoint?.BoardingPointId ||
                    bookingState.boardingPoint?.id || 1,
                DroppingPointId: bookingState.selectedDroppingPoint?.DroppingPointId ||
                    bookingState.droppingPoint?.id || 1,
                SearchTokenId: bookingState.searchTokenId || bookingState.bus?.SearchTokenId || "",
                CouponDiscount: bookingState.couponDiscount || 0,
                Passenger: passengers
            }
        };
    };

    // ✅ Enhanced Razorpay options with better error handling
    const getRazorpayOptions = (orderId, orderAmount) => ({
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_glwdvx2PlFDStN',
        amount: orderAmount * 100,
        currency: 'INR',
        order_id: orderId,
        name: 'TTS Travels',
        description: `${fromCity} to ${toCity} - ${bus?.operator || 'Bus Service'}`,
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
            bus_operator: bus?.operator || 'N/A'
        },
        theme: { 
            color: '#dc3545' 
        },
        modal: {
            ondismiss: function () {
                setLoading(false);
                showErrorToast('⚠️ Payment Cancelled', 'Payment was cancelled by user');
            }
        },
    });

    // ✅ Enhanced payment handler with better error handling and validation
    const handlePayment = async () => {
        setError(null);
        setLoading(true);

        try {
            console.log('🚀 Starting bus payment process...');

            // ✅ Load Razorpay script
            const razorpayLoaded = await loadRazorpayScript();
            if (!razorpayLoaded) {
                const errorMsg = 'Payment system failed to load. Please refresh and try again.';
                setError(errorMsg);
                showErrorToast('Payment System Error', errorMsg);
                setLoading(false);
                return;
            }

            // ✅ Create payment order
            const orderData = formatBusOrderData(state, finalAmount);
            console.log('📦 Creating payment order with data:', orderData);

            const orderResponse = await createBusPaymentOrder(orderData);
            debugApiResponse(orderResponse, 'createBusPaymentOrder');

            // ✅ Enhanced order ID extraction - check multiple possible response structures
            let orderId, orderAmount, orderObject;

            // Check various possible response structures
            if (orderResponse?.data?.order?.id) {
                // Structure: { data: { order: { id, amount } } }
                orderObject = orderResponse.data.order;
                orderId = orderObject.id;
                orderAmount = orderObject.amount;
            } else if (orderResponse?.order?.id) {
                // Structure: { order: { id, amount } }
                orderObject = orderResponse.order; 
                orderId = orderObject.id;
                orderAmount = orderObject.amount;
            } else if (orderResponse?.data?.id) {
                // Structure: { data: { id, amount } }
                orderObject = orderResponse.data;
                orderId = orderObject.id;
                orderAmount = orderObject.amount;
            } else if (orderResponse?.id) {
                // Structure: { id, amount }
                orderObject = orderResponse;
                orderId = orderResponse.id;
                orderAmount = orderResponse.amount;
            } else {
                // Log the actual response structure for debugging
                console.error('❌ Unexpected order response structure:', {
                    responseKeys: Object.keys(orderResponse || {}),
                    fullResponse: orderResponse
                });
                throw new Error(`Failed to create payment order - Invalid response structure. Expected order ID but received: ${JSON.stringify(orderResponse)}`);
            }

            // Validate that we have the required data
            if (!orderId) {
                console.error('❌ No order ID found in response:', orderResponse);
                throw new Error('Failed to create payment order - No order ID received');
            }

            // Use finalAmount if orderAmount is not available from response
            if (!orderAmount) {
                console.warn('⚠️ No amount in order response, using calculated amount:', finalAmount);
                orderAmount = parseFloat(finalAmount);
            }

            console.log('✅ Payment order created:', { orderId, orderAmount });

            // ✅ Enhanced success handler
            const handleSuccess = async (response) => {
                try {
                    console.log('✅ Payment successful, validating...', response);
                    
                    const validateData = formatValidatePaymentData(state, response, orderObject);
                    console.log('📦 Validating payment with data:', validateData);

                    const validationResult = await validateBusPayment(validateData);
                    console.log('✅ Payment validation result:', validationResult);

                    // ✅ Check if validation was successful
                    const isValidationSuccessful = 
                        validationResult?.message === 'Payment verified successfully' ||
                        validationResult?.payment?.status === 'success' ||
                        validationResult?.status === 'success' ||
                        validationResult?.success === true;

                    if (isValidationSuccessful) {
                        showSuccessToast('🎉 Bus booking confirmed successfully!');

                        navigate('/booking-success', {
                            state: {
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                bookingDetails: state,
                                finalAmount,
                                orderData: orderObject,
                                validationResult,
                                isValidated: true,
                                bookingType: 'bus'
                            },
                        });
                    } else {
                        // ✅ Handle validation failure
                        const validationError = validationResult?.message || 
                                              validationResult?.error?.message || 
                                              'Payment validation failed';
                        
                        setError(`Payment completed but validation failed: ${validationError}`);
                        showErrorToast('❌ Payment Validation Failed', validationError);
                    }

                } catch (err) {
                    console.error('❌ Payment validation error:', err);
                    const { message: errorMessage } = handleApiError(err, 'Payment Validation');
                    setError(`Payment completed but validation failed: ${errorMessage}`);
                    showErrorToast('❌ Payment Validation Error', errorMessage);
                } finally {
                    setLoading(false);
                }
            };

            // ✅ Create Razorpay instance with enhanced error handling
            const options = getRazorpayOptions(orderId, orderAmount);
            options.handler = handleSuccess;

            const rzp = new window.Razorpay(options);

            // ✅ Enhanced payment failure handler
            rzp.on('payment.failed', function (response) {
                console.error('❌ Payment failed:', response);
                const failureMessage = response?.error?.description || 'Payment failed due to unknown error';
                setError(`Payment failed: ${failureMessage}`);
                showErrorToast('❌ Payment Failed', failureMessage);
                setLoading(false);
            });

            // ✅ Open Razorpay modal
            rzp.open();

        } catch (err) {
            console.error('❌ Payment initialization error:', err);
            const { message: errorMessage } = handleApiError(err, 'Payment Initialization');
            setError(errorMessage);
            showErrorToast('❌ Payment Initialization Failed', errorMessage);
            setLoading(false);
        }
    };

    // ✅ Enhanced error boundary check
    if (!state || Object.keys(state).length === 0) {
        return (
            <Container className="py-4">
                <Card className="shadow-sm border-danger">
                    <Card.Body className="text-center">
                        <FaExclamationTriangle className="text-danger mb-3" size={48} />
                        <h5 className="text-danger">Missing Payment Data</h5>
                        <p>Required booking information is missing. Please start the booking process again.</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Back to Home
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* ✅ Enhanced Error Alert */}
            {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                    <FaExclamationTriangle className="me-2" />
                    <strong>Error:</strong>
                    <div style={{ whiteSpace: 'pre-line', marginTop: '8px' }}>
                        {error}
                    </div>
                </Alert>
            )}

            {/* ✅ Enhanced Travel Summary */}
            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-danger text-white">
                    <div className="d-flex align-items-center">
                        <FaShieldAlt className="me-2" />
                        <h5 className="fw-bold mb-0">🚌 Bus Booking Summary</h5>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="mb-4 p-3 bg-light rounded">
                        <Row>
                            <Col md={3}>
                                <div><strong>Route:</strong></div>
                                <div className="text-primary fw-bold">{fromCity} → {toCity}</div>
                                <small className="text-muted">{bus?.operator || 'N/A'} - {bus?.busType || 'N/A'}</small>
                            </Col>
                            <Col md={3}>
                                <div><strong>Travel Date:</strong></div>
                                <div>{departDate ? new Date(departDate).toDateString() : 'N/A'}</div>
                            </Col>
                            <Col md={3}>
                                <div><strong>Passengers:</strong></div>
                                <div>{passengerData.length} Passenger(s)</div>
                            </Col>
                            <Col md={3}>
                                <div><strong>Seats:</strong></div>
                                <div className="fw-bold text-success">
                                    {selectedSeats.map(seat => 
                                        seat.SeatName || seat.seatNumber || seat.id
                                    ).join(', ')}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card.Body>
            </Card>

            {/* Passenger Details */}
            {passengerData.length > 0 && (
                <Card className="mb-3 shadow-sm">
                    <Card.Header className="bg-white">
                        <h6 className="fw-bold mb-0">👥 Passenger Details</h6>
                    </Card.Header>
                    <Card.Body>
                        {passengerData.map((passenger, index) => (
                            <Row key={index} className="mb-2 p-2 border rounded">
                                <Col md={4}>
                                    <strong>Name:</strong> {passenger.firstName} {passenger.lastName}
                                </Col>
                                <Col md={2}>
                                    <strong>Age:</strong> {passenger.age}
                                </Col>
                                <Col md={3}>
                                    <strong>Seat:</strong> {
                                        selectedSeats[index]?.SeatName ||
                                        selectedSeats[index]?.seatNumber ||
                                        selectedSeats[index]?.id ||
                                        'N/A'
                                    }
                                </Col>
                                <Col md={3}>
                                    <strong>Gender:</strong> {passenger.gender}
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
                        <h6 className="fw-bold mb-0">📞 Contact Information</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}><strong>📞 Contact:</strong> {contactData.mobile || 'N/A'}</Col>
                            <Col md={6}><strong>✉️ Email:</strong> {contactData.email || 'N/A'}</Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* ✅ Enhanced Payment Summary */}
            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">💰 Payment Summary</h6>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-2">
                        <Col xs={8}>Base Fare ({selectedSeats.length} seats)</Col>
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
                    {couponDiscount > 0 && (
                        <Row className="mb-2">
                            <Col xs={8}>Discount</Col>
                            <Col xs={4} className="text-end text-success">-₹{couponDiscount.toFixed(2)}</Col>
                        </Row>
                    )}
                    <hr />
                    <Row className="fw-bold fs-5">
                        <Col xs={8}>Total Amount</Col>
                        <Col xs={4} className="text-end text-danger">₹{finalAmount}</Col>
                    </Row>
                </Card.Body>

                {/* ✅ Payment Security Info */}
                <Card.Body className="pt-0">
                    <div className="alert alert-info mb-0">
                        <div className="d-flex align-items-center mb-2">
                            <FaShieldAlt className="me-2" />
                            <strong>Secure Payment</strong>
                        </div>
                        <small>
                            Your payment is secured by Razorpay with 256-bit SSL encryption.
                            We accept all major credit cards, debit cards, UPI, and net banking.
                        </small>
                    </div>
                </Card.Body>
            </Card>

            {/* ✅ Enhanced Payment Button Section */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="text-center mb-3">
                        <p className="text-muted small mb-0">
                            <strong>Please note:</strong> By placing this order, you agree to our{' '}
                            <a href="#" onClick={(e) => e.preventDefault()}>Terms Of Use</a> and{' '}
                            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                        </p>
                    </div>

                    <div className="d-flex gap-3 justify-content-between align-items-center">
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            ← Go Back
                        </Button>

                        <Button
                            variant="danger"
                            size="lg"
                            className="px-5 fw-bold"
                            disabled={!totalPrice || loading || !!error}
                            onClick={handlePayment}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Processing Payment...
                                </>
                            ) : (
                                `💳 Pay Now ₹${finalAmount}`
                            )}
                        </Button>
                    </div>

                    <div className="text-center mt-3">
                        <small className="text-muted">
                            Powered by Razorpay - India's most trusted payment gateway
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default BusPaymentInfo;