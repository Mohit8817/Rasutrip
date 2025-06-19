import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import "../../../Style/Pagescss/BusResultPage.css";

const BusDetailsCard = ({ bus }) => {
    return (
        <Card className="bus-card shadow-sm mb-3 border-0">
            <Row className="g-0">
                {/* Left White Section */}
                <Col md={10}>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <h6 className="fw-bold">{bus.operator}</h6>
                                <div>{bus.busType}</div>
                            </Col>
                            <Col md={2} className="text-center">
                                <div className="fw-bold">{bus.departDate}</div>
                                <div className="fs-4 fw-semibold">{bus.departTime}</div>
                                <div>{bus.departLocation}</div>
                            </Col>
                            <Col md={2} className="text-center align-self-center">
                                <div className="duration-box">{bus.duration}</div>
                            </Col>
                            <Col md={4} className="text-center">
                                <div className="fw-bold">{bus.arriveDate}</div>
                                <div className="fs-4 fw-semibold">{bus.arriveTime}</div>
                                <div>{bus.arriveLocation}</div>
                            </Col>
                        </Row>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between align-items-center px-1">
                            <div className="text-muted">Cancellation Policy <i className="bi bi-chevron-down ms-1" /></div>
                            <small className="text-danger fw-semibold"><i className="bi bi-chair me-1" /> {bus.seatsAvailable} Seats Available</small>
                        </div>
                    </Card.Body>
                </Col>

                {/* Right Grey Section */}
                <Col md={2} className="price-panel d-flex flex-column p-3">
                    <div className="text-center">
                        <div className="text-muted small">Starting at</div>
                        <div className="fs-5 fw-bold">{bus.price}</div>
                        <Button className="btn-red mt-2">Show Seats</Button>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default BusDetailsCard;
