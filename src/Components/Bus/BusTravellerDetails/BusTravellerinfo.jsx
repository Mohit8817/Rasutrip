import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { FaInfoCircle, FaEnvelope } from 'react-icons/fa';

const BusTravellerinfo = () => {
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/bus-Review');
    };

    return (
        <div className="container my-4">
            {/* Traveller Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold">Traveller Details</h5>
                    <p className="text-muted small d-flex align-items-center">
                        <FaInfoCircle className="me-1" /> Please make sure you enter the Name as per your Government photo id.
                    </p>

                    <Card className="border mt-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-3 fw-semibold">
                                <div>Passenger 1</div>
                                <div>Seat 23</div>
                            </div>
                            <Row className="g-2">
                                <Col md={2}>
                                    <Form.Select>
                                        <option>Title</option>
                                        <option>Mr</option>
                                        <option>Ms</option>
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Form.Control type="text" placeholder="First Name" />
                                </Col>
                                <Col md={2}>
                                    <Form.Control type="text" placeholder="Last Name" />
                                </Col>
                                <Col md={2}>
                                    <Form.Control type="number" placeholder="Age" />
                                </Col>
                                <Col md={2}>
                                    <Form.Select>
                                        <option>ID Type</option>
                                        <option>Aadhar</option>
                                        <option>Driving License</option>
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Form.Control type="text" placeholder="ID Number" />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Card>

            {/* Contact Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold">Contact Details</h5>
                    <p className="text-muted small d-flex align-items-center">
                        <FaEnvelope className="me-2 text-danger" />
                        Your ticket and bus information will be sent here.
                    </p>

                    <Row className="g-2">
                        <Col md={3}>
                            <Form.Select>
                                <option>India (91)</option>
                                <option>US (+1)</option>
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Control type="text" placeholder="Mobile Number" />
                        </Col>
                        <Col md={5}>
                            <Form.Control type="email" placeholder="Email" />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* GST Section */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={9}>
                            <h6 className="fw-bold mb-1">Use GSTIN for this booking(Optional)</h6>
                        </Col>
                        <Col md={3} className="text-end">
                            <Button className="btn-red text-white px-4">ADD</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Continue Button */}
            <div className="text-start mt-3">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Booking
                </Button>
            </div>
        </div>
    );
};

export default BusTravellerinfo;
