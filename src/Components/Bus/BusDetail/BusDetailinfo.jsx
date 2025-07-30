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
        blockResponse,
        passengerData
    } = state || {};

    if (!state) {
        return (
            <div className="container p-3">
                <div className="text-center py-5">
                    <h5 className="text-danger mb-3">No booking data found</h5>
                    <p className="text-muted mb-4">Please select your seats first to continue with the booking process.</p>
                    <Button variant="secondary" onClick={() => navigate("/")}>
                        Go to Home
                    </Button>
                </div>
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
                blockResponse,
                passengerData
            },
        });
    };

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Calculate journey duration
    const calculateDuration = (departTime, arriveTime) => {
        if (!departTime || !arriveTime) return bus?.duration || "-";

        try {
            const dept = new Date(`1970-01-01 ${departTime}`);
            const arr = new Date(`1970-01-01 ${arriveTime}`);

            if (arr < dept) {
                arr.setDate(arr.getDate() + 1); // Next day arrival
            }

            const diffMs = arr - dept;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            return `${hours}h ${minutes}m`;
        } catch (e) {
            return bus?.duration || "-";
        }
    };

    return (
        <div className="bus-review-wrapper container py-4">
            {/* Header */}
            <div className="bg-light text-dark px-4 py-3 mb-4 fw-semibold border rounded shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaClock className="me-2 text-primary" />
                        Review Your Bus Details
                    </h5>
                    <Button variant="outline-secondary" size="sm" onClick={handleGoBack}>
                        ← Back
                    </Button>
                </div>
            </div>

            {/* Main Card Section */}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    {/* Route and Times Section */}
                    <Row className="mb-4 align-items-center">
                        <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
                            <div className="fw-semibold mb-2 text-muted">
                                <FaCity className="me-2" /> Departure
                            </div>
                            <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem' }}>
                                {departTime || "-"}
                            </div>
                            <div className="fw-semibold text-dark mb-1">
                                {fromCity || "-"}
                            </div>
                            <div className="text-muted small">
                                {formatDate(departDate)}
                            </div>
                        </Col>

                        <Col md={4} className="text-center">
                            <div className="text-muted small mb-2">Journey Duration</div>
                            <div className="fw-bold text-primary mb-2" style={{ fontSize: '1.2rem' }}>
                                {calculateDuration(departTime, arriveTime)}
                            </div>
                            <div className="text-center">
                                <div style={{
                                    height: '2px',
                                    background: 'linear-gradient(to right, #007bff, #28a745)',
                                    margin: '0 20px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '-4px',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#007bff',
                                        borderRadius: '50%'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '-4px',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#28a745',
                                        borderRadius: '50%'
                                    }}></div>
                                </div>
                            </div>
                        </Col>

                        <Col md={4} className="text-center text-md-end">
                            <div className="fw-semibold mb-2 text-muted">
                                <FaCity className="me-2" /> Arrival
                            </div>
                            <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem' }}>
                                {arriveTime || "-"}
                            </div>
                            <div className="fw-semibold text-dark mb-1">
                                {toCity || "-"}
                            </div>
                            <div className="text-muted small">
                                {formatDate(departDate)} {/* Assuming same day for now, could be next day */}
                            </div>
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    {/* Bus Details Section */}
                    <Row className="mb-4">
                        <Col md={4} className="mb-3 mb-md-0">
                            <div className="text-muted small mb-1">Bus Operator</div>
                            <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                {bus?.operator || bus?.TravelName || "-"}
                            </div>
                            <div className="text-muted small mt-1">
                                {bus?.busType || bus?.BusType || "AC Seater"}
                            </div>
                        </Col>

                        <Col md={4} className="mb-3 mb-md-0 text-center">
                            <div className="text-muted small mb-1">Selected Seat(s)</div>
                            <div className="text-danger d-flex align-items-center justify-content-center flex-wrap">
                                <FaWheelchair className="me-2" />
                                <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                                    {selectedSeats?.map((s) => s.SeatName).join(", ") || "-"}
                                </span>
                            </div>
                            <div className="text-muted small mt-1">
                                {selectedSeats?.length || 0} seat{selectedSeats?.length !== 1 ? 's' : ''} selected
                            </div>
                        </Col>

                        <Col md={4} className="text-md-end">
                            <div className="text-muted small mb-1">Total Fare</div>
                            <div className="fw-bold text-success" style={{ fontSize: '1.5rem' }}>
                                ₹ {totalPrice?.toLocaleString() || "-"}
                            </div>
                            <div className="text-muted small mt-1">
                                Including all taxes
                            </div>
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    {/* Boarding and Dropping Points Section */}
                    <Row className="mb-4">
                        <Col md={6} className="mb-3 mb-md-0">
                            <div className="border rounded p-3 bg-light">
                                <div className="text-muted small mb-1">Boarding Point</div>
                                <div className="fw-bold text-dark mb-1">
                                    {boarding?.CityPointName || "-"}
                                </div>
                                <div className="text-primary fw-semibold mb-1">
                                    Time: {boardingTime || "-"}
                                </div>
                                {boarding?.CityPointAddress && (
                                    <div className="text-muted small">
                                        {boarding.CityPointAddress}
                                    </div>
                                )}
                                {boarding?.CityPointLandmark && (
                                    <div className="text-muted small">
                                        Landmark: {boarding.CityPointLandmark}
                                    </div>
                                )}
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="border rounded p-3 bg-light">
                                <div className="text-muted small mb-1">Dropping Point</div>
                                <div className="fw-bold text-dark mb-1">
                                    {dropping?.CityPointName || "-"}
                                </div>
                                <div className="text-success fw-semibold mb-1">
                                    Time: {droppingTime || "-"}
                                </div>
                                {dropping?.CityPointAddress && (
                                    <div className="text-muted small">
                                        {dropping.CityPointAddress}
                                    </div>
                                )}
                                {dropping?.CityPointLandmark && (
                                    <div className="text-muted small">
                                        Landmark: {dropping.CityPointLandmark}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Booking Summary Card */}
                    <div className="border rounded p-3 bg-primary bg-opacity-10">
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h6 className="mb-1 text-dark">Booking Summary</h6>
                                <div className="text-muted small">
                                    {selectedSeats?.length || 0} passenger{selectedSeats?.length !== 1 ? 's' : ''} •
                                    {fromCity} to {toCity} •
                                    {formatDate(departDate)}
                                </div>
                            </Col>
                            <Col md={4} className="text-md-end">
                                <div className="fw-bold text-dark" style={{ fontSize: '1.3rem' }}>
                                    Total: ₹ {totalPrice?.toLocaleString() || "-"}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <Button
                    variant="outline-secondary"
                    onClick={handleGoBack}
                    className="px-4"
                > ← Modify Selection
                </Button>

                <Button
                    variant="primary"
                    className="btn-red px-5 py-2"
                    onClick={handleContinue}
                    style={{ fontSize: '1.1rem' }}
                >
                    Continue to Passenger Details →
                </Button>
            </div>

            {/* Important Notes */}
            <div className="mt-4">
                <Card className="border-warning bg-warning bg-opacity-10">
                    <Card.Body className="py-3">
                        <h6 className="text-warning mb-2">
                            📋 Important Information
                        </h6>
                        <ul className="text-muted small mb-0 ps-3">
                            <li>Please arrive at the boarding point at least 15 minutes before departure</li>
                            <li>Carry a valid ID proof for verification</li>
                            <li>Your seats have been temporarily reserved for 15 minutes</li>
                            <li>Cancellation and refund policies apply as per operator terms</li>
                        </ul>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default BusDetailinfo;