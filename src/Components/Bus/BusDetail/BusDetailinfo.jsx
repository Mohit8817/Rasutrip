import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaClock, FaWheelchair, FaCity } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const BusDetailinfo = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

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
        boardingTime,
        droppingTime,
    } = state || {};

    if (!state) {
        return (
            <div className="p-3">
                <h5 className="text-danger">No booking data found. Please select your seats first.</h5>
                <Button variant="secondary" onClick={() => navigate("/")}>
                    Go to Home
                </Button>
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
                boardingTime,
                droppingTime,
            },
        });
    };

    return (
        <div className="bus-review-wrapper p-3">
            {/* Header */}
            <div className="bg-secondary-subtle text-dark px-3 py-2 mb-3 fw-semibold border rounded">
                Review Your Bus Details
            </div>

            {/* Card Section */}
            <Card className="p-3 border shadow-sm">
                {/* Route and Times */}
                <Row className="mb-3 align-items-center">
                    <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
                        <div className="fw-semibold mb-1">
                            <FaCity className="me-1" /> {fromCity}
                        </div>
                        <div className="fs-4 fw-bold text-dark">{departTime}</div>
                        <div className="text-muted small">
                            {departDate ? new Date(departDate).toDateString() : "-"}
                        </div>
                    </Col>

                    <Col md={4} className="text-center">
                        <div className="fw-semibold text-dark mb-1">
                            {/* <FaClock className="" /> */}
                            {bus?.duration || "-"}
                        </div>
                    </Col>

                    <Col md={4} className="text-center text-md-end">
                        <div className="fw-semibold mb-1">
                            {/* <FaCity className="me-1" /> */}
                            {toCity}
                        </div>
                        <div className="fs-4 fw-bold text-dark">{arriveTime}</div>
                        <div className="text-muted small">Fri, 01 Aug 25</div>
                    </Col>
                </Row>

                <hr />

                {/* Operator, Seat(s), Boarding */}
                <Row className="mb-3">
                    <Col md={4} className="mb-3 mb-md-0">
                        <div className="text-muted small">Operator</div>
                        <div className="fw-semibold text-dark">{bus?.operator || "-"}</div>
                    </Col>

                    <Col
                        md={4}
                        className="mb-3 mb-md-0 d-flex flex-column align-items-center justify-content-center text-center"
                    >
                        <div className="text-muted small">Seat no(s)</div>
                        <div className="text-danger d-flex align-items-center justify-content-center flex-wrap">
                            <FaWheelchair className="me-1" />
                            <span>{selectedSeats?.map((s) => s.SeatName).join(", ") || "-"}</span>
                        </div>
                    </Col>

                    <Col md={4} className="text-md-end">
                        <div className="text-muted small">Boarding Point & Time</div>
                        <div className="fw-semibold text-dark">
                            {boarding?.CityPointName || "-"} / {boardingTime || "-"}
                        </div>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <div className="text-muted small">Dropping Point & Time</div>
                        <div className="fw-semibold text-dark">
                            {dropping?.CityPointName || "-"} / {droppingTime || "-"}
                        </div>
                    </Col>

                    <Col md={6} className="text-md-end">
                        <div className="text-muted small">Total Fare</div>
                        <div className="fw-semibold text-dark">₹ {totalPrice || "-"}</div>
                    </Col>
                </Row>



            </Card>

            {/* Continue Button */}
            <div className="text-start mt-4">
                <Button
                    variant="primary"
                    className="btn-red"
                    onClick={handleContinue}>
                    Continue Booking
                </Button>
            </div>
        </div>
    );
};

export default BusDetailinfo;
