import React from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';
import { useNavigate } from 'react-router-dom';

const Addoninfo = () => {

    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/review');
    };
    return (
        <div>

            <Card className="mt-3">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <strong>Add Baggage, Meal to Your Travel</strong>
                    <span style={{ cursor: 'pointer', fontSize: '1.2rem' }}>⌃</span>
                </Card.Header>
                <Card.Body>
                    <p className="fw-bold mb-1">ONWARD</p>
                    <hr />
                    <p className="fw-semibold">Adult 1</p>

                    <Row>
                        {/* Meal Section */}
                        <Col md={6}>
                            <h5 className="fw-bold">Meal</h5>
                            <p className="mb-1">BOM → DEL</p>
                            <Form.Select className="mb-2">
                                <option>Vegetable in Red Thai Curry</option>
                                <option>Paneer Butter Masala</option>
                                <option>Chicken Biryani</option>
                            </Form.Select>
                            <p className="mb-1">Meal Quantity : 1 Platter Meal</p>
                            <p>Charges : Rs. 645</p>
                        </Col>

                        {/* Baggage Section */}
                        <Col md={6}>
                            <h5 className="fw-bold">Baggage</h5>
                            <p className="mb-1">BOM → DEL</p>
                            <Form.Select className="mb-2">
                                <option>10 Kg Rs. 6450</option>
                                <option>15 Kg Rs. 9450</option>
                                <option>20 Kg Rs. 12450</option>
                            </Form.Select>
                            <p className="mb-1">Baggage Weight : 10 Kg Baggage</p>
                            <p>Charges : Rs. 6450</p>
                        </Col>
                    </Row>
                    {/* 
                    <div className="bg-light p-3 mt-3">
                        <button className="btn btn-primary px-4">Departure : BOM-DEL</button>
                    </div> */}
                </Card.Body>

            </Card>
            <div className="text-start">
                <Button variant="primary" className="btn-red mt-3" onClick={handleContinue}>
                    Continue Booking
                </Button>
            </div>
        </div>
    )
}

export default Addoninfo