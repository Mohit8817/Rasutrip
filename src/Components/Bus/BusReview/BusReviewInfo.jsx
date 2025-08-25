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
        dropping = {},
        fromCity = '',
        toCity = '',
        departDate = '',
        arriveDate = '',
        boardingTime = '',
        droppingTime = '',

        // Enhanced journey details from traveller page
        enhancedJourneyDetails = {},

        // Booking status
        blockSeatResponse = null,
        seatsBlocked = false,
        isBlockingSeats = false,

        // Additional info
        passengerCount = 0,
        seatCount = 0,
        hasGstDetails = false,

        // Debug info
        metadata = null
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
            enhancedJourneyDetails: enhancedJourneyDetails,
            metadata: metadata
        });

        setDataLoaded(true);
    }, [state, passengerData, contactData, gstData, selectedSeats, enhancedJourneyDetails]);

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
            seatName: passenger.seatName || getSeatName(selectedSeats[index], index),
            isLead: passenger.isLeadPassenger || (index === 0)
        };
    };

    // Enhanced seat display
    const getSeatDisplayText = () => {
        if (!selectedSeats || selectedSeats.length === 0) return 'No seats selected';

        return selectedSeats.map((seat, index) => getSeatName(seat, index)).join(", ");
    };

    // Enhanced date formatting
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Get journey details with enhanced fallbacks
    const getJourneyDetails = () => {
        return {
            fromCity: enhancedJourneyDetails?.fromCity || fromCity || 'N/A',
            toCity: enhancedJourneyDetails?.toCity || toCity || 'N/A',
            departDate: enhancedJourneyDetails?.departDate || departDate || 'N/A',
            arriveDate: enhancedJourneyDetails?.arriveDate || arriveDate || departDate || 'N/A',
            departTime: enhancedJourneyDetails?.departTime || departTime || 'N/A',
            arriveTime: enhancedJourneyDetails?.arriveTime || arriveTime || 'N/A',
            duration: enhancedJourneyDetails?.duration || bus?.duration || 'N/A',
            operator: enhancedJourneyDetails?.operator || bus?.operator || bus?.TravelName || bus?.name || 'N/A',
            busType: enhancedJourneyDetails?.busType || bus?.busType || bus?.BusType || 'AC Seater',
            boardingPoint: {
                name: enhancedJourneyDetails?.boardingPoint?.name || boarding?.CityPointName || boarding?.name || 'Boarding Point',
                time: enhancedJourneyDetails?.boardingPoint?.time || boardingTime || boarding?.DepTime || boarding?.time || departTime || 'N/A',
                address: enhancedJourneyDetails?.boardingPoint?.address || boarding?.CityPointAddress || boarding?.address || '',
                landmark: enhancedJourneyDetails?.boardingPoint?.landmark || boarding?.CityPointLandmark || boarding?.landmark || ''
            },
            droppingPoint: {
                name: enhancedJourneyDetails?.droppingPoint?.name || dropping?.CityPointName || dropping?.name || 'Dropping Point',
                time: enhancedJourneyDetails?.droppingPoint?.time || droppingTime || dropping?.ArrTime || dropping?.time || arriveTime || 'N/A',
                address: enhancedJourneyDetails?.droppingPoint?.address || dropping?.CityPointAddress || dropping?.address || '',
                landmark: enhancedJourneyDetails?.droppingPoint?.landmark || dropping?.CityPointLandmark || dropping?.landmark || ''
            }
        };
    };

    const journeyDetails = getJourneyDetails();

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

            // Journey summary with enhanced details
            journeyDetails: journeyDetails,

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
            replace: false
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
            <Card className="p-2 mb-4">
                <div>
                    <h5 className="mb-1">Review Your Booking</h5>
                    <p className="text-muted mb-0">
                        Please review all details before proceeding to payment
                        {metadata && (
                            <small className="d-block text-success">
                                ✓ Data passed from {metadata.passedFrom} at {new Date(metadata.passedAt).toLocaleTimeString()}
                            </small>
                        )}
                    </p>
                </div>
            </Card>

            {/* Enhanced Route Info */}
            <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "10px" }}>
                <Card.Header className="bg-danger text-white">
                    <h5 className="mb-0">Journey Details</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col md={4}>
                            <div className="d-flex align-items-center mb-2">
                                <FaCity className="me-2 text-danger" />
                                <strong className="fs-5">{journeyDetails.fromCity}</strong>
                            </div>
                            <h4 className="fw-bold text-success">{journeyDetails.departTime}</h4>
                            <div className="text-muted">
                                {formatDate(journeyDetails.departDate)}
                            </div>
                            <hr />
                            <div>
                                <div className="text-muted small">Bus Operator</div>
                                <strong>{journeyDetails.operator}</strong>
                                <div className="text-muted small">{journeyDetails.busType}</div>
                            </div>
                        </Col>

                        <Col md={4} className="text-center">
                            <div className="d-flex flex-column align-items-center">
                                <FaClock className="mb-2 text-danger" size={20} />
                                <div className="fw-bold">{journeyDetails.duration}</div>
                                <div className="text-muted small">Duration</div>
                            </div>
                            <hr />
                            <div className=''>
                                <div className="text-muted small">Selected Seats ({selectedSeats.length})</div>
                                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap mt-2">
                                    <FaWheelchair className="text-danger" />
                                    <span className="fw-semibold">
                                        {getSeatDisplayText()}
                                    </span>
                                </div>
                                {/* <div className="text-success fw-bold mt-2" style={{ fontSize: '1.3rem' }}>
                                    ₹ {totalPrice?.toLocaleString() || 0}
                                </div>
                                <div className="text-muted small">Total Fare</div> */}
                            </div>
                        </Col>

                        <Col md={4} className="text-end">
                            <div className="d-flex justify-content-end align-items-center mb-2">
                                <strong className="fs-5">{journeyDetails.toCity}</strong>
                                <FaCity className="ms-2 text-danger" />
                            </div>
                            <h4 className="fw-bold text-success">{journeyDetails.arriveTime}</h4>
                            <div className="text-muted">
                                {formatDate(journeyDetails.arriveDate)}
                            </div>
                            <hr />
                            <div>
                                <div className="text-muted small">Boarding Point</div>
                                <strong>{journeyDetails.boardingPoint.name}</strong>
                                <div className="text-muted small">
                                    Time: {journeyDetails.boardingPoint.time}
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Enhanced Boarding/Dropping Points */}
                    <hr className="my-4" />
                    <Row>
                        <Col md={6}>
                            <div className="border rounded p-3 bg-light">
                                <div className="d-flex align-items-center mb-2">
                                    <FaCity className="me-2 text-success" />
                                    <strong>Boarding Point</strong>
                                </div>
                                <div className="fw-bold mb-1">{journeyDetails.boardingPoint.name}</div>
                                <div className="text-primary fw-semibold mb-2">
                                    Time: {journeyDetails.boardingPoint.time}
                                </div>
                                {journeyDetails.boardingPoint.address && (
                                    <div className="text-muted small mb-1">
                                        <strong>Address:</strong> {journeyDetails.boardingPoint.address}
                                    </div>
                                )}
                                {journeyDetails.boardingPoint.landmark && (
                                    <div className="text-muted small">
                                        <strong>Landmark:</strong> {journeyDetails.boardingPoint.landmark}
                                    </div>
                                )}
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="border rounded p-3 bg-light">
                                <div className="d-flex align-items-center mb-2">
                                    <FaCity className="me-2 text-danger" />
                                    <strong>Dropping Point</strong>
                                </div>
                                <div className="fw-bold mb-1">{journeyDetails.droppingPoint.name}</div>
                                <div className="text-success fw-semibold mb-2">
                                    Time: {journeyDetails.droppingPoint.time}
                                </div>
                                {journeyDetails.droppingPoint.address && (
                                    <div className="text-muted small mb-1">
                                        <strong>Address:</strong> {journeyDetails.droppingPoint.address}
                                    </div>
                                )}
                                {journeyDetails.droppingPoint.landmark && (
                                    <div className="text-muted small">
                                        <strong>Landmark:</strong> {journeyDetails.droppingPoint.landmark}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Contact Information */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Contact Information</h5>
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
                                    <strong>Email Address</strong>
                                </div>
                                <div className="">{contactData?.email || 'Not provided'}</div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-1">
                                    <strong>Mobile Number</strong>
                                </div>
                                <div className="">
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
                                            <Badge bg={details.isLead ? "danger" : "secondary"} className="me-2">
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

                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Terms and Conditions */}
            <Card className="mb-4 shadow-sm border-0">
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
                                <a href="/terms" target="_blank" className="text-decoration-none text-danger">
                                    Terms & Conditions
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" target="_blank" className="text-decoration-none text-danger">
                                    Privacy Policy
                                </a>
                            </>
                        }
                    />

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                        <Button
                            className="btn-red px-5 py-2"
                            onClick={handlePayment}
                            disabled={!termsAccepted}
                        >Continue to Payment →</Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default BusReviewInfo;