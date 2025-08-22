import React, { useState } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import BusSeatSelect from "./BusSeatSelect";
import { FaWheelchair } from "react-icons/fa";

const BusDetailsCard = ({ bus }) => {
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);

    return (
        <Card className="mb-3 border-0 shadow-sm rounded-lg">
            <Row className="g-0 flex flex-col lg:flex-row">
                {/* Left Section */}
                <Col lg={10} className="p-3">
                    <Card.Body className="p-2">
                        {/* Top Row Layout */}
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            {/* Operator & Type */}
                            <div className="w-full lg:w-1/4">
                                <h6 className="fw-bold">{bus.operator}</h6>
                                <div>{bus.busType}</div>
                                {bus.serviceName && (
                                    <div className="text-muted text-sm mt-1 flex items-center">
                                        <i className="bi bi-truck me-1" />
                                        {bus.serviceName}
                                    </div>
                                )}
                            </div>

                            {/* Departure + Arrival Info (same row in mobile) */}
                            <div className="w-full lg:w-2/4 flex flex-row justify-between gap-6">
                                {/* Departure */}
                                <div className="text-left">
                                    <div className="fw-semibold text-sm">{bus.departDate}</div>
                                    <div className="text-lg fw-bold">{bus.departTime}</div>
                                    <div className="text-gray-700">{bus.departLocation}</div>
                                </div>

                                {/* Arrival */}
                                <div className="text-right">
                                    <div className="fw-semibold text-sm">{bus.arriveDate}</div>
                                    <div className="text-lg fw-bold">{bus.arriveTime}</div>
                                    <div className="text-gray-700">{bus.arriveLocation}</div>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="w-full lg:w-1/4 text-center">
                                <div className="inline-block px-3 py-1 border rounded-full text-sm font-medium">
                                    {bus.duration}
                                </div>
                            </div>
                        </div>


                        <hr className="my-2" />

                        {/* Cancellation Policy Toggle */}
                        <div
                            className="d-flex justify-content-between items-center cursor-pointer"
                            onClick={() => setShowPolicy(!showPolicy)}
                        >
                            <div className="text-red-600 fw-semibold">
                                Cancellation Policy{" "}
                                <i
                                    className={`bi ${showPolicy ? "bi-chevron-up" : "bi-chevron-down"
                                        } ms-1`}
                                />
                            </div>
                            <small className="text-red-600 fw-semibold flex items-center">
                                <FaWheelchair className="me-1" /> {bus.seatsAvailable} Seats Available
                            </small>
                        </div>

                        {/* Cancellation Policy Box */}
                        {showPolicy && bus.cancellationPolicies && (
                            <div className="mt-3 p-3 border rounded bg-gray-50">
                                <h6 className="text-center text-purple-700 fw-bold mb-3">
                                    {bus.departLocation} - {bus.arriveLocation} ({bus.departDate})
                                </h6>
                                <div className="overflow-x-auto">
                                    <table className="table table-bordered table-sm w-full">
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

                {/* Right Section: Price */}
                <Col
                    lg={2}
                    className="bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 flex items-center justify-center p-3"
                >
                    <div className="text-center w-full">
                        <div className="text-muted text-sm">Starting From</div>
                        <div className="fs-5 fw-bold">{bus.price}</div>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white mt-2 w-full lg:w-auto btn-red"
                            variant="danger"
                            onClick={() => setShowSeatModal(true)}
                        >
                            Show Seat
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Seat Modal */}
            <BusSeatSelect
                show={showSeatModal}
                onHide={() => setShowSeatModal(false)}
                bus={bus}
            />
        </Card>
    );
};

export default BusDetailsCard;
