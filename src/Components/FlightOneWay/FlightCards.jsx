import React, { useState } from 'react';
import { Card, Button, Row, Col, Tab, Nav } from 'react-bootstrap';
import FarePopup from './Farepopup'; // import modal component
import '../../Style/Pagescss/FlightResultsPage.css';

const FlightCard = ({ flight }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('flight');
    const [showFarePopup, setShowFarePopup] = useState(false);

    const segment = flight?.Segments[0][0];
    const formatTime = (dateTimeStr) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeStr).toLocaleTimeString([], options);
    };  

    const formatDate = (dateTimeStr) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateTimeStr).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <Card className="flight-card mb-3 w-full">
                <Card.Body>
                    <Row className="align-items-center text-center">
                        <Col md={2}>
                            <div className="fw-semibold">{segment.Airline.AirlineName}</div>
                            <div className="text-muted small">{segment.Airline.FlightNumber}</div>
                            <div className="seats-left text-warning mt-2">
                                Seats left: {flight.seatsLeft || 'N/A'}
                            </div>
                        </Col>

                        <Col md={2}>
                            <div className="text-uppercase text-muted mt-1">{segment.Origin.CityName}</div>
                            <div className="fw-bold">{formatTime(segment.Origin.DepartTime)}</div>
                            <div className="text-muted small">{formatDate(segment.Origin.DepartTime)}</div>
                        </Col>

                        <Col md={2}>
                            <div className="text-muted small">Non Stop(s)</div>
                            <div className="fw-medium">{Math.floor(segment.Duration / 60)}h {segment.Duration % 60}m</div>
                        </Col>

                        <Col md={2}>
                            <div className="text-uppercase text-muted mt-1">{segment.Destination.CityName}</div>
                            <div className="fw-bold">{formatTime(segment.Destination.ArrivalTime)}</div>
                            <div className="text-muted small">{formatDate(segment.Destination.ArrivalTime)}</div>
                        </Col>

                        <Col md={2}>
                            <div className="fw-bold text-dark">₹ {flight.MinPublishedPrice}</div>
                            {flight.tag && (
                                <span className="badge bg-light text-dark">{flight.tag}</span>
                            )}
                            <div className="text-muted small">
                                {flight.classType || 'Economy'}, {flight.refund || 'Refundable'}
                            </div>
                        </Col>

                        <Col md={2}>
                            <Button
                                variant="danger"
                                className="w-100 card-button"
                                onClick={() => setShowFarePopup(true)}
                            >
                                View Details
                            </Button>
                            <div
                                className="flight-details-toggle mt-2 cursor-pointer"
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
                                    <Nav.Item><Nav.Link eventKey="flight">Flight Details</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="rules">Fare Rules</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="baggage">Baggage</Nav.Link></Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    <Tab.Pane eventKey="flight">
                                        <div className="p-3">
                                            <strong>{segment.Origin.CityName} → {segment.Destination.CityName}</strong>
                                            &nbsp; <span>{formatDate(segment.Origin.DepartTime)}</span>
                                            <Row className="mt-3">
                                                <Col md={6}>
                                                    <div>{segment.Airline.FlightNumber}</div>
                                                    <div>{segment.Origin.AirportName}, Terminal {segment.Origin.Terminal}</div>
                                                    <div>{formatTime(segment.Origin.DepartTime)}</div>
                                                </Col>
                                                <Col md={6}>
                                                    <div>{segment.Destination.AirportName}, Terminal {segment.Destination.Terminal}</div>
                                                    <div>{formatTime(segment.Destination.ArrivalTime)}</div>
                                                </Col>
                                            </Row>
                                            <p className="mt-3">
                                                Duration: {Math.floor(segment.Duration / 60)}h {segment.Duration % 60}m, {flight.classType}, {flight.seatsLeft || 'N/A'} seats left
                                            </p>
                                        </div>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="rules">
                                        <div className="p-3">
                                            <h6>Fare Rules</h6>
                                            <p>Cancellation Fee: ₹{Math.round(flight.price * 0.4)}</p>
                                            <p>Date Change: ₹{Math.round(flight.price * 0.3)} + Fare Difference</p>
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

            {/* Fare Popup Modal */}
            <FarePopup
                show={showFarePopup}
                onClose={() => setShowFarePopup(false)}
                fares={flight || []}
            />
        </>
    );
};

export default FlightCard;
