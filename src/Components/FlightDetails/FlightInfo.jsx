import React from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import '../../Style/Pagescss/FlightResultsPage.css';
import { useNavigate } from 'react-router-dom';

const FlightInfo = () => {

    const navigate = useNavigate();
    
    const handleContinue = () => {
        navigate('/traveller-details');
    };

    return (
        <div className="container">

            {/* Header */}
            <Card className="mb-3 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Review Your Flight Details</h5>
                    <Button variant="" size="sm">Back To Search</Button>
                </Card.Body>
            </Card>

            {/* Route Info */}
            <Card className="mb-3 shadow-sm position-relative">
                <Card.Body>
                    <div>
                        <span className="text-success fw-semibold">Depart </span>
                        <span className="fw-bold">Delhi</span> → <span className="fw-bold">Mumbai</span>
                        <div className="text-muted small">Delhi | 0 Stops | 2 h 15 m</div>
                    </div>
                    <Button variant="outline-danger" size="sm" className="position-absolute top-50 end-0 translate-middle-y me-3">Fare Rules</Button>
                </Card.Body>
            </Card>

            {/* Flight Detail Card */}
            <Card className="shadow-sm mb-3 flight-card-custom">
                <Card.Body>

                    {/* Top summary row */}
                    <Row className="align-items-center mb-3 justify-content-between">
                        <Col md="auto">
                            <img src="/spicejet-logo.png" alt="SpiceJet" width={40} />
                        </Col>

                        <Col md={4}>
                            <div>
                                <strong>Delhi</strong> → <strong>Mumbai</strong> Spicejet SG - 8157 | Economy
                            </div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <div><strong>06:10</strong></div>
                            <div className="text-muted small">20 Jun</div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <FaArrowRight />
                        </Col>

                        <Col md="auto" className="text-center">
                            <div><strong>08:25</strong></div>
                            <div className="text-muted small">20 Jun</div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <div className="small text-muted">2 h 15 m</div>
                            <div className="small text-muted">0 Stops</div>
                        </Col>
                    </Row>

                    <hr />

                    {/* Bottom details row */}
                    <Row>
                        {/* Left: Timeline info */}
                        <Col md={8}>
                            <Row>
                                {/* Departure Time */}
                                <Col xs={2} className="text-center">
                                    <div><strong>06:10</strong></div>
                                </Col>

                                {/* Departure Airport Info */}
                                <Col xs={10}>
                                    <div><strong>Delhi</strong></div>
                                    <div className="text-muted small">Delhi indira gandhi intl</div>
                                    <div className="text-muted small">Terminal 3</div>
                                </Col>

                                {/* Vertical Dotted Line (Timeline) */}
                                <Col xs={2} className="d-flex justify-content-center">
                                    <div className="flight-dot-line"></div>
                                </Col>

                                {/* Duration Badge */}
                                <Col xs={10} className="d-flex align-items-center">
                                    <Badge bg="light" text="dark">2 h 15 m</Badge>
                                </Col>

                                {/* Arrival Time */}
                                <Col xs={2} className="text-center mt-2">
                                    <div><strong>08:25</strong></div>
                                </Col>

                                {/* Arrival Airport Info */}
                                <Col xs={10} className="mt-2">
                                    <div><strong>Mumbai</strong></div>
                                    <div className="text-muted small">Chhatrapati shivaji maharaj international airport</div>
                                    <div className="text-muted small">Terminal 1</div>
                                </Col>
                            </Row>

                        </Col>

                        {/* Right: Baggage info */}
                        <Col md={4} className="text-md-end text-start mt-3 mt-md-0 small">
                            <div><strong>(Adult)</strong> Check-In : 15 Kg</div>
                            <div><strong>Child</strong> : 7 Kg, <strong>Infant</strong>: 7 Kg</div>
                            <div><strong>Fare Class</strong> : DD, <strong>Aircraft</strong> : 737</div>
                        </Col>
                    </Row>

                </Card.Body>

            </Card>
            <div className="text-start">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Booking
                </Button>
            </div>

        </div>
    );
};

export default FlightInfo;
