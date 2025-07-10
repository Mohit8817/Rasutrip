import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LocationContext } from "../Context/LocationContext";
import { Card, Button, Row, Col, Form, Badge } from "react-bootstrap";
import { FaArrowRight, FaPen, FaInfoCircle } from "react-icons/fa";

const ReviewInfo = () => {
    const passengersData = useSelector((state) => state.passengersData || { adults: 0, children: 0, infants: 0 });
    const { locationData } = useContext(LocationContext);
    const navigate = useNavigate();
    const [acceptedTerms, setAcceptedTerms] = useState(true);

    const handleContinue = () => {
        navigate("/Payment");
    };

    const {
        fromCity = "",
        toCity = "",
        fromAirport = "",
        toAirport = "",
        fromCode = "",
        toCode = "",
        departDate = "",
        PreferredTime = "",
        tripType = "",
    } = locationData || {};

    const formattedDate = new Date(PreferredTime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const formattedTime = new Date(PreferredTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="container">
            {/* Header */}
            <Card className="mb-3 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Review Your Flight Details</h5>
                    <Button variant="" size="sm">Back To Search</Button>
                </Card.Body>
            </Card>

            <h5 className="fw-bold mb-3">Review Booking</h5>

            {/* Flight Card */}
            <Card className="shadow-sm mb-3 flight-card-custom">
                <Card.Body>
                    <Row className="align-items-center justify-content-between">
                        <Col md="auto">
                            <img src="/spicejet-logo.png" alt="SpiceJet" width={35} />
                        </Col>

                        <Col md={4}>
                            <div className="fw-bold">{fromCity} → {toCity} <span className="fw-normal">SpiceJet SG - 710 | Economy</span></div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <div><strong>{formattedTime}</strong></div>
                            <div className="text-muted small">{formattedDate}</div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <FaArrowRight />
                        </Col>

                        <Col md="auto" className="text-center">
                            <div><strong>+2h</strong></div>
                            <div className="text-muted small">{formattedDate}</div>
                        </Col>

                        <Col md="auto" className="text-center">
                            <div className="small text-muted">2 h 0 m</div>
                            <div className="small text-muted">0 Stops</div>
                        </Col>
                    </Row>

                    <hr />

                    {/* Airline Details */}
                    <Row className="mb-3">
                        <Col md="auto">
                            <img src="/spicejet-logo.png" alt="SpiceJet" width={30} />
                        </Col>
                        <Col>
                            <div className="fw-bold">SpiceJet</div>
                            <div className="text-muted small">Flight SG - 710 | Economy <span className="text-success">| Refundable</span></div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={8}>
                            <Row>
                                <Col xs={2} className="text-center">
                                    <div><strong>{formattedTime}</strong></div>
                                </Col>
                                <Col xs={10}>
                                    <div><strong>{fromCity}</strong></div>
                                    <div className="text-muted small">{fromAirport}</div>
                                    <div className="text-muted small">Terminal 1</div>
                                </Col>

                                <Col xs={2} className="d-flex justify-content-center">
                                    <div className="flight-dot-line"></div>
                                </Col>

                                <Col xs={10} className="d-flex align-items-center">
                                    <Badge bg="light" text="dark">2 h 0 m</Badge>
                                </Col>

                                <Col xs={2} className="text-center mt-2">
                                    <div><strong>+2h</strong></div>
                                </Col>
                                <Col xs={10} className="mt-2">
                                    <div><strong>{toCity}</strong></div>
                                    <div className="text-muted small">{toAirport}</div>
                                    <div className="text-muted small">Terminal 1D</div>
                                </Col>
                            </Row>
                        </Col>

                        {/* Baggage Info */}
                        <Col md={4} className="text-md-end text-start mt-3 mt-md-0 small">
                            {passengersData?.adults > 0 && (
                                <div><strong>(Adult)</strong> Check-In : 15 Kg</div>
                            )}
                            {(passengersData?.children > 0 || passengersData?.infants > 0) && (
                                <div>
                                    {passengersData?.children > 0 && <strong>Child</strong>}: 7 Kg{passengersData?.infants > 0 && ", "}
                                    {passengersData?.infants > 0 && <strong>Infant</strong>}: 7 Kg
                                </div>
                            )}
                            <div><strong>Fare Class</strong>: DD, <strong>Aircraft</strong>: 73G</div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Pax Info */}
            <Card className="container mt-2">
                <div className="d-flex align-items-center mb-3">
                    <h5 className="mb-0">Pax Details</h5>
                    <FaPen className="ms-2 text-primary" />
                </div>

                <Form.Group className="mb-3">
                    <Form.Select>
                        <option>Passenger 1</option>
                        <option>Passenger 2</option>
                    </Form.Select>
                </Form.Group>

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

                {/* Terms */}
                <Form.Group controlId="termsCheck" className="mb-3">
                    <Form.Check
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={() => setAcceptedTerms(!acceptedTerms)}
                        label={<>I have read and accept the <a href="/" className="text-primary">Terms & Conditions</a>.</>}
                    />
                </Form.Group>
            </Card>

            {/* Continue Button */}
            <div className="text-start mt-3">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Payment
                </Button>
            </div>
        </div>
    );
};

export default ReviewInfo;
