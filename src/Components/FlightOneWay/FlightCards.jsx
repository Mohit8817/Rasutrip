import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';

const FlightCard = ({ flight }) => {
    return (
        <Card className="flight-card mb-3">
            <Card.Body>
                <Row className="align-items-center text-center">
                    <Col md={2}>
                        <div className=' align-items-center'>
                            {/* <img src={flight.icon}
                            alt={flight.airline}
                            className="airline-logo mb-1"
                            width="30"
                        /> */}
                            <div className="fw-semibold">{flight.airline}</div>
                            <div className="text-muted small">{flight.flightNumber}</div>
                        </div>
                        <div className="seats-left text-warning mt-2">
                            Seats left: {flight.seatsLeft}
                        </div>
                    </Col>

                    <Col md={2}>
                        <div className="text-uppercase  text-muted mt-1">{flight.departCity}</div>
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
                        <Button variant="danger" className="w-100 card-button" onClick={() => alert('Booking flight')}>
                            {flight.action || 'Book'}
                        </Button>
                        <div className="flight-details-toggle">Flight Details +</div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default FlightCard;
