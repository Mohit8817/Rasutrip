import React, { useState } from 'react';
import { Card, Button, Row, Col, Tab, Nav } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';

const FlightCard = ({ flight }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('flight');

    return (
        <Card className="flight-card mb-3">
            <Card.Body>
                <Row className="align-items-center text-center">
                    <Col md={2}>
                        <div className='align-items-center'>
                            <div className="fw-semibold">{flight.airline}</div>
                            <div className="text-muted small">{flight.flightNumber}</div>
                        </div>
                        <div className="seats-left text-warning mt-2">
                            Seats left: {flight.seatsLeft}
                        </div>
                    </Col>

                    <Col md={2}>
                        <div className="text-uppercase text-muted mt-1">{flight.departCity}</div>
                        <div className="fw-bold">{flight.departTime}</div>
                        <div className="text-muted small">{flight.departDate}</div>
                    </Col>

                    <Col md={2}>
                        <div className="text-muted small">Non Stop(s)</div>
                        <div className="fw-medium">{flight.duration}</div>
                    </Col>

                    <Col md={2}>
                        <div className="text-uppercase text-muted mt-1">{flight.arriveCity}</div>
                        <div className="fw-bold">{flight.arriveTime}</div>
                        <div className="text-muted small">{flight.arriveDate}</div>
                    </Col>

                    <Col md={2}>
                        <div className="fw-bold text-dark">₹ {flight.price}</div>
                        {flight.tag && (
                            <span className="badge bg-light text-dark">{flight.tag}</span>
                        )}
                        <div className="text-muted small">
                            Business, <span className="text-success">Refundable</span>
                        </div>
                    </Col>

                    <Col md={2}>
                        <Button variant="danger" className="w-100 card-button">
                            {flight.action || 'Book'}
                        </Button>
                        <div
                            className="flight-details-toggle  mt-2 cursor-pointer"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? 'Hide Details -' : 'Flight Details +'}
                        </div>
                    </Col>
                </Row>

                {showDetails && (
                    <div className="flight-tab-box mt-4 border rounded p-3 bg-light-gray">
                        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                            <Nav variant="tabs" className="mb-3">
                                <Nav.Item>
                                    <Nav.Link eventKey="flight">Flight Details</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="fare">Fare Details</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="rules">Fare Rules</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="baggage">Baggage</Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                <Tab.Pane eventKey="flight">
                                    <div className="p-3">
                                        <strong>Delhi → Mumbai</strong> &nbsp; <span>{flight.departDate}</span>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <div>{flight.flightNumber}</div>
                                                <div>Delhi Indira Gandhi Intl, Terminal 3</div>
                                                <div>{flight.departTime}</div>
                                            </Col>
                                            <Col md={6}>
                                                <div>Chhatrapati Shivaji Maharaj Intl, Terminal 2</div>
                                                <div>{flight.arriveTime}</div>
                                            </Col>
                                        </Row>
                                        <p className="mt-3">Duration: {flight.duration}, {flight.classType}, {flight.seatsLeft} seats left</p>
                                    </div>
                                </Tab.Pane>

                                <Tab.Pane eventKey="fare">
                                    <div className="p-3">
                                        <h6>Fare Details</h6>
                                        <p>Base Fare: ₹9293 x 2</p>
                                        <p>Taxes: ₹1318 x 2</p>
                                        <p>Service Charge: ₹1868</p>
                                        <p className="fw-bold">Total: ₹{flight.price}</p>
                                    </div>
                                </Tab.Pane>

                                <Tab.Pane eventKey="rules">
                                    <div className="p-3">
                                        <h6>Fare Rules</h6>
                                        <p>Cancellation Fee: ₹3920 + ₹50</p>
                                        <p>Date Change: ₹2800 + Fare Difference</p>
                                        <p>No Show: Only taxes refunded</p>
                                    </div>
                                </Tab.Pane>

                                <Tab.Pane eventKey="baggage">
                                    <div className="p-3">
                                        <h6>Baggage Allowance</h6>
                                        <p>Check-in: 15 KG</p>
                                        <p>Cabin: 7 KG</p>
                                    </div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default FlightCard;
