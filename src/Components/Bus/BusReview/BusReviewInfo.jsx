import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Alert, Badge } from 'react-bootstrap';
import { FaCity, FaClock, FaEdit, FaWheelchair, FaUser, FaEnvelope, FaPhone, FaReceipt, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const BusReviewInfo = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [termsAccepted, setTermsAccepted] = useState(false);

    const {
        bus,
        selectedSeats,
        totalPrice,
        departTime,
        arriveTime,
        boarding,
        fromCity,
        toCity,
        departDate,
        passengerData,
        contactData,
        gstData, // GST data from traveller form
    } = state || {};

    const handlePayment = () => {
        if (!termsAccepted) {
            alert('Please accept the terms and conditions to continue.');
            return;
        }
        navigate("/bus-payment", { state: { ...state, totalPrice } });
    };

    const handleEdit = () => {
        navigate("/bus-traveller-details", { state });
    };

    const handleGoBack = () => {
        navigate(-1);
    };

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

    return (
        <div className="container my-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Review Your Booking</h4>
                    <p className="text-muted mb-0">Please review all details before proceeding to payment</p>
                </div>
                <Button variant="outline-secondary" onClick={handleGoBack}>
                    <FaArrowLeft className="me-2" />
                    Back
                </Button>
            </div>

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
                                <strong className="fs-5">{fromCity}</strong>
                            </div>
                            <h4 className="fw-bold text-success">{departTime}</h4>
                            <div className="text-muted">{new Date(departDate).toDateString()}</div>
                            <hr />
                            <div>
                                <div className="text-muted small">Bus Operator</div>
                                <strong>{bus?.operator || 'N/A'}</strong>
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
                                <div className="text-muted small">Selected Seats</div>
                                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap mt-2">
                                    <FaWheelchair className="text-danger" />
                                    <span className="fw-semibold">
                                        {selectedSeats?.map(s => s.SeatName).join(", ")}
                                    </span>
                                </div>
                            </div>
                        </Col>

                        <Col md={4} className="text-end">
                            <div className="d-flex justify-content-end align-items-center mb-2">
                                <strong className="fs-5">{toCity}</strong>
                                <FaCity className="ms-2 text-primary" />
                            </div>
                            <h4 className="fw-bold text-success">{arriveTime}</h4>
                            <div className="text-muted">{new Date(departDate).toDateString()}</div>
                            <hr />
                            <div>
                                <div className="text-muted small">Boarding Point</div>
                                <strong>{boarding?.CityPointName || 'N/A'}</strong>
                                <div className="text-muted small">Time: {boarding?.DepTime || 'N/A'}</div>
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
                                    {contactData?.countryCode} {contactData?.mobile || 'Not provided'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Passenger Details */}
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
                    {passengerData?.map((passenger, index) => (
                        <Card key={index} className="border mb-3">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <Badge bg={index === 0 ? "primary" : "secondary"} className="me-2">
                                            {index === 0 ? "Lead Passenger" : `Passenger ${index + 1}`}
                                        </Badge>
                                        <span className="fw-semibold">Seat {selectedSeats?.[index]?.SeatName}</span>
                                    </div>
                                </div>
                                <Row>
                                    <Col md={8}>
                                        <div className="mb-2">
                                            <strong>Name:</strong> {passenger.title} {passenger.firstName} {passenger.lastName}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Age:</strong> {passenger.age} years | <strong>Gender:</strong> {passenger.gender}
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="mb-2">
                                            <strong>ID Type:</strong> {passenger.idType}
                                        </div>
                                        <div className="mb-2">
                                            <strong>ID Number:</strong> {passenger.idNumber}
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Card.Body>
            </Card>

            {/* GST Details (if provided) */}
            {gstData && (
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
                                    <strong>GST Number:</strong> {gstData.gstNumber}
                                </div>
                                <div className="mb-2">
                                    <strong>Company Name:</strong> {gstData.companyName}
                                </div>
                                <div className="mb-2">
                                    <strong>Contact:</strong> {gstData.contactNo}
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-2">
                                    <strong>Email:</strong> {gstData.email}
                                </div>
                                <div className="mb-2">
                                    <strong>Address:</strong> {gstData.address}
                                </div>
                                <div className="mb-2">
                                    <strong>City, State:</strong> {gstData.city}, {gstData.state}
                                </div>
                                <div className="mb-2">
                                    <strong>Pincode:</strong> {gstData.pincode}
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
                                    <strong>Seats:</strong> {selectedSeats?.map(s => s.SeatName).join(", ")}
                                </div>
                                {gstData && (
                                    <div className="text-muted small">
                                        * GST invoice will be generated
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