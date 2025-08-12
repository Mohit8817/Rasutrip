import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaClock, FaWheelchair, FaCity } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const BusDetailinfo = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const {
        bus,
        selectedSeats,
        totalPrice,
        departTime,
        arriveTime,
        boarding,
        dropping,
        fromCity,
        toCity,
        departDate,
        arriveDate,
        boardingTime,
        droppingTime,
        blockResponse,
        passengerData,
        blockSeatPayload,
        searchPayload,
        seatLayoutPayload,
        boardingPointPayload,
        userIp,
        searchTokenId,
        resultIndex,
        originId,
        destinationId
    } = state || {};

    if (!state) {
        return (
            <div className="container p-3">
                <div className="text-center py-5">
                    <h5 className="text-danger mb-3">No booking data found</h5>
                    <p className="text-muted mb-4">Please select your seats first to continue with the booking process.</p>
                    <Button variant="secondary" onClick={() => navigate("/")}>
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    // Prepare the complete block seat payload structure
    const prepareBlockSeatPayload = () => {
        return {
            UserIp: userIp || "122.161.64.143",
            SearchTokenId: searchTokenId || "e703c52750f2a93d7bb5cc838f7074e225d63112",
            ResultIndex: resultIndex || "TB-1",
            BoardingPointId: boarding?.CityPointId || boarding?.Id || 1,
            DroppingPointId: dropping?.CityPointId || dropping?.Id || 1,
            OriginId: originId || "8463",
            DestinationId: destinationId || "9573",
            Passenger: []
        };
    };

    const handleContinue = () => {
        const completeBlockSeatPayload = prepareBlockSeatPayload();

        // Enhanced data passing with proper boarding/dropping times
        navigate("/bus-traveller-details", {
            state: {
                // Original state
                bus,
                selectedSeats,
                totalPrice,
                departTime,
                arriveTime,
                boarding: {
                    ...boarding,
                    // Ensure boarding time is properly set
                    time: boardingTime || boarding?.DepTime || boarding?.time || departTime,
                    CityPointName: boarding?.CityPointName || boarding?.name || "Boarding Point",
                    CityPointAddress: boarding?.CityPointAddress || boarding?.address || "",
                    CityPointLandmark: boarding?.CityPointLandmark || boarding?.landmark || ""
                },
                dropping: {
                    ...dropping,
                    // Ensure dropping time is properly set
                    time: droppingTime || dropping?.ArrTime || dropping?.time || arriveTime,
                    CityPointName: dropping?.CityPointName || dropping?.name || "Dropping Point",
                    CityPointAddress: dropping?.CityPointAddress || dropping?.address || "",
                    CityPointLandmark: dropping?.CityPointLandmark || dropping?.landmark || ""
                },
                fromCity,
                toCity,
                departDate,
                arriveDate: arriveDate || getArrivalDate(), // Ensure arrival date is calculated
                boardingTime: boardingTime || boarding?.DepTime || boarding?.time || departTime,
                droppingTime: droppingTime || dropping?.ArrTime || dropping?.time || arriveTime,
                blockResponse,
                passengerData,

                // Enhanced journey details for review page
                journeyDetails: {
                    operator: bus?.operator || bus?.TravelName || bus?.name || "N/A",
                    busType: bus?.busType || bus?.BusType || "AC Seater",
                    duration: calculateDuration(departTime, arriveTime),
                    fromCity: fromCity || "N/A",
                    toCity: toCity || "N/A",
                    departDate: departDate,
                    arriveDate: arriveDate || getArrivalDate(),
                    departTime: departTime || "N/A",
                    arriveTime: arriveTime || "N/A"
                },

                // All existing payload parameters
                blockSeatPayload,
                searchPayload,
                seatLayoutPayload,
                boardingPointPayload,
                completeBlockSeatPayload,

                // Individual API parameters for easy access
                userIp: userIp || "122.161.64.143",
                searchTokenId: searchTokenId || "e703c52750f2a93d7bb5cc838f7074e225d63112",
                resultIndex: resultIndex || "TB-1",
                originId: originId || "8463",
                destinationId: destinationId || "9573",

                // Additional derived parameters
                numberOfPassengers: selectedSeats?.length || 0,
                boardingPointId: boarding?.CityPointId || boarding?.Id || 1,
                droppingPointId: dropping?.CityPointId || dropping?.Id || 1,
                seatNames: selectedSeats?.map(seat => seat.SeatName) || [],
                seatPrices: selectedSeats?.map(seat => seat?.Price?.PublishedPrice || seat?.PublishedPrice || 450) || []
            },
        });
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Calculate journey duration
    const calculateDuration = (departTime, arriveTime) => {
        if (!departTime || !arriveTime) return bus?.duration || "-";

        try {
            const dept = new Date(`1970-01-01 ${departTime}`);
            const arr = new Date(`1970-01-01 ${arriveTime}`);

            if (arr < dept) {
                arr.setDate(arr.getDate() + 1); // Next day arrival
            }

            const diffMs = arr - dept;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            return `${hours}h ${minutes}m`;
        } catch (e) {
            return bus?.duration || "-";
        }
    };

    // Function to determine if arrival is next day
    const getArrivalDate = () => {
        // If arriveDate is passed from previous component, use it
        if (arriveDate) {
            return arriveDate;
        }

        // Otherwise, calculate based on times
        if (!departTime || !arriveTime || !departDate) {
            return departDate || "-";
        }

        try {
            const dept = new Date(`1970-01-01 ${departTime}`);
            const arr = new Date(`1970-01-01 ${arriveTime}`);

            // If arrival time is less than departure time, it's next day
            if (arr < dept) {
                const departDateObj = new Date(departDate);
                const arrivalDateObj = new Date(departDateObj);
                arrivalDateObj.setDate(arrivalDateObj.getDate() + 1);
                return arrivalDateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            }

            return departDate;
        } catch (e) {
            return departDate || "-";
        }
    };

    return (
        <div className=" container mt-3">
            {/* Header */}
            <div className="bg-light text-dark px-4 py-3 mb-4 fw-semibold border rounded shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        Review Your Bus Details
                    </h5>
                </div>
            </div>

            {/* Main Card Section */}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    {/* Route and Times Section */}
                    <Row className="mb-4 align-items-center">
                        <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
                            <div className="fw-semibold mb-2 text-muted">
                                <FaCity className="me-2" /> Departure
                            </div>
                            <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.5rem' }}>
                                {departTime || "-"}
                            </div>
                            <div className="fw-semibold text-dark mb-1">
                                {fromCity || "-"}
                            </div>
                            <div className="text-muted small">
                                {formatDate(departDate)}
                            </div>
                        </Col>

                        <Col md={4} className="text-center">
                            <div className="text-muted small mb-2">Journey Duration</div>
                            <div className="fw-bold text-danger mb-2" style={{ fontSize: '1.2rem' }}>
                                {calculateDuration(departTime, arriveTime)}
                            </div>
                            <div className="text-center">
                                <div style={{
                                    height: '2px',
                                    background: 'linear-gradient(to right, #007bff, #28a745)',
                                    margin: '0 20px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '-4px',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#007bff',
                                        borderRadius: '50%'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '-4px',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#28a745',
                                        borderRadius: '50%'
                                    }}></div>
                                </div>
                            </div>
                        </Col>

                        <Col md={4} className="text-center text-md-end">
                            <div className="fw-semibold mb-2 text-muted">
                                <FaCity className="me-2" /> Arrival
                            </div>
                            <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.5rem' }}>
                                {arriveTime || "-"}
                            </div>
                            <div className="fw-semibold text-dark mb-1">
                                {toCity || "-"}
                            </div>
                            <div className="text-muted small">
                                {formatDate(getArrivalDate())}
                            </div>
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    {/* Bus Details Section */}
                    <Row className="mb-4">
                        <Col md={4} className="mb-3 mb-md-0">
                            <div className="text-muted small mb-1">Bus Operator</div>
                            <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                {bus?.operator || bus?.TravelName || "-"}
                            </div>
                            <div className="text-muted small mt-1">
                                {bus?.busType || bus?.BusType || "AC Seater"}
                            </div>
                        </Col>

                        <Col md={4} className="mb-3 mb-md-0 text-center">
                            <div className="text-muted small mb-1">Selected Seat(s)</div>
                            <div className="text-danger d-flex align-items-center justify-content-center flex-wrap">
                                <FaWheelchair className="me-2" />
                                <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                                    {selectedSeats?.map((s) => s.SeatName).join(", ") || "-"}
                                </span>
                            </div>
                            <div className="text-muted small mt-1">
                                {selectedSeats?.length || 0} seat{selectedSeats?.length !== 1 ? 's' : ''} selected
                            </div>
                        </Col>

                        <Col md={4} className="text-md-end">
                            <div className="text-muted small mb-1">Total Fare</div>
                            <div className="fw-bold text-success" style={{ fontSize: '1.5rem' }}>
                                ₹ {totalPrice?.toLocaleString() || "-"}
                            </div>
                            <div className="text-muted small mt-1">
                                Including all taxes
                            </div>
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    {/* Boarding and Dropping Points Section */}
                    <Row className="mb-4">
                        <Col md={6} className="mb-3 mb-md-0">
                            <div className="border rounded p-3 bg-light">
                                <div className="text-muted small mb-1">Boarding Point</div>
                                <div className="fw-bold text-dark mb-1">
                                    {boarding?.CityPointName || boarding?.name || "-"}
                                </div>
                                <div className="text-primary fw-semibold mb-1">
                                    Time: {boardingTime || boarding?.DepTime || boarding?.time || "-"}
                                </div>
                                {boarding?.CityPointAddress && (
                                    <div className="text-muted small">
                                        {boarding.CityPointAddress}
                                    </div>
                                )}
                                {boarding?.CityPointLandmark && (
                                    <div className="text-muted small">
                                        Landmark: {boarding.CityPointLandmark}
                                    </div>
                                )}
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="border rounded p-3 bg-light">
                                <div className="text-muted small mb-1">Dropping Point</div>
                                <div className="fw-bold text-dark mb-1">
                                    {dropping?.CityPointName || dropping?.name || "-"}
                                </div>
                                <div className="text-success fw-semibold mb-1">
                                    Time: {droppingTime || dropping?.ArrTime || dropping?.time || "-"}
                                </div>
                                {dropping?.CityPointAddress && (
                                    <div className="text-muted small">
                                        {dropping.CityPointAddress}
                                    </div>
                                )}
                                {dropping?.CityPointLandmark && (
                                    <div className="text-muted small">
                                        Landmark: {dropping.CityPointLandmark}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <Button
                    variant="primary"
                    className="btn-red px-5 py-2"
                    onClick={handleContinue}
                    style={{ fontSize: '1.1rem' }}
                >
                    Continue to Passenger Details →
                </Button>
            </div>

            {/* Important Notes */}
            <div className="mt-4">
                <Card className="border-danger bg-danger bg-opacity-10">
                    <Card.Body className="py-3">
                        <h6 className="text-warning mb-2">
                            📋 Important Information
                        </h6>
                        <ul className="text-muted small mb-0 ps-3">
                            <li>Please arrive at the boarding point at least 15 minutes before departure</li>
                            <li>Carry a valid ID proof for verification</li>
                            <li>Your seats have been temporarily reserved for 15 minutes</li>
                            <li>All required API parameters are ready for seat blocking</li>
                            <li>Cancellation and refund policies apply as per operator terms</li>
                        </ul>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default BusDetailinfo;