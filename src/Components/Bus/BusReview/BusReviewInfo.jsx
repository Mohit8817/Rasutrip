import React from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import { FaCity, FaClock, FaEdit, FaWheelchair } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const BusReviewInfo = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

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
    } = state || {};

    const handlePayment = () => {
        alert("Redirecting to payment gateway...");
    };

    const handleEdit = () => {
        navigate("/bus-traveller-details", { state });
    };

    if (!state) {
        return (
            <div className="p-3">
                <h5 className="text-danger">No booking data found. Please complete previous steps.</h5>
                <Button variant="secondary" onClick={() => navigate("/")}>Go to Home</Button>
            </div>
        );
    }

    return (
        <div className="p-4" style={{ backgroundColor: "#f7f9fc" }}>
            {/* Route Info */}
            <Card className="mb-4 p-3" style={{ borderRadius: "10px" }}>
                <Row>
                    {/* Departure */}
                    <Col md={5}>
                        <div className="d-flex align-items-center mb-2">
                            <FaCity className="me-2" />
                            <strong>{fromCity}</strong>
                        </div>
                        <h5 className="fw-bold">{departTime}</h5>
                        <div>{new Date(departDate).toDateString()}</div>
                        <hr />
                        <div>
                            <div className="text-muted">Operator</div>
                            <strong>{bus?.operator}</strong>
                        </div>
                    </Col>

                    {/* Duration + Seats */}
                    <Col md={2} className="text-center d-flex flex-column justify-content-center align-items-center">
                        <FaClock className="mb-1" />
                        <div className="fw-bold">{bus?.duration || '--h --m'}</div>
                        <div className="mt-3">
                            <div className="text-muted">Seat no(s)</div>

                            <div className="text-danger d-flex align-items-center gap-2 flex-wrap">
                                <FaWheelchair />
                                <span>{selectedSeats?.map(s => s.SeatName).join(", ")}</span>
                            </div>
                        </div>
                    </Col>

                    {/* Arrival */}
                    <Col md={5} className="text-end">
                        <div className="d-flex justify-content-end align-items-center mb-2">
                            <FaCity className="me-2" />
                            <strong>{toCity}</strong>
                        </div>
                        <h5 className="fw-bold">{arriveTime}</h5>
                        <div>Fri, 01 Aug 25</div>
                        <hr />
                        <div className="text-muted">Boarding Point & Time</div>
                        <strong>{boarding?.CityPointName} / {boarding?.DepTime}</strong>
                    </Col>
                </Row>
            </Card>

            {/* Traveller Info */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Traveller Details</h5>
                <FaEdit style={{ cursor: "pointer" }} onClick={handleEdit} className='text-danger' />
            </div>
            <Card className="mb-4" style={{ borderRadius: "10px" }}>
                <Row className="p-3">
                    <Col md={4}>
                        <div className="fw-bold">E-mail</div>
                        <div>{contactData?.email}</div>
                    </Col>
                    <Col md={4}>
                        <div className="fw-bold">Contact No.</div>
                        <div>{contactData?.mobile}</div>
                    </Col>
                    <Col md={4}>
                        <div className="fw-bold">Passenger Details</div>
                        <div>
                            {passengerData?.map((p, i) => (
                                <div key={i}>
                                    {p.firstName} {p.lastName} (Seat: {selectedSeats?.[i]?.SeatName}, Age: {p.age})
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Terms and Payment */}
            <Card className="p-3 border-0">
                <Form.Check
                    type="checkbox"
                    id="terms"
                    className="mb-3"
                    label={<>I have read and accept the <a href="/">Terms & Conditions</a>.</>}
                    defaultChecked
                />

                {/* <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">Total Amount</div>
                    <div className="fs-4 fw-bold text-success">₹ {totalPrice?.toFixed(2)}</div>
                </div> */}

                <div className=" mt-3">
                    <Button className="btn-red" size="lg" onClick={handlePayment}>
                        Continue Payment
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default BusReviewInfo;
