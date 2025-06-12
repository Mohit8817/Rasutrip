import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import '../../../Style/Pagescss/FlightResultsPage.css';

import icon from '../../../assest/indigo_icon.png'; // Adjust the path as necessary

const FlightCard = ({ flight }) => {
    if (!flight) return null; 

    return (
        <Card className="flight-card mb-3">
            <Card.Body>
                <Row className="align-items-center text-center">
                    <Col md={2}>
                        <div className="airline-logo mb-1">
                            <img
                                src={icon}
                                alt={flight?.airline || 'Airline'}
                                width="30"
                            />
                        </div>
                        <div className="fw-semibold">{flight?.airline || 'Unknown Airline'}</div>
                        <div className="text-muted small">{flight?.flightNumber || 'N/A'}</div>
                        <div className="seats-left text-warning mt-2">
                            Seats left: {flight?.seatsLeft ?? 'N/A'}
                        </div>
                    </Col>

                    <Col md={2}>
                        <div className="fw-bold">{flight?.departTime || '--:--'}</div>
                        <div className="text-muted small">{flight?.departDate || 'N/A'}</div>
                    </Col>

                    <Col md={2}>
                        <div className="text-muted small">{flight?.stop || 'Non-stop'}</div>
                        <div className="fw-medium">{flight?.duration || 'N/A'}</div>
                    </Col>

                    <Col md={2}>
                        <div className="fw-bold">{flight?.arriveTime || '--:--'}</div>
                        <div className="text-muted small">{flight?.arriveDate || 'N/A'}</div>
                    </Col>

                    <Col md={2}>
                        <div className="fw-bold text-dark">₹ {flight?.price ?? '0'}</div>
                        {flight?.tag && (
                            <span className="badge bg-light text-dark me-1">{flight.tag}</span>
                        )}
                        <div className="text-muted small">
                            {flight?.classType || 'Any'}, <span className="text-success">{flight?.refund || ''}</span>
                        </div>
                    </Col>

                    <Col md={2}>
                        <Button variant="primary" className="w-100 mb-2">
                            {flight?.action || 'Book'}
                        </Button>
                        <div className="text-primary flight-details-toggle">Flight Details +</div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default FlightCard;
