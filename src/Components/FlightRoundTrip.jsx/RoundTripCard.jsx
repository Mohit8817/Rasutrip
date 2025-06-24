import React from 'react';
import { Card, Row, Col, Form, Container } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';

const RoundTripCard = ({ flight }) => {
    const { Segments, FareList, MinPublishedPrice } = flight
    
    console.log("Dtaaa", Segments, FareList, MinPublishedPrice)


    return (
        <Container className="mb-4">
            <Row>
                {/* Onward Journey Card */}
                <Col md={6}>
                    <Card className="shadow-sm p-3 round-trip-card">
                        <Row>
                            <Col md={12}>
                                <Row className="align-items-center">
                                    <Col md={2} className="text-center">
                                        <div className="fw-bold mt-1">{flight.airlineOnward}</div>
                                        <div className="text-muted small">{flight.flightNumberOnward}</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">{flight.fromCode}</div>
                                        <div className="fw-semibold">{flight.fromTime}</div>
                                        <div className="text-muted small">{flight.fromDate}</div>
                                    </Col>

                                    <Col md={4} className="text-center">
                                        <div className="text-muted">Non Stop(s)</div>
                                        <div className="my-1">
                                            <span className="dot"></span>
                                            <span className="line"></span>
                                            <span className="dot"></span>
                                        </div>
                                        <div>{flight.durationOnward}</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">{flight.toCode}</div>
                                        <div className="fw-semibold">{flight.toTime}</div>
                                        <div className="text-muted small">{flight.toDate}</div>
                                    </Col>
                                </Row>

                                <div className="mt-3 text-danger">Seats left: {flight.seatsLeft}</div>
                                <div className="text-muted">Airline Remark: {flight.airlineRemark}</div>

                                <div className="fare-options mt-2">
                                    {flight?.fareOptions?.map((fare, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                            <Form.Check
                                                type="radio"
                                                name={`fareOnward-${i}`}
                                                defaultChecked={fare.selected}
                                                className="me-2"
                                            />
                                            <div className="me-auto">
                                                <span className="fw-semibold">{fare.price}</span>{' '}
                                                <span className="badge bg-label">{fare.label}</span>
                                                <div className="text-muted small">
                                                    Economy,{' '}
                                                    <span className={fare.refundable ? 'text-success' : 'text-secondary'}>
                                                        {fare.refundable ? 'Refundable' : 'Non Refundable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Return Journey Card */}
                <Col md={6}>
                    <Card className="shadow-sm p-3 round-trip-card">
                        <Row>
                            <Col md={12}>
                                <Row className="align-items-center">
                                    <Col md={2} className="text-center">
                                        <div className="fw-bold mt-1">{flight.airlineReturn}</div>
                                        <div className="text-muted small">{flight.flightNumberReturn}</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">{flight.returnFromCode}</div>
                                        <div className="fw-semibold">{flight.returnFromTime}</div>
                                        <div className="text-muted small">{flight.returnFromDate}</div>
                                    </Col>

                                    <Col md={4} className="text-center">
                                        <div className="text-muted">Non Stop(s)</div>
                                        <div className="my-1">
                                            <span className="dot"></span>
                                            <span className="line"></span>
                                            <span className="dot"></span>
                                        </div>
                                        <div>{flight.durationReturn}</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">{flight.returnToCode}</div>
                                        <div className="fw-semibold">{flight.returnToTime}</div>
                                        <div className="text-muted small">{flight.returnToDate}</div>
                                    </Col>
                                </Row>

                                <div className="mt-3 d-flex align-items-center text-muted">
                                    <span className="text-danger">Seats left: {flight.seatsLeft}</span>
                                </div>
                                <div className="text-muted">Airline Remark: {flight.airlineRemark}</div>

                                <div className="fare-options mt-2">
                                    {flight?.fareOptions?.map((fare, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                            <Form.Check
                                                type="radio"
                                                name={`fareReturn-${i}`}
                                                defaultChecked={fare.selected}
                                                className="me-2"
                                            />
                                            <div className="me-auto">
                                                <span className="fw-semibold">{fare.price}</span>{' '}
                                                <span className="badge bg-label">{fare.label}</span>
                                                <div className="text-muted small">
                                                    Economy,{' '}
                                                    <span className={fare.refundable ? 'text-success' : 'text-secondary'}>
                                                        {fare.refundable ? 'Refundable' : 'Non Refundable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RoundTripCard;
