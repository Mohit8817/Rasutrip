import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Button, Badge, Modal } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import '../../Style/Pagescss/FlightResultsPage.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { fetchFareConfirmation } from '../APIS/FlightApi/FlightApi';
import FlightLoader from '../FlightLoader/FlightLoader';

import { toast } from 'react-toastify';
const FlightInfo = ({ FareData, fareRules, SelectedFare }) => {
    const segments = FareData?.Segments?.[0] || [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [fareConfirm, setFareConfirm] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const farePayload = useMemo(() => ({
        UserIp: localStorage.getItem("UserIp") || "",
        ResultIndex: SelectedFare?.FareId || "",
        PublishedPrice: SelectedFare?.PublishedPrice,
        SearchTokenId: localStorage.getItem("searchToken") || ""
    }), [SelectedFare]);

    const selectedFlight = localStorage.getItem('selectedFlight');
    console.log('selectedFlight',selectedFlight)
    const handleContinue = async () => {
        setLoading(true);
        try {
            const res = await fetchFareConfirmation(farePayload);
            const confirmedFare = res?.Result || [];
            setFareConfirm(confirmedFare);
            navigate('/traveller-details', {
                state: { SelectedFare, fareConfirm: confirmedFare },
            });
        } catch (error) {
            setError(error);
            toast.error(error?.response?.data?.error?.ErrorMessage)
            console.error("API call failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const navigateBack = () => navigate('/');

    const formatTime = (time) => moment(time).format('HH:mm');
    const formatDate = (time) => moment(time).format('DD MMM');
    const totalDuration = lastSegment?.TotalDuration || 0;
    const stops = segments.length - 1;

    return (

         
        <div className="container">
            {loading ? (
                <>
                 {loading && <p className="text-center text-primary mt-4"><FlightLoader message="Searching For Fare Confermation" /></p>}
                        {error && <p className="text-center text-danger mt-4">Error fetching fare rules.</p>}</>
            ):(
                <> <Card className="mb-3 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Review Your Flight Details</h5>
                    <Button onClick={navigateBack} variant="" size="sm">Back To Search</Button>
                </Card.Body>
            </Card>

            <Card className="mb-3 shadow-sm position-relative">
                <Card.Body>
                    <div>
                        <span className="text-success fw-semibold">Depart </span>
                        <span className="fw-bold">{firstSegment.Origin.CityName}</span> → <span className="fw-bold">{lastSegment.Destination.CityName}</span>
                        <div className="text-muted small">
                            {firstSegment.Origin.CityName} | {stops === 0 ? 'Non Stop' : `${stops} Stop(s)`} | {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                        </div>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={() => setShow(true)} className="position-absolute top-50 end-0 translate-middle-y me-3">Fare Rules</Button>
                </Card.Body>
            </Card>

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
                    <Card key={index} className="shadow-sm mb-3 flight-card-custom">
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
                                    <div> <strong>Check-In </strong> : {FareData.FareList[0].SeatBaggage[0][0].CheckIn}</div>
                                    <div><strong>Cabin</strong> : {FareData.FareList[0].SeatBaggage[0][0].Cabin}</div>
                                    <div><strong>Fare Class</strong> : {FareData.FareList[0].FareClass || 'N/A'}, <strong>Aircraft</strong> : {segment.Craft || 'N/A'}</div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                );
            })}

            <div className="text-start">
                <Button variant="primary" className="btn-red" disabled={loading} onClick={handleContinue}>
                    {loading ? "loading..." : "Continue Booking"}
                </Button>
            </div>

            <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Fare Rules</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {fareRules.length > 0 ? (
                        <div>
                            {fareRules.map((item, index) => {
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(item.FareRuleDetail, 'text/html');
                                const listItems = Array.from(doc.querySelectorAll('li')).map(li => li.textContent.trim());
                                return (
                                    <div key={index} className="mb-4 p-3 border rounded bg-light">
                                        {/* <p><strong>✈️ Airline:</strong> {item.Airline || 'N/A'}</p> */}
                                        <p><strong>🌐 Origin:</strong> {item.Origin}</p>
                                        <p><strong>📍 Destination:</strong> {item.Destination}</p>
                                        {/* <p><strong>🧾 Fare Basis Code:</strong> {item.FareBasisCode || 'N/A'}</p>
                                        <p><strong>📌 Fare Restriction:</strong> {item.FareRestriction || 'N/A'}</p> */}
                                      <p dangerouslySetInnerHTML={{ __html: item.FareRuleDetail || 'N/A' }} />

                                        <ul className="list-group list-group-flush">
                                            {listItems.map((li, i) => (
                                                <li key={i} className="list-group-item">{li}</li>
                                            ))}
                                        </ul>
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
            </Modal></>
            ) }
        </div>
    );
};

export default FlightInfo;