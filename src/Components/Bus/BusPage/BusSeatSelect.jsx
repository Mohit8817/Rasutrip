import React from 'react';
import { Modal, Button, Row, Col, Form, Card } from 'react-bootstrap';
import "../../../Style/Pagescss/BusResultPage.css";

import { useNavigate } from 'react-router-dom';


const BusSeatSelect = ({ show, onHide, bus }) => {

    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/bus-detail');
    };


    const selectedSeats = [26, 24, 23, 25];
    const fare = 2925.30;

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Body>
                <Row>
                    {/* Seat layout */}
                    <Col md={8} className="seat-layout">
                        <h5>Select Seats</h5>
                        <div className="seat-section">
                            <div className="upper-label">UPPER</div>
                            <div className="seat-row">
                                <span className="seat available" />
                                <span className="seat booked" />
                                <span className="seat ladies" />
                                <span className="seat selected" />
                            </div>

                            <div className="lower-label">LOWER</div>
                            <div className="seat-row">
                                {/* Add as needed */}
                            </div>

                            <div className="legend mt-4">
                                <div><span className="seat available" /> Available seat</div>
                                <div><span className="seat ladies" /> Reserved for ladies</div>
                                <div><span className="seat selected" /> Selected seat</div>
                                <div><span className="seat booked" /> Booked seat</div>
                            </div>
                        </div>

                    </Col>

                    {/* Booking details */}
                    <Col md={4}>
                        <Card className="p-3 shadow-sm mb-3">
                            <h6 className="fw-bold">{bus.operator}</h6>
                            <div className="small text-muted mb-3">
                                {bus.departDate} | {bus.departTime} - {bus.arriveTime} | {bus.busType}
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Choose Boarding Point</Form.Label>
                                <Form.Select>
                                    <option>Select</option>
                                    <option>Kalasipalyam (KR Market)</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Choose Dropping Point</Form.Label>
                                <Form.Select>
                                    <option>Select</option>
                                    <option>Jadcherla</option>
                                </Form.Select>
                            </Form.Group>

                            <div className="mb-2">
                                <strong>Selected Seats No</strong>
                                <div>{selectedSeats.join(',')}</div>
                            </div>

                            <div className="mb-3">
                                <strong>You Pay :</strong>
                                <div className="fs-5 fw-bold">₹ {fare}</div>
                            </div>

                            <div className="text-start">
                                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                                    Continue
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default BusSeatSelect;
