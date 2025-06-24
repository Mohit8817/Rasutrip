import React from 'react';
import { Card, Row, Col, Form, Container } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';
import moment from 'moment';

const RoundTripCard = ({ flight }) => {
    const onwardSegment = flight?.Segments?.[0]?.[0];
    // const returnSegment = flight?.Segments?.[1]?.[0];

    return (
        <Container className="mb-4">
            <Row>
                {/* Onward Flight Card - Left Column */}
                <Col md={12}>
                    <Card className="shadow-sm p-3 round-trip-card">
                        <Row>
                            <Col>
                                <Row className="align-items-center">
                                    <Col md={3} className="text-center">
                                        <div className="fw-bold mt-1">{onwardSegment?.Airline?.AirlineName || 'N/A'}</div>
                                        <div className="text-muted small">{onwardSegment?.Airline?.FlightNumber || 'N/A'}</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">{onwardSegment?.Origin?.AirportCode || 'N/A'}</div>
                                        <div className="fw-semibold">{moment(onwardSegment?.Origin?.DepartTime).format('hh:mm A')}</div>
                                        <div className="text-muted small">{moment(onwardSegment?.Origin?.DepartTime).format('DD MMM YYYY')}</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="text-muted">Non Stop</div>
                                        <div className="my-1">
                                            <span className="dot"></span>
                                            <span className="line"></span>
                                            <span className="dot"></span>
                                        </div>
                                        <div>{onwardSegment?.TotalDuration} mins</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">{onwardSegment?.Destination?.AirportCode || 'N/A'}</div>
                                        <div className="fw-semibold">{moment(onwardSegment?.Destination?.ArrivalTime).format('hh:mm A')}</div>
                                        <div className="text-muted small">{moment(onwardSegment?.Destination?.ArrivalTime).format('DD MMM YYYY')}</div>
                                    </Col>
                                </Row>

                                <small className="text-muted mt-2 d-block">
                                    Airline Remark: {flight?.FareList?.[0]?.AirlineRemark || 'No Remark'}
                                </small>

                                <div className="fare-options mt-2">
                                    <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                        <Form.Check
                                            type="radio"
                                            name={`fareOnward-${flight.id || '0'}`}
                                            defaultChecked
                                            className="me-2"
                                        />
                                        <div className="me-auto">
                                            <span className="fw-semibold">
                                                ₹ {flight?.FareList?.[0]?.PublishedPrice || 'N/A'}
                                            </span>{' '}
                                            <span className="badge bg-label">
                                                {flight?.FareList?.[0]?.FareType || ''}
                                            </span>
                                            <div className="text-muted small">
                                                {flight?.FareList?.[0]?.CabinClass || 'N/A'},{' '}
                                                <span
                                                    className={
                                                        flight?.FareList?.[0]?.IsRefundable
                                                            ? 'text-success'
                                                            : 'text-secondary'
                                                    }
                                                >
                                                    {flight?.FareList?.[0]?.IsRefundable
                                                        ? 'Refundable'
                                                        : 'Non Refundable'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
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
