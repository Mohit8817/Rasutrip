import React from 'react';
import { Card, Table, Row, Col, Button, Form } from 'react-bootstrap';
import { FaCity, FaClock, FaEdit, FaWheelchair } from 'react-icons/fa';
// import { MdLocationOn } from 'react-icons/md';

const BusReviewInfo = () => {
    return (
        <div className="p-3">
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <div className="d-flex align-items-center mb-2">
                                <FaCity className="me-2" />
                                <strong>Bangalore</strong>
                            </div>
                            <div className="fs-4 fw-bold">21:15</div>
                            <div>Fri, 20 Jun 25</div>
                            <hr />
                            <div>
                                <strong>Operator</strong><br />
                                Avm Tours And Travels
                            </div>
                        </Col>

                        <Col md={2} className="text-center d-flex flex-column justify-content-center align-items-center">
                            <FaClock className="mb-1" />
                            <div className="fw-bold">10h 35m</div>
                            <div className="text-danger mt-3">
                                <FaWheelchair /> Seat no(s)<br />
                                <strong>23</strong>
                            </div>
                        </Col>

                        <Col md={5} className="text-end">
                            <div className="d-flex justify-content-end align-items-center mb-2">
                                <FaCity className="me-2" />
                                <strong>Hyderabad</strong>
                            </div>
                            <div className="fs-4 fw-bold">07:50</div>
                            <div>Sat, 21 Jun 25</div>
                            <hr />
                            <div className="text-end">
                                <strong>Boarding Point & Time</strong><br />
                                <span className="text-primary fw-bold">
                                    Kalasipalyam (KR Market) / 19:25
                                </span>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mb-3 shadow-sm">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <strong>Traveller Details</strong>
                    <FaEdit style={{ cursor: 'pointer' }} />
                </Card.Header>
                <Card.Body>
                    <Table bordered responsive>
                        <thead>
                            <tr>
                                <th>E-mail</th>
                                <th>Contact No.</th>
                                <th>Passenger Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>mm@gmail.com</td>
                                <td>91 958556985</td>
                                <td>Ram Kumar (Seat: 23, Age: 55)</td>
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Form className="mb-3">
                <Form.Check
                    type="checkbox"
                    id="terms-checkbox"
                    label={
                        <>
                            I have read and accept the <a href="/">Terms & Conditions</a>.
                        </>
                    }
                    defaultChecked
                />
            </Form>

            <Button variant="primary" className="w-auto btn-red" >
                Continue Payment
            </Button>
        </div>
    );
};

export default BusReviewInfo;
