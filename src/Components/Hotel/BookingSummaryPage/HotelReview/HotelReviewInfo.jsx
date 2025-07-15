import React from "react";
import { Card, Row, Col, Button, Form } from "react-bootstrap";
import {
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaBed,
    FaMoon,
    FaEdit,
} from "react-icons/fa";
import hotelImage from "../../../../assest/hotel1.jpg";
import { useNavigate, useLocation } from "react-router-dom";

const HotelReviewInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { hotel, room, roomDetails, guestInputs, email, mobile } =
        location.state || {};

    const handleContinue = () => {
        navigate("/HotelPayment");
    };

    if (!hotel || !room || !guestInputs) {
        return (
            <div className="p-4 text-danger text-center">
                ❌ Missing booking review data. Please go back and complete previous
                steps.
            </div>
        );
    }

    return (
        <div className="container my-4">
            {/* Hotel Detail Card */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="fw-bold text-dark">{hotel.name}</h5>
                            <p className="text-muted mb-2">
                                <FaMapMarkerAlt className="me-1 text-danger" />
                                {hotel.location}
                            </p>
                        </Col>
                        <Col xs="auto">
                            <div className="text-warning fs-5">
                                {"⭐".repeat(hotel.rating || 3)}
                            </div>
                        </Col>
                    </Row>

                    <hr />

                    <Row className="align-items-center mb-3">
                        <Col md={3}>
                            <img
                                src={hotel.image || hotelImage}
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
                                    <div className="text-dark fw-semibold">{hotel.checkInDate}</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaMoon className="me-1" />
                                    <strong> Nights</strong>
                                    <div className=" mt-1 fw-semibold">{hotel.nights}</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaCalendarAlt className="me-1" />
                                    <strong> Check-out</strong>
                                    <div className="text-dark fw-semibold">{hotel.checkOutDate}</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaBed className="me-1" />
                                    <strong> Rooms & Guests</strong>
                                    <div className="fw-semibold mt-1">
                                        {hotel.rooms} Room(s), {hotel.guests} Guest(s)
                                    </div>
                                </Col>
                            </Row>

                            <hr className="my-3" />

                            <Row>
                                <Col md={4}>
                                    <span className="text-muted">Room Type</span>
                                    <div className="fw-bold">
                                        {room?.RoomTypeName || "Apartment"}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">No. of Guests</span>
                                    <div className="fw-bold">{room?.Adult || hotel.guests} Adult(s)</div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">Cancellation Policy</span>
                                    <div className="fw-bold text-primary">
                                        {room?.CancellationPolicy || "Free Cancellation"}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Primary Guest Section */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Primary Guest Details</h6>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0 mx-2">Primary Guest Details </h6>
                            <span
                                role="button"
                                title="Edit"
                                onClick={() =>
                                    navigate("/guest-details", {
                                        state: { hotel, room, roomDetails, guestInputs, email, mobile },
                                    })
                                }
                            >
                                <FaEdit className="text-danger cursor-pointer" />
                            </span>
                        </div>

                    </div>

                    <div className="border rounded p-3">
                        <Row className="fw-bold border-bottom pb-2 mb-2 text-muted small">
                            <Col md={4}>E-mail</Col>
                            <Col md={4}>Contact No.</Col>
                            <Col md={4}>Guest Details</Col>
                        </Row>

                        <Row className="mb-2">
                            <Col md={4}>{email}</Col>
                            <Col md={4}>+91 {mobile}</Col>
                            <Col md={4}>
                                {guestInputs?.map((room, roomIndex) => (
                                    <div key={roomIndex}>
                                        {room.adults.map((guest, i) => (
                                            <div key={`adult-${roomIndex}-${i}`}>
                                                {guest.title} {guest.firstName} {guest.lastName}
                                            </div>
                                        ))}
                                        {room.children.map((guest, i) => (
                                            <div key={`child-${roomIndex}-${i}`}>
                                                {guest.title} {guest.firstName} {guest.lastName}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </Col>

                        </Row>
                    </div>
                </Card.Body>
            </Card>

            {/* Terms & Continue */}
            <div className="mb-3">
                <Form.Check
                    type="checkbox"
                    label={
                        <>
                            I have read and accept the{" "}
                            <a href="/terms-and-conditions" className="text-danger text-decoration-none ">
                                Terms & Conditions
                            </a>
                            .
                        </>
                    }
                    defaultChecked
                />
            </div>

            <div className="text-start">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Payment
                </Button>
            </div>
        </div>
    );
};

export default HotelReviewInfo;
