import React, { useState, useContext } from "react";
import { Card, Row, Col, Button, Modal } from "react-bootstrap";
import BusSeatSelect from "./BusSeatSelect";
import { FaWheelchair, FaLock } from "react-icons/fa";
import { AuthContext } from "../../Context/AuthContext"; // Adjust the import path as needed

const BusDetailsCard = ({ bus }) => {
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Get authentication state from context
    const { isLoggedIn, isCustomer, isAgent, getUserDisplayName } = useContext(AuthContext);

    // Handle seat selection click
    const handleShowSeat = () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }

        // If logged in, show seat selection
        setShowSeatModal(true);
    };

    // Handle login prompt close
    const handleLoginPromptClose = () => {
        setShowLoginPrompt(false);
    };

    // Handle redirect to login
    const handleLoginRedirect = () => {
        setShowLoginPrompt(false);

        window.location.href = '/login/customer';
    };

    return (
        <>
            <Card className="mb-3 border-0 shadow-sm rounded-lg">
                <Row className="g-0 flex flex-col lg:flex-row">
                    {/* Left Section */}
                    <Col lg={10} className="p-3">
                        <Card.Body className="p-2">
                            <Row className="items-center">
                                {/* Operator & Type */}
                                <Col xs={12} sm={6} md={4} className="mb-3 md:mb-0">
                                    <h6 className="fw-bold">{bus.operator}</h6>
                                    <div>{bus.busType}</div>
                                    {bus.serviceName && (
                                        <div className="text-muted small mt-1">
                                            <i className="bi bi-truck me-1" />
                                            {bus.serviceName}
                                        </div>
                                    )}
                                </Col>

                                {/* Departure Info */}
                                <Col xs={6} md={2} className="text-start mb-3 md:mb-0">
                                    <div className="fw-semibold fs-6">{bus.departDate}</div>
                                    <div className="fs-5 fw-bold">{bus.departTime}</div>
                                    <div>{bus.departLocation}</div>
                                </Col>

                                {/* Duration */}
                                <Col xs={12} md={4} className="text-center mb-3 md:mb-0">
                                    <div className="inline-block px-3 py-1 border rounded-full text-sm font-medium">
                                        {bus.duration}
                                    </div>
                                </Col>

                                {/* Arrival Info */}
                                <Col xs={6} md={2} className="text-end mb-3 md:mb-0">
                                    <div className="fw-semibold fs-6">{bus.arriveDate}</div>
                                    <div className="fs-5 fw-bold">{bus.arriveTime}</div>
                                    <div>{bus.arriveLocation}</div>
                                </Col>
                            </Row>

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
                                onClick={handleShowSeat}
                            >
                                Show Seat
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Login Prompt Modal */}
            <Modal
                show={showLoginPrompt}
                onHide={handleLoginPromptClose}
                centered
                size="md"
            >
                <Modal.Body className="text-center p-5 100">
                    <div className="mb-3">

                        <h5 className="fw-bold red">Login Required</h5>
                    </div>
                    <p className="text-muted mb-4">
                        Please login first to continue with seat selection and booking.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button
                            variant="outline-danger"
                            onClick={handleLoginPromptClose}
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleLoginRedirect}
                            size="sm"
                            className="px-4 btn-red"
                        >
                            Login Now
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Seat Modal - Only show if user is logged in */}
            {isLoggedIn && (
                <BusSeatSelect
                    show={showSeatModal}
                    onHide={() => setShowSeatModal(false)}
                    bus={bus}
                />
            )}
        </>
    );
};

export default BusDetailsCard;