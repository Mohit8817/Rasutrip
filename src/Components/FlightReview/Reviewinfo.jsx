
import { Card, Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';

import React, { useState } from 'react';

import { FaInfoCircle, FaPen } from 'react-icons/fa';
import '../../Style/Pagescss/FlightResultsPage.css';
import { useNavigate } from 'react-router-dom';

const ReviewInfo = () => {
    const navigate = useNavigate();
    const handleContinue = () => {
        navigate('/Payment');
    };
    const [acceptedTerms, setAcceptedTerms] = useState(true);
    return (
        <div className="container">

            {/* Header */}
            <Card className="mb-3 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Review Your Flight Details</h5>
                    <Button variant="" size="sm">Back To Search</Button>
                </Card.Body>
            </Card>

            {/* Review Booking Title */}
            <h5 className="fw-bold mb-3">Review Booking</h5>

            {/* Flight Detail Card */}
            <Card className="shadow-sm mb-3 flight-card-custom">
                <Card.Body>

                    {/* Top summary row */}
                    <Row className="align-items-center justify-content-between">
                        <Col md="auto">
                            <img src="/spicejet-logo.png" alt="SpiceJet" width={35} />
                        </Col>

                        <Col md={4}>
                            <div className="fw-bold">Mumbai → Delhi <span className="fw-normal">Spicejet SG - 710 | Economy</span></div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <div><strong>22:55</strong></div>
                            <div className="text-muted small">18 Jun</div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <FaArrowRight />
                        </Col>

                        <Col md="auto" className="text-center">
                            <div><strong>00:55</strong></div>
                            <div className="text-muted small">19 Jun</div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <div className="small text-muted">2 h 0 m</div>
                            <div className="small text-muted">0 Stops</div>
                        </Col>
                    </Row>

                    <hr />

                    {/* Airline details */}
                    <Row className="mb-3">
                        <Col md="auto">
                            <img src="/spicejet-logo.png" alt="SpiceJet" width={30} />
                        </Col>
                        <Col>
                            <div className="fw-bold">Spicejet</div>
                            <div className="text-muted small">Flight SG - 710 | Economy <span className="text-success">| Refundable</span></div>
                        </Col>
                    </Row>

                    {/* Bottom details row */}
                    <Row>
                        {/* Left: Timeline info */}
                        <Col md={8}>
                            <Row>
                                <Col xs={2} className="text-center">
                                    <div><strong>22:55</strong></div>
                                </Col>
                                <Col xs={10}>
                                    <div><strong>Mumbai</strong></div>
                                    <div className="text-muted small">Chhatrapati shivaji maharaj international airport</div>
                                    <div className="text-muted small">Terminal 1</div>
                                </Col>

                                <Col xs={2} className="d-flex justify-content-center">
                                    <div className="flight-dot-line"></div>
                                </Col>

                                <Col xs={10} className="d-flex align-items-center">
                                    <Badge bg="light" text="dark">2 h 0 m</Badge>
                                </Col>

                                <Col xs={2} className="text-center mt-2">
                                    <div><strong>00:55</strong></div>
                                </Col>
                                <Col xs={10} className="mt-2">
                                    <div><strong>Delhi</strong></div>
                                    <div className="text-muted small">Delhi indira gandhi intl</div>
                                    <div className="text-muted small">Terminal 1D</div>
                                </Col>
                            </Row>
                        </Col>

                        {/* Right: Baggage info */}
                        <Col md={4} className="text-md-end text-start mt-3 mt-md-0 small">
                            <div><strong>(Adult)</strong> Check-In : 15 Kg</div>
                            <div><strong>Child</strong> : 7 Kg, <strong>Infant</strong>: 7 Kg</div>
                            <div><strong>Fare Class</strong> : DD, <strong>Aircraft</strong> : 73G</div>
                        </Col>
                    </Row>

                </Card.Body>
            </Card>

            <Card className="container mt-2 ">

                {/* Pax Details Title */}
                <div className="d-flex align-items-center mb-3">
                    <h5 className="mb-0">Pax Details</h5>
                    <FaPen className="ms-2 text-primary" />
                </div>

                {/* Dummy Dropdown Input */}
                <Form.Group className="mb-3">
                    <Form.Select>
                        <option>mmmm MMM</option>
                        <option>Passenger 1</option>
                        <option>Passenger 2</option>
                    </Form.Select>
                </Form.Group>

                {/* Important Info Box */}
                <Card className="mb-3 bg-light border">
                    <Card.Header className="bg-white fw-bold d-flex align-items-center">
                        <FaInfoCircle className="me-2 text-primary" />
                        Important Information
                    </Card.Header>
                    <Card.Body className="text-muted small">
                        <p className="mb-2">
                            Flights are operating in strict compliance with the EXIT and ENTRY regulations applicable at origin and destination as defined by the competent authorities.
                        </p>
                        <p className="mb-0">
                            Effective 22nd May, 2021 it is mandatory for all passengers to carry a negative RT-PCR test report with QR code for boarding international flights to destinations where test reports are required as per the guidelines issued by the destination countries.
                        </p>
                    </Card.Body>
                </Card>

                {/* Terms and Conditions */}
                <Form.Group controlId="termsCheck" className="mb-3">
                    <Form.Check
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={() => setAcceptedTerms(!acceptedTerms)}
                        label={
                            <>
                                I have read and accept the <a href="/" className="text-primary">Terms & Conditions</a>.
                            </>
                        }
                    />
                </Form.Group>



            </Card>
            {/* Continue Payment Button */}
            <div className="text-start mt-3">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Payment
                </Button>
            </div>
        </div>
    );
};

export default ReviewInfo;
