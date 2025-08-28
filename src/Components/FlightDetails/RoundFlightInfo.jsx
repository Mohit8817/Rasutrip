import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Button, Badge, Modal } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import '../../Style/Pagescss/FlightResultsPage.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { fetchFareConfirmation } from '../APIS/FlightApi/FlightApi';
import FlightLoader from '../FlightLoader/FlightLoader';
import { toast } from 'react-toastify';

const RoundFlightInfo = ({ Faresummary, FareData, fareRules, SelectedFare, Selected }) => {
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [fareConfirm, setFareConfirm] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    console.log('SelectedFarekk', SelectedFare, 'FareDatakk', FareData);

    // Get roundtrip flight segments
    const getFlightSegments = () => {
        const segments = [];

        // Add onward flight
        if (SelectedFare?.onward) {
            segments.push({ type: 'onward', data: SelectedFare.onward });
        }

        // Add return flight
        if (SelectedFare?.return) {
            segments.push({ type: 'return', data: SelectedFare.return });
        }
        else {
            segments.push({ type: 'onward', data: FareData });

        }

        return segments;
    };

    const flightSegments = getFlightSegments();

    console.log('flightSegments', flightSegments);
    console.log('selected', Selected);

    const resData = localStorage.getItem('fareSummery');

    let selectedFlight = JSON.parse(resData);

    const farePayloadOnward = useMemo(() => ({
        UserIp: localStorage.getItem("UserIp") || "",
        ResultIndex: SelectedFare?.onward?.FareList?.[0]?.FareId || Selected.FareId,
        // PublishedPrice: SelectedFare?.onward?.PublishedPrice || SelectedFare?.onward?.FareList?.[0]?.PublishedPrice,
        SearchTokenId: localStorage.getItem("searchToken") || ""
    }), [SelectedFare]);


    const farePayloadReturn = useMemo(() => ({
        UserIp: localStorage.getItem("UserIp") || "",
        ResultIndex: SelectedFare?.return?.FareList?.[0]?.FareId || Selected.FareId,
        // PublishedPrice: SelectedFare?.onward?.PublishedPrice || SelectedFare?.onward?.FareList?.[0]?.PublishedPrice,
        SearchTokenId: localStorage.getItem("searchToken") || ""
    }), [SelectedFare]);

    // If no flight data is available, show loading state
    if (!SelectedFare || flightSegments.length === 0) {
        return (
            <div className="container">
                <Card className="mb-3 shadow-sm">
                    <Card.Body className="text-center">
                        <p>Loading roundtrip flight data...</p>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    const handleContinue = async () => {
        setLoading(true);
        try {
                const resFarePayloadOnward = await fetchFareConfirmation(farePayloadOnward);
                let resFarePayloadReturn = null;
                if (flightSegments?.length === 2) {
                    resFarePayloadReturn = await fetchFareConfirmation(farePayloadReturn);
                }
            const confirmedFare = {
                onward: resFarePayloadOnward?.Result,
                return: resFarePayloadReturn?.Result
            };
            console.log('confirmedFare', confirmedFare)
             const IsPriceChange = resFarePayloadOnward?.IsPriceChanged && resFarePayloadReturn.IsPriceChanged
            setFareConfirm(confirmedFare);
            navigate('/traveller-details', {
                state: { SelectedFare, fareConfirmData: confirmedFare, Faresummary,IsPriceChange },
            });
        } catch (error) {
            setError(error);
            toast.error(error?.response?.data?.error?.ErrorMessage);
            console.error("API call failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const navigateBack = () => navigate('/');

    const formatTime = (time) => moment(time).format('HH:mm');
    const formatDate = (time) => moment(time).format('DD MMM');

    const getTripLabel = (type) => {
        switch (type) {
            case 'onward': return 'Depart';
            case 'return': return 'Return';
            default: return `Trip ${type}`;
        }
    };

    const renderFlightSegment = (segmentData, tripType) => {
        const segments = segmentData?.Segments?.[0] || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];
        const totalDuration = lastSegment?.TotalDuration || segments.reduce((total, seg) => total + (seg.Duration || 0), 0);
        const stops = segments.length - 1;

        if (!firstSegment || !lastSegment) return null;

        return (
            <div key={tripType}>
                {/* Trip Header */}
                <Card className="mb-3 shadow-sm position-relative">
                    <Card.Body>
                        <div>
                            <span className="text-success fw-semibold">{getTripLabel(tripType)} </span>
                            <span className="fw-bold">{firstSegment.Origin.CityName}</span> → <span className="fw-bold">{lastSegment.Destination.CityName}</span>
                            <div className="text-muted small">
                                {firstSegment.Origin.CityName} | {stops === 0 ? 'Non Stop' : `${stops} Stop(s)`} | {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                            </div>
                        </div>
                        {tripType === 'onward' && fareRules && fareRules.length > 0 && (
                            <Button variant="outline-danger" size="sm" onClick={() => setShow(true)} className="position-absolute top-50 end-0 translate-middle-y me-3">
                                Fare Rules
                            </Button>
                        )}
                    </Card.Body>
                </Card>

                {/* Individual Segments */}
                {segments.map((segment, index) => {
                    const departTime = formatTime(segment.Origin.DepartTime);
                    const departDate = formatDate(segment.Origin.DepartTime);
                    const arrivalTime = formatTime(segment.Destination.ArrivalTime);
                    const arrivalDate = formatDate(segment.Destination.ArrivalTime);
                    const durationMin = segment.Duration;
                    const durationHr = Math.floor(durationMin / 60);
                    const durationLeft = durationMin % 60;
                    const durationText = `${durationHr} h ${durationLeft} m`;

                    return (
                        <Card key={`${tripType}-${index}`} className="shadow-sm mb-3 flight-card-custom">
                            <Card.Body>
                                <Row className="align-items-center mb-3 justify-content-between">
                                    <Col md="auto">
                                        <img src={segment.Airline.airlineLogo || "/default-airline.png"} alt={segment.Airline.AirlineName} width={40} />
                                    </Col>
                                    <Col md={4}>
                                        <div>
                                            <strong>{segment.Origin.CityName}</strong> → <strong>{segment.Destination.CityName}</strong> {segment.Airline.AirlineName} {segment.Airline.AirlineCode} - {segment.Airline.FlightNumber} | Economy
                                        </div>
                                    </Col>
                                    <Col md="auto" className="text-center">
                                        <div><strong>{departTime}</strong></div>
                                        <div className="text-muted small">{departDate}</div>
                                    </Col>
                                    <Col md="auto" className="text-center">
                                        <FaArrowRight />
                                    </Col>
                                    <Col md="auto" className="text-center">
                                        <div><strong>{arrivalTime}</strong></div>
                                        <div className="text-muted small">{arrivalDate}</div>
                                    </Col>
                                    <Col md="auto" className="text-center">
                                        <div className="small text-muted">{durationText}</div>
                                        <div className="small text-muted">{segment.SegmentIndicator === 1 ? "0 Stops" : `${segment.SegmentIndicator - 1} Stop(s)`}</div>
                                    </Col>
                                </Row>

                                <hr />

                                <Row>
                                    <Col md={8}>
                                        <Row>
                                            <Col xs={2} className="text-center">
                                                <div><strong>{departTime}</strong></div>
                                            </Col>
                                            <Col xs={10}>
                                                <div className="text-muted small">{segment.Origin.AirportName}</div>
                                                <div className="text-muted small">Terminal {segment.Origin.Terminal || 'N/A'}</div>
                                            </Col>

                                            <Col xs={2} className="d-flex justify-content-center">
                                                <div className="flight-dot-line"></div>
                                            </Col>
                                            <Col xs={10} className="d-flex align-items-center">
                                                <Badge bg="light" text="dark">{durationText}</Badge>
                                            </Col>

                                            <Col xs={2} className="text-center mt-2">
                                                <div><strong>{arrivalTime}</strong></div>
                                            </Col>
                                            <Col xs={10} className="mt-2">
                                                <div><strong>{segment.Destination.CityName}</strong></div>
                                                <div className="text-muted small">{segment.Destination.AirportName}</div>
                                                <div className="text-muted small">Terminal {segment.Destination.Terminal || 'N/A'}</div>
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col md={4} className="text-md-end text-start mt-3 mt-md-0 small">
                                        <div> <strong>Check-In </strong> : {segmentData.FareList?.[0]?.SeatBaggage?.[0]?.[0]?.CheckIn || 'N/A'}</div>
                                        <div><strong>Cabin</strong> : {segmentData.FareList?.[0]?.SeatBaggage?.[0]?.[0]?.Cabin || 'N/A'}</div>
                                        <div><strong>Fare Class</strong> : {segmentData.FareList?.[0]?.FareClass || 'N/A'}, <strong>Aircraft</strong> : {segment.Craft || 'N/A'}</div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        );
    };

    // Calculate total price for roundtrip
    const getTotalPrice = () => {
        const onwardPrice = SelectedFare?.onward?.FareList?.[0]?.PublishedPrice;
        const returnPrice = SelectedFare?.return?.FareList?.[0]?.PublishedPrice;
        return onwardPrice + returnPrice;
    };

    return (
        <div className="container">
            {loading ? (
                <>
                    {loading && <div className="text-center text-primary mt-4"><FlightLoader message="Searching For Fare Confirmation" /></div>}
                    {error && <p className="text-center text-danger mt-4">Error fetching fare confirmation.</p>}
                </>
            ) : (
                <>
                    <Card className="mb-3 shadow-sm">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Review Your Roundtrip Flight Details</h5>
                            <div className="d-flex align-items-center gap-3">

                                <Button onClick={navigateBack} variant="" size="sm">Back To Search</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Render all flight segments */}
                    {flightSegments.map(({ type, data }) => renderFlightSegment(data, type))}

                    <div className="text-start">
                        <Button variant="primary" className="btn-red" disabled={loading} onClick={handleContinue}>
                            {loading ? "Loading..." : "Continue Booking"}
                        </Button>
                    </div>

                    <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Fare Rules</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {fareRules && fareRules.length > 0 ? (
                                <div>
                                    {fareRules.map((item, index) => {
                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(item.FareRuleDetail, 'text/html');
                                        const listItems = Array.from(doc.querySelectorAll('li')).map(li => li.textContent.trim());
                                        return (
                                            <div key={index} className="mb-4 p-3 border rounded bg-light">
                                                <p><strong>🌐 Origin:</strong> {item.Origin}</p>
                                                <p><strong>📍 Destination:</strong> {item.Destination}</p>
                                                <p dangerouslySetInnerHTML={{ __html: item.FareRuleDetail || 'N/A' }} />
                                                {listItems.length > 0 && (
                                                    <ul className="list-group list-group-flush">
                                                        {listItems.map((li, i) => (
                                                            <li key={i} className="list-group-item">{li}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>No fare rules available.</p>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShow(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default RoundFlightInfo;