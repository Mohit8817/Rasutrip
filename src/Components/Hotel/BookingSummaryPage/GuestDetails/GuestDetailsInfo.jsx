import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const GuestDetailsInfo = () => {

     const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/review');
    };
  return (
    <div>
    
     <div className="container my-4">
            {/* Guest Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold">Guest Details</h5>
                    <p className="text-muted small">Please make sure you enter the Name as per your Government photo id.</p>

                    <div className="border rounded p-3">
                        <div className="mb-3 fw-bold">Room 1</div>

                        {/* Adult 1 */}
                        <Row className="align-items-center mb-3">
                            <Col lg={1} className="fw-bold">Adult 1</Col>
                            <Col lg={2}>
                                <Form.Select className="border-danger">
                                    <option>Title</option>
                                    <option>Mr</option>
                                    <option>Ms</option>
                                </Form.Select>
                            </Col>
                            <Col lg={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="First Name"
                                    className="border-danger"
                                />
                            </Col>
                            <Col lg={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    className="border-danger"
                                />
                            </Col>
                        </Row>

                        {/* Adult 2 */}
                        <Row className="align-items-center">
                            <Col lg={1} className="fw-bold">Adult 2</Col>
                            <Col lg={2}>
                                <Form.Select className="border-danger">
                                    <option>Title</option>
                                    <option>Mr</option>
                                    <option>Ms</option>
                                </Form.Select>
                            </Col>
                            <Col lg={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="First Name"
                                    className="border-danger"
                                />
                            </Col>
                            <Col lg={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    className="border-danger"
                                />
                            </Col>
                        </Row>
                    </div>
                </Card.Body>
            </Card>

            {/* Contact Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h6 className="fw-bold mb-3">
                        <FaEnvelope className="me-2 text-danger" />
                        Your ticket and flight details will be shared here
                    </h6>

                    <Row>
                        <Col lg={3}>
                            <Form.Select className="border-danger">
                                <option>India (91)</option>
                                {/* More countries can be added */}
                            </Form.Select>
                        </Col>
                        <Col lg={4}>
                            <Form.Control
                                type="text"
                                placeholder="Mobile Number"
                                className="border-danger"
                            />
                        </Col>
                        <Col lg={5}>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                className="border-danger"
                            />
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
                            <Button variant="primary" className="px-4">Add</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Continue Booking */}
            <div className="text-start">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Booking
                </Button>
            </div>
        </div>
    </div>
  )
}

export default GuestDetailsInfo