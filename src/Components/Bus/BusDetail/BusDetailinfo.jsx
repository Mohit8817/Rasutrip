import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaClock, FaWheelchair, FaCity } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const BusDetailinfo = () => {

    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/bus-traveller-details');
    };

    return (
        <div>
            <div className="bus-review-wrapper p-3 ">
                {/* Heading */}
                <div className="bg-light px-3 py-2 mb-3 fw-semibold border rounded">
                    Review Your Bus Details
                </div>

                {/* Card Info */}
                <Card className="p-3 border">
                    <Row>
                        {/* From */}
                        <Col md={4} className="mb-3 mb-md-0 text-center text-md-start">
                            <div className="fw-bold mb-1">
                                <FaCity className="me-1" /> Bangalore
                            </div>
                            <div className="fs-5 fw-bold">21:15</div>
                            <div className="text-muted">Fri, 20 Jun 25</div>
                        </Col>

                        {/* Duration */}
                        <Col md={4} className="d-flex flex-column align-items-center justify-content-center">
                            <div className="fw-semibold text-center mb-1">
                                <FaClock className="me-2" />
                                10h 35m
                            </div>
                        </Col>

                        {/* To */}
                        <Col md={4} className="text-center text-md-end">
                            <div className="fw-bold mb-1">
                                Hyderabad <FaCity className="ms-1" />
                            </div>
                            <div className="fs-5 fw-bold">07:50</div>
                            <div className="text-muted">Sat, 21 Jun 25</div>
                        </Col>
                    </Row>

                    <hr />

                    <Row>
                        <Col md={4}>
                            <div className="text-muted">Operator</div>
                            <div className="fw-semibold">Avm Tours And Travels</div>
                        </Col>

                        <Col md={4}>
                            <div className="text-muted">Seat no(s)</div>
                            <div className="text-danger">
                                <FaWheelchair className="me-1" />
                                26, 24, 23, 25, 15U, 10U
                            </div>
                        </Col>

                        <Col md={4} className="text-md-end">
                            <div className="text-muted">Boarding Point & Time</div>
                            <div className="fw-semibold">KalasiPalayam (KR Market) / 19:25</div>
                        </Col>
                    </Row>
                </Card>

                {/* Button */}


                <div className="text-start mt-2">
                    <Button variant="primary" className="btn-red" onClick={handleContinue}>
                        Continue Booking
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BusDetailinfo