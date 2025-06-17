import React from 'react';
import { Card, Row, Col, Form, Container } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';

const RoundTripCard = () => {
    return (
        <Container>
            <Row>
                {/* Air India Card - Left */}
                <Col md={6}>
                    <Card className="shadow-sm p-3 mb-4 round-trip-card">
                        <Row>
                            <Col md={12}>
                                <Row className="align-items-center">
                                    <Col md={2} className="text-center">
                                        {/* <img src='' /> */}
                                        <div className="fw-bold mt-1">Air India</div>
                                        <div className="text-muted small">AI-441</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">DEL</div>
                                        <div className="fw-semibold">17:15</div>
                                        <div className="text-muted small">14 Jun</div>
                                    </Col>

                                    <Col md={4} className="text-center">
                                        <div className="text-muted">Non Stop(s)</div>
                                        <div className="my-1">
                                            <span className="dot"></span>
                                            <span className="line"></span>
                                            <span className="dot"></span>
                                        </div>
                                        <div>2 h 50 m</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">BOM</div>
                                        <div className="fw-semibold">20:05</div>
                                        <div className="text-muted small">14 Jun</div>
                                    </Col>
                                </Row>

                                <div className="mt-3 text-danger">Seats left: 9</div>
                                <div className="text-muted">Airline Remark :</div>

                                <div className="fare-options mt-2">
                                    {[
                                        { price: '₹ 8134', label: 'Eco Value', refundable: true },
                                        { price: '₹ 8191', label: 'SME', refundable: true },
                                        { price: '₹ 8664', label: 'Eco Classic', refundable: true, selected: true },
                                    ].map((fare, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                            <Form.Check
                                                type="radio"
                                                name="fare1"
                                                defaultChecked={fare.selected}
                                                className="me-2"
                                            />
                                            <div className="me-auto">
                                                <span className="fw-semibold">{fare.price}</span>{' '}
                                                <span className="badge bg-label">{fare.label}</span>
                                                <div className="text-muted small">Economy, <span className="text-success">Refundable</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Col>

                            {/* <Col md={3} className="d-flex align-items-end justify-content-end">
                                <Button variant="danger" className="rounded-pill px-3 mt-auto">
                                    View Details +
                                </Button>
                            </Col> */}
                        </Row>
                    </Card>
                </Col>

                {/* SpiceJet Card - Right */}
                <Col md={6}>
                    <Card className="shadow-sm p-3 mb-4 round-trip-card">
                        <Row>
                            <Col md={12}>
                                <Row className="align-items-center">
                                    <Col md={2} className="text-center">
                                         {/* <img src="" /> */}
                                        <div className="fw-bold mt-1">Spicejet</div>
                                        <div className="text-muted small">SG-710</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">BOM</div>
                                        <div className="fw-semibold">15 Jun</div>
                                        <div className="text-muted small">23:00</div>
                                    </Col>

                                    <Col md={4} className="text-center">
                                        <div className="text-muted">Non Stop(s)</div>
                                        <div className="my-1">
                                            <span className="dot"></span>
                                            <span className="line"></span>
                                            <span className="dot"></span>
                                        </div>
                                        <div>1 h 55 m</div>
                                    </Col>

                                    <Col md={3} className="text-center">
                                        <div className="fw-bold fs-5">DEL</div>
                                        <div className="fw-semibold">16 Jun</div>
                                        <div className="text-muted small">00:55</div>
                                    </Col>
                                </Row>

                                <div className="mt-3 d-flex align-items-center text-muted">
                                    <span className="me-2">✈️ Flight Arrives after 1 Day(s)</span>
                                    <span className="text-danger">Seats left: 1</span>
                                </div>
                                <div className="text-muted">Airline Remark :</div>

                                <div className="fare-options mt-2">
                                    {[
                                        { price: '₹ 4784', label: 'OFFER_FARE_WITH_PNR', refundable: false, selected: true },
                                        { price: '₹ 5988', label: 'COUPON', refundable: true },
                                        { price: '₹ 6163', label: 'CORPORATE_FARE', refundable: true },
                                    ].map((fare, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                            <Form.Check
                                                type="radio"
                                                name="fare2"
                                                defaultChecked={fare.selected}
                                                className="me-2"
                                            />
                                            <div className="me-auto">
                                                <span className="fw-semibold">{fare.price}</span>{' '}
                                                <span className="badge bg-label">{fare.label}</span>
                                                <div className="text-muted small">
                                                    Economy, <span className={fare.refundable ? "text-success" : "text-secondary"}>{fare.refundable ? "Refundable" : "Non Refundable"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Col>

                            {/* <Col md={3} className="d-flex align-items-end justify-content-end">
                                <Button variant="primary" className="rounded-pill px-3  w-25 mt-auto">
                                    View Details +
                                </Button>
                            </Col> */}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RoundTripCard;
