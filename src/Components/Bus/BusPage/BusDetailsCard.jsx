import React, { useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import BusSeatSelect from './BusSeatSelect';
import { FaWheelchair } from "react-icons/fa";
import "../../../Style/Pagescss/BusResultPage.css";

const BusDetailsCard = ({ bus, DestinationId, OriginId, UserIp, price }) => {
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);
    // console.log(bus.resultIndex, "result ")
    // console.log(bus.DestinationId, "ttttttttt")
    // console.log(bus.OriginId, "dddddddd")
    // console.log(bus.UserIp, "USERIp")
    // console.log(bus.price, "bussssssssp")
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
                                {bus.serviceName && (
                                    <div className="text-muted small mt-1">
                                        <i className="bi bi-truck me-1" />
                                        {bus.serviceName}
                                    </div>
                                )}
                            </Col>

                            <Col md={2} className="text-start">
                                <div className="fw-semibold fs-6">{bus.departDate}</div>
                                <div className="fs-5 fw-bold">{bus.departTime}</div>
                                <div>{bus.departLocation}</div>
                            </Col>

                            {/* Duration Info */}
                            <Col md={4} className="text-center align-self-center">
                                <div className="duration-box">{bus.duration}</div>
                            </Col>

                            {/* Arrival Info */}
                            <Col md={2} className="text-end">
                                <div className="fw-semibold fs-6">{bus.arriveDate}</div>
                                <div className="fs-5 fw-bold">{bus.arriveTime}</div>
                                <div>{bus.arriveLocation}</div>
                            </Col>
                        </Row>

                        <hr className="my-2" />

                        {/* Cancellation Policy Toggle */}
                        <div
                            className="d-flex justify-content-between align-items-center px-1 cursor-pointer"
                            onClick={() => setShowPolicy(!showPolicy)}
                        >
                            <div className="text-danger fw-semibold">
                                Cancellation Policy{" "}
                                <i className={`bi ${showPolicy ? "bi-chevron-up" : "bi-chevron-down"} ms-1`} />
                            </div>
                            <small className="text-danger fw-semibold d-flex align-items-center">
                                <FaWheelchair className="me-1" /> {bus.seatsAvailable} Seats Available
                            </small>
                        </div>

                        {/* Cancellation Policy Box */}
                        {showPolicy && bus.cancellationPolicies && (
                            <div className="cancellation-box mt-3 p-3 border rounded bg-light">
                                <h6 className="text-center text-purple fw-bold mb-3">
                                    {bus.departLocation} - {bus.arriveLocation} ({bus.departDate})
                                </h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Cancellation Time</th>
                                                <th>Cancellation Charges</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bus.cancellationPolicies.length > 0 ? (
                                                bus.cancellationPolicies.map((policy, index) => (
                                                    <tr key={index}>
                                                        <td>{policy.PolicyString}</td>
                                                        <td>
                                                            {policy.CancellationCharge}
                                                            {policy.CancellationChargeType === 2 ? "%" : " ₹"}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center text-muted">
                                                        No cancellation policy available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Col>

                {/* Right Grey Section: Price & Show Seats */}
                <Col md={2} className="price-panel d-flex flex-column p-3">
                    <div className="text-center">
                        <div className="text-muted small">Starting at</div>
                        <div className="fs-5 fw-bold">{bus.price}</div>
                        <Button className="btn-red mt-2" onClick={() => setShowSeatModal(true)}>
                            Show Seats
                        </Button>
                    </div>
                </Col>

                {/* Seat Modal */}
                <BusSeatSelect
                    show={showSeatModal}
                    onHide={() => setShowSeatModal(false)}
                    bus={bus}
                />
            </Row>
        </Card>
    );
};

export default BusDetailsCard;
