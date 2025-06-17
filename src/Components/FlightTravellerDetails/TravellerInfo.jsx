import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TravellerInfo = () => {

    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/addons');
    };
    return (
        <div>

            <div className="container my-4">
                {/* Traveller Details Section */}
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Body>
                        <h5 className="fw-bold mb-2">Traveller Details</h5>
                        <p className="text-muted small">
                            Please make sure you enter the Name as per your Government photo id.
                        </p>

                        <div className="mb-2 fw-bold">Adult X 1</div>

                        <Row className="mb-3">
                            <Col lg={2} className="fw-bold pt-2">Adult1</Col>
                            <Col lg={2}>
                                <Form.Select>
                                    <option>Title</option>
                                    <option>Mr</option>
                                    <option>Ms</option>
                                </Form.Select>
                            </Col>
                            <Col lg={3}>
                                <Form.Control type="text" placeholder="First Name" />
                            </Col>
                            <Col lg={3}>
                                <Form.Control type="text" placeholder="Last Name" />
                            </Col>
                            <Col lg={2}>
                                <Form.Control type="text" placeholder="DOB" disabled />
                            </Col>
                        </Row>

                        <div>
                            <a href="#!" className="text-primary fw-bold small">Add Frequent Flyer Number</a>
                        </div>
                    </Card.Body>
                </Card>

                {/* Contact Details Section */}
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Body>
                        <h6 className="fw-bold mb-2 text-danger">
                            <FaEnvelope className="me-2 text-danger" />
                            Your ticket and flight details will be shared here
                        </h6>

                        <hr />

                        <Row>
                            <Col lg={3}>
                                <Form.Select>
                                    <option>India (91)</option>
                                    {/* Add other countries if needed */}
                                </Form.Select>
                            </Col>
                            <Col lg={4}>
                                <Form.Control type="text" placeholder="Mobile Number" />
                            </Col>
                            <Col lg={5}>
                                <Form.Control type="email" placeholder="Email" />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* GST Section */}
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col lg={9}>
                                <h6 className="fw-bold mb-1">Use GSTIN for this booking (Optional)</h6>
                                <p className="small text-muted mb-0">
                                    Claim credit of GST charges. Your taxes may get updated post submitting your GST details.
                                </p>
                            </Col>
                            <Col lg={3} className="text-end">
                                <Button variant="" className="px-4 btn-red">Add</Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Continue Button */}
                <div className="text-start">
                    <Button variant="primary" className="btn-red" onClick={handleContinue}>
                        Continue Booking
                    </Button>
                </div>
            </div>

        </div>
    )
}

export default TravellerInfo