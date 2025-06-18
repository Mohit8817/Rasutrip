import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaMapMarkerAlt, FaCalendarAlt, FaBed, FaMoon } from "react-icons/fa";
import hotelImage from "../../../../assest/hotel1.jpg";
import { useNavigate } from "react-router-dom";

const HotelReviewInfo = () => {

    const navigate = useNavigate();

    const handleContinue = () => {
        navigate("/HotelPayment");
    };

    return (
        <div>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="fw-bold text-dark">
                                Elivaas 1 BHK with Rooftop Pool - Kamerios Verano, India
                            </h5>
                            <p className="text-muted mb-2">
                                <FaMapMarkerAlt className="me-1" />
                                Pilerne - Candolim Rd, Saipem Goa, India
                            </p>
                        </Col>
                        <Col xs="auto">
                            <div className="text-warning fs-5">⭐⭐⭐⭐⭐</div>
                        </Col>
                    </Row>

                    <hr />

                    <Row className="align-items-center mb-3">
                        <Col md={3}>
                            <img
                                src={hotelImage}
                                alt="Hotel"
                                className="img-fluid rounded"
                                style={{ height: "180px", objectFit: "cover" }}
                            />
                        </Col>

                        <Col md={9}>
                            <Row>
                                <Col md={3} className="mb-3">
                                    <FaCalendarAlt className="me-1" />
                                    <strong> Check-in</strong>
                                    <div className="text-dark fw-bold">Jun, 2025</div>
                                    <div className="text-muted small">19, Thu</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaMoon className="me-1" />
                                    <strong> Nights</strong>
                                    <div className="fw-bold mt-1">1</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaCalendarAlt className="me-1" />
                                    <strong> Check-out</strong>
                                    <div className="text-dark fw-bold">Jun, 2025</div>
                                    <div className="text-muted small">20, Fri</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaBed className="me-1" />
                                    <strong> Rooms & Guests</strong>
                                    <div className="fw-bold mt-1">1 Room 2 Guests</div>
                                </Col>
                            </Row>

                            <hr className="my-3" />

                            <Row>
                                <Col md={4}>
                                    <span className="text-muted">Room Type</span>
                                    <div className="fw-bold">Apartment</div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">No. of Guests</span>
                                    <div className="fw-bold">2 Adults</div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">Cancellation Policy</span>
                                    <div className="fw-bold text-primary">Free Cancellation</div>
                                </Col>
                            </Row>
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
    )
}

export default HotelReviewInfo