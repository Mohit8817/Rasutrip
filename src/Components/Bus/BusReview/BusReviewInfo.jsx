import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Alert, Badge } from 'react-bootstrap';
import { FaCity, FaClock, FaEdit, FaWheelchair, FaUser, FaEnvelope, FaPhone, FaReceipt, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const BusReviewInfo = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Enhanced data extraction with comprehensive fallbacks
    const {
        // Passenger and seat data
        passengerData = [],
        selectedSeats = [],
        seatMapping = [],

        // Contact information
        contactData = {},

        // GST information
        gstData = null,
        showGstinForm = false,

        // Journey details
        bus = {},
        totalPrice = 0,
        departTime = '',
        arriveTime = '',
        boarding = {},
        fromCity = '',
        toCity = '',
        departDate = '',

        // Booking status
        blockSeatResponse = null,
        seatsBlocked = false,
        isBlockingSeats = false,

        // Additional info
        passengerCount = 0,
        seatCount = 0,
        hasGstDetails = false,

        // Debug info
        debugInfo = null
    } = state || {};

    // Enhanced debugging and validation
    useEffect(() => {
        console.log("🔍 BusReviewInfo - Complete state data:", state);
        console.log("📋 Enhanced Data Analysis:", {
            passengerData: {
                count: passengerData?.length || 0,
                data: passengerData,
                hasData: Array.isArray(passengerData) && passengerData.length > 0
            },
            selectedSeats: {
                count: selectedSeats?.length || 0,
                data: selectedSeats,
                hasData: Array.isArray(selectedSeats) && selectedSeats.length > 0
            },
            contactData: {
                hasEmail: !!contactData?.email,
                hasMobile: !!contactData?.mobile,
                data: contactData
            },
            gstData: {
                hasGstData: !!gstData,
                showForm: showGstinForm,
                data: gstData
            },
            journey: {
                totalPrice,
                fromCity,
                toCity,
                departDate,
                departTime
            },
            seatMapping: seatMapping
        });

        setDataLoaded(true);
    }, [state, passengerData, contactData, gstData, selectedSeats, seatMapping]);

    // Enhanced helper functions
    const getSeatName = (seat, index) => {
        if (!seat) return `Seat ${index + 1}`;

        return seat.displayName ||
            seat.SeatName ||
            seat.SeatNo ||
            seat.seatName ||
            seat.seatNo ||
            seat.Name ||
            seat.name ||
            `Seat ${index + 1}`;
    };

    const getPassengerFullName = (passenger) => {
        if (!passenger) return 'Not provided';

        const title = passenger.title || '';
        const firstName = passenger.firstName || '';
        const lastName = passenger.lastName || '';
        const fullName = `${title} ${firstName} ${lastName}`.trim();

        return fullName || 'Not provided';
    };

    const getPassengerDetails = (passenger, index) => {
        if (!passenger) {
            return {
                name: 'Not provided',
                age: 'N/A',
                gender: 'N/A',
                idType: 'N/A',
                idNumber: 'N/A',
                seatName: getSeatName(selectedSeats[index], index)
            };
        }

        return {
            name: getPassengerFullName(passenger),
            age: passenger.age || 'N/A',
            gender: passenger.gender || 'N/A',
            idType: passenger.idType || 'N/A',
            idNumber: passenger.idNumber || 'N/A',
            seatName: getSeatName(selectedSeats[index], index),
            isLead: passenger.isLeadPassenger || (index === 0)
        };
    };

    // Enhanced seat display
    const getSeatDisplayText = () => {
        if (!selectedSeats || selectedSeats.length === 0) return 'No seats selected';

        return selectedSeats.map((seat, index) => getSeatName(seat, index)).join(", ");
    };

    const handlePayment = () => {
        if (!termsAccepted) {
            alert('Please accept the terms and conditions to continue.');
            return;
        }

        // Comprehensive data structure for payment page
        const paymentData = {
            // Original state data
            ...state,
            termsAccepted,

            // Enhanced passenger data with seat mapping
            passengerData: passengerData?.map((passenger, index) => ({
                ...passenger,
                fullName: getPassengerFullName(passenger),
                seatDetails: selectedSeats[index] ? {
                    ...selectedSeats[index],
                    displayName: getSeatName(selectedSeats[index], index)
                } : null,
                isLeadPassenger: passenger.isLeadPassenger || (index === 0)
            })),

            // Enhanced contact data
            contactData: {
                ...contactData,
                fullPhone: `${contactData?.countryCode || '+91'} ${contactData?.mobile || ''}`
            },

            // Enhanced seat data
            selectedSeats: selectedSeats?.map((seat, index) => ({
                ...seat,
                displayName: getSeatName(seat, index),
                passengerName: getPassengerFullName(passengerData[index]),
                passengerIndex: index
            })),

            // Journey summary
            journeyDetails: {
                from: fromCity,
                to: toCity,
                date: departDate,
                departTime,
                arriveTime,
                duration: bus?.duration,
                operator: bus?.operator || bus?.name,
                busType: bus?.busType,
                boarding: {
                    point: boarding?.CityPointName || boarding?.name,
                    time: boarding?.DepTime || boarding?.time,
                    address: boarding?.address
                }
            },

            // Pricing details
            pricing: {
                basePrice: totalPrice,
                seatCount: selectedSeats?.length || 0,
                passengerCount: passengerData?.length || 0,
                pricePerSeat: selectedSeats?.length ? (totalPrice / selectedSeats.length) : 0
            },

            // GST details (if available)
            gstDetails: gstData && showGstinForm ? {
                ...gstData,
                isRequired: true
            } : {
                isRequired: false
            },

            // Booking metadata
            bookingMeta: {
                bookingSource: 'web',
                platform: 'bus_booking',
                createdAt: new Date().toISOString(),
                sessionId: Date.now(),
                seatsBlocked,
                blockSeatResponse
            },

            // Validation flags
            validation: {
                hasPassengers: passengerData && passengerData.length > 0,
                hasSeats: selectedSeats && selectedSeats.length > 0,
                hasContact: contactData && (contactData.email || contactData.mobile),
                hasPrice: totalPrice > 0,
                termsAccepted: termsAccepted
            }
        };

        // Debug logging
        console.log("💳 Complete Payment Data Structure:", paymentData);
        console.log("📊 Data Validation:", paymentData.validation);

        // Navigate to payment with comprehensive data
        navigate("/bus-payment", {
            state: paymentData,
            replace: false // Keep in navigation history
        });
    };

    const handleEdit = () => {
        // Navigate back with current state preserved
        navigate("/bus-traveller-details", { state });
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    // Enhanced validation and error handling
    if (!state) {
        return (
            <div className="container py-5 text-center">
                <Alert variant="warning">
                    <h5>No booking data found</h5>
                    <p>Please complete previous steps.</p>
                    <Button variant="primary" onClick={() => navigate("/")}>Go Home</Button>
                </Alert>
            </div>
        );
    }

    if (!dataLoaded) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading booking details...</p>
            </div>
        );
    }

    if (!passengerData || passengerData.length === 0) {
        return (
            <div className="container py-5 text-center">
                <Alert variant="warning">
                    <h5>Passenger data missing</h5>
                    <p>No passenger information found. Please go back and fill in passenger details.</p>
                    <Button variant="primary" onClick={handleEdit}>Fill Passenger Details</Button>
                </Alert>
            </div>
        );
    }

    if (!selectedSeats || selectedSeats.length === 0) {
        return (
            <div className="container py-5 text-center">
                <Alert variant="warning">
                    <h5>Seat data missing</h5>
                    <p>No seat information found. Please go back and select seats.</p>
                    <Button variant="primary" onClick={() => navigate(-2)}>Select Seats</Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container my-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Review Your Booking</h4>
                    <p className="text-muted mb-0">
                        Please review all details before proceeding to payment
                        {debugInfo && (
                            <small className="d-block text-success">
                                ✓ Data passed from {debugInfo.from} at {new Date(debugInfo.passedAt).toLocaleTimeString()}
                            </small>
                        )}
                    </p>
                </div>
                <Button variant="outline-secondary" onClick={handleGoBack}>
                    <FaArrowLeft className="me-2" />
                    Back
                </Button>
            </div>

            {/* Data Summary Alert */}
            <Alert variant="info" className="mb-4">
                <FaCheckCircle className="me-2" />
                <strong>Booking Summary:</strong> {passengerData.length} passenger(s) • {selectedSeats.length} seat(s) •
                ₹{totalPrice?.toLocaleString()} • {hasGstDetails ? 'GST Invoice Required' : 'No GST Invoice'}
            </Alert>

            {/* Route Info */}
            <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "10px" }}>
                <Card.Header className="bg-danger text-white">
                    <h5 className="mb-0">Journey Details</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col md={4}>
                            <div className="d-flex align-items-center mb-2">
                                <FaCity className="me-2 text-primary" />
                                <strong className="fs-5">{fromCity || 'N/A'}</strong>
                            </div>
                            <h4 className="fw-bold text-success">{departTime || 'N/A'}</h4>
                            <div className="text-muted">
                                {departDate ? new Date(departDate).toDateString() : 'Date not available'}
                            </div>
                            <hr />
                            <div>
                                <div className="text-muted small">Bus Operator</div>
                                <strong>{bus?.operator || bus?.name || 'N/A'}</strong>
                            </div>
                        </Col>

                        <Col md={4} className="text-center">
                            <div className="d-flex flex-column align-items-center">
                                <FaClock className="mb-2 text-primary" size={20} />
                                <div className="fw-bold">{bus?.duration || '--h --m'}</div>
                                <div className="text-muted small">Duration</div>
                            </div>
                            <hr />
                            <div>
                                <div className="text-muted small">Selected Seats ({selectedSeats.length})</div>
                                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap mt-2">
                                    <FaWheelchair className="text-danger" />
                                    <span className="fw-semibold">
                                        {getSeatDisplayText()}
                                    </span>
                                </div>
                            </div>
                        </Col>

                        <Col md={4} className="text-end">
                            <div className="d-flex justify-content-end align-items-center mb-2">
                                <strong className="fs-5">{toCity || 'N/A'}</strong>
                                <FaCity className="ms-2 text-primary" />
                            </div>
                            <h4 className="fw-bold text-success">{arriveTime || 'N/A'}</h4>
                            <div className="text-muted">
                                {departDate ? new Date(departDate).toDateString() : 'Date not available'}
                            </div>
                            <hr />
                            <div>
                                <div className="text-muted small">Boarding Point</div>
                                <strong>{boarding?.CityPointName || boarding?.name || 'N/A'}</strong>
                                <div className="text-muted small">
                                    Time: {boarding?.DepTime || boarding?.time || 'N/A'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Contact Information */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaPhone className="me-2" />
                        Contact Information
                    </h5>
                    <FaEdit
                        style={{ cursor: "pointer" }}
                        onClick={handleEdit}
                        className='text-danger'
                        title="Edit Details"
                    />
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-1">
                                    <FaEnvelope className="me-2 text-muted" />
                                    <strong>Email Address</strong>
                                </div>
                                <div className="ps-4">{contactData?.email || 'Not provided'}</div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-1">
                                    <FaPhone className="me-2 text-muted" />
                                    <strong>Mobile Number</strong>
                                </div>
                                <div className="ps-4">
                                    {(contactData?.countryCode || '+91')} {contactData?.mobile || 'Not provided'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Enhanced Passenger Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaUser className="me-2" />
                        Passenger Details ({passengerData?.length || 0})
                    </h5>
                    <FaEdit
                        style={{ cursor: "pointer" }}
                        onClick={handleEdit}
                        className='text-danger'
                        title="Edit Details"
                    />
                </Card.Header>
                <Card.Body>
                    {passengerData?.map((passenger, index) => {
                        const details = getPassengerDetails(passenger, index);
                        return (
                            <Card key={index} className="border mb-3">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <Badge bg={details.isLead ? "primary" : "secondary"} className="me-2">
                                                {details.isLead ? "Lead Passenger" : `Passenger ${index + 1}`}
                                            </Badge>
                                            <span className="fw-semibold">Seat {details.seatName}</span>
                                        </div>
                                        {details.isLead && (
                                            <small className="text-muted">* Primary contact person</small>
                                        )}
                                    </div>
                                    <Row>
                                        <Col md={8}>
                                            <div className="mb-2">
                                                <strong>Name:</strong> {details.name}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Age:</strong> {details.age} years | <strong>Gender:</strong> {details.gender}
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="mb-2">
                                                <strong>ID Type:</strong> {details.idType}
                                            </div>
                                            <div className="mb-2">
                                                <strong>ID Number:</strong> {details.idNumber}
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </Card.Body>
            </Card>

            {/* GST Details (if provided) */}
            {gstData && showGstinForm && (
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <FaReceipt className="me-2" />
                            GST Invoice Details
                        </h5>
                        <FaEdit
                            style={{ cursor: "pointer" }}
                            onClick={handleEdit}
                            className='text-danger'
                            title="Edit Details"
                        />
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <div className="mb-2">
                                    <strong>GST Number:</strong> {gstData.gstNumber || 'Not provided'}
                                </div>
                                <div className="mb-2">
                                    <strong>Company Name:</strong> {gstData.companyName || 'Not provided'}
                                </div>
                                <div className="mb-2">
                                    <strong>Contact:</strong> {gstData.contactNo || 'Not provided'}
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-2">
                                    <strong>Email:</strong> {gstData.email || 'Not provided'}
                                </div>
                                <div className="mb-2">
                                    <strong>Address:</strong> {gstData.address || 'Not provided'}
                                </div>
                                <div className="mb-2">
                                    <strong>City, State:</strong> {gstData.city || 'N/A'}, {gstData.state || 'N/A'}
                                </div>
                                <div className="mb-2">
                                    <strong>Pincode:</strong> {gstData.pincode || 'Not provided'}
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Fare Summary */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">Fare Summary</h5>
                </Card.Header>
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <div>
                                <div className="mb-2">
                                    <strong>Base Fare:</strong> {selectedSeats?.length || 0} × Seats
                                </div>
                                <div className="mb-2">
                                    <strong>Seats:</strong> {getSeatDisplayText()}
                                </div>
                                {gstData && showGstinForm && (
                                    <div className="text-muted small">
                                        * GST invoice will be generated for {gstData.companyName}
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col md={4} className="text-end">
                            <div className="fs-2 fw-bold text-success">
                                ₹ {totalPrice?.toLocaleString() || '0'}
                            </div>
                            <div className="text-muted">Total Amount</div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Terms and Conditions */}
            <Card className="mb-4 border-warning bg-warning bg-opacity-10">
                <Card.Body>
                    <Form.Check
                        type="checkbox"
                        id="terms"
                        className="mb-3"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        label={
                            <>
                                I have read and accept the{' '}
                                <a href="/terms" target="_blank" className="text-decoration-none">
                                    Terms & Conditions
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" target="_blank" className="text-decoration-none">
                                    Privacy Policy
                                </a>
                            </>
                        }
                    />

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                        <Button variant="outline-secondary" onClick={handleEdit} className="px-4">
                            <FaEdit className="me-2" />
                            Edit Details
                        </Button>

                        <Button
                            className="btn-red px-5 py-2"
                            size="lg"
                            onClick={handlePayment}
                            disabled={!termsAccepted}
                            style={{ fontSize: '1.1rem' }}
                        >
                            Continue to Payment →
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Progress Indicator */}
            <div className="mt-4">
                <div className="d-flex justify-content-center">
                    <div className="d-flex align-items-center text-muted small">
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                ✓
                            </div>
                            <span className="mx-2">Seat Selection</span>
                        </div>
                        <div className="mx-2">→</div>
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                ✓
                            </div>
                            <span className="mx-2">Passenger Details</span>
                        </div>
                        <div className="mx-2">→</div>
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                3
                            </div>
                            <span className="mx-2 fw-semibold">Review Booking</span>
                        </div>
                        <div className="mx-2">→</div>
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                4
                            </div>
                            <span className="mx-2">Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusReviewInfo;