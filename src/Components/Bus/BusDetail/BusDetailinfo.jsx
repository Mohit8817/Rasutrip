import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaClock, FaWheelchair, FaCity } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const BusDetailinfo = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Destructure all passed state data
    const {
        bus,
        selectedSeats,
        totalPrice,
        departTime,
        arriveTime,
        boarding,
        dropping,
        fromCity,
        toCity,
        departDate,
    } = state || {};

    // Handle case if no state was passed
    if (!state) {
        return (
            <div className="p-3">
                <h5 className="text-danger">No booking data found. Please select your seats first.</h5>
                <Button variant="secondary" onClick={() => navigate("/")}>Go to Home</Button>
            </div>
        );
    }

    const handleContinue = () => {
        navigate("/bus-traveller-details", {
            state: {
                bus,
                selectedSeats,
                totalPrice,
                departTime,
                arriveTime,
                boarding,
                dropping,
                fromCity,
                toCity,
                departDate,
            },
        });
    };

    return (
        <div>
            <div className="bus-review-wrapper p-3">
                {/* Heading */}
                <div className="bg-light px-3 py-2 mb-3 fw-semibold border rounded">
                    Review Your Bus Details
                </div>

                {/* Card Info */}
                <Card className="p-3 border">
                    <Row>
                        {/* From City */}
                        <Col md={4} className="mb-3 mb-md-0 text-center text-md-start">
                            <div className="fw-bold mb-1">
                                <FaCity className="me-1" /> {fromCity || bus?.OriginName || "From City"}
                            </div>
                            <div className="fs-5 fw-bold">{bus?.departTime}</div>
                            <div className="text-muted">
                                {departDate ? new Date(departDate).toDateString() : "Date not available"}
                            </div>
                        </Col>

                        {/* Duration */}
                        <Col md={4} className="d-flex flex-column align-items-center justify-content-center">
                            <div className="fw-semibold text-center mb-1">
                                <FaClock className="me-2" />
                                {bus?.duration || "Duration Not Available"}
                            </div>
                        </Col>

                        {/* To City */}
                        <Col md={4} className="text-center text-md-end">
                            <div className="fw-bold mb-1">
                                {toCity || bus?.DestinationName || "To City"} <FaCity className="ms-1" />
                            </div>
                            <div className="fs-5 fw-bold">{bus?.arriveTime}</div>
                            <div className="text-muted">Next Day</div>
                        </Col>
                    </Row>

                    <hr />

                    <Row>
                        <Col md={4}>
                            <div className="text-muted">Operator</div>
                            <div className="fw-semibold">{bus?.operator}</div>
                        </Col>

                        <Col md={4}>
                            <div className="text-muted">Seat no(s)</div>
                            <div className="text-danger">
                                <FaWheelchair className="me-1" />
                                {selectedSeats?.map((s) => s.SeatName).join(", ") || "None"}
                            </div>
                        </Col>

                        <Col md={4} className="text-md-end">
                            <div className="text-muted">Boarding Point & Time</div>
                            <div className="fw-semibold">
                                {boarding?.CityPointName} / {boarding?.DepTime}
                            </div>
                        </Col>
                    </Row>

                    <hr />

                    <Row>
                        <Col md={6}>
                            <div className="text-muted">Dropping Point & Time</div>
                            <div className="fw-semibold">
                                {dropping?.CityPointName} / {dropping?.ArrTime}
                            </div>
                        </Col>

                        <Col md={6} className="text-md-end">
                            <div className="text-muted">Total Amount</div>
                            <div className="fw-bold text-success fs-5">₹ {totalPrice?.toFixed(2)}</div>
                        </Col>
                    </Row>
                </Card>

                {/* Continue Button */}
                <div className="text-start mt-3">
                    <Button variant="primary" className="btn-red" onClick={handleContinue}>
                        Continue Booking
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BusDetailinfo;
