import React, { useState, useMemo, useRef } from 'react';
import { Card, Button, Row, Col, Tab, Nav, Table } from 'react-bootstrap';
import FarePopup from '../../FlightOneWay/Farepopup';
import '../../../Style/Pagescss/FlightResultsPage.css';
import { fetchFareRules } from '../../APIS/FlightApi/FlightApi';

const FlightMultiCard = ({ flight }) => {
    const [fareRules, setFareRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasFetchedRef = useRef(false);
    const userIp = localStorage.getItem("UserIp") || "";
    const searchToken = localStorage.getItem("searchToken") || "";
    const [selectedFare, setSelectedFare] = useState(0); // Default to first fare

    // Multiple fare options (simulate different fare types)
    const fareOptions = useMemo(() => {
        const baseFare = flight.FareList[0];
        return [
            {
                ...baseFare,
                type: 'Return Fare',
                price: baseFare.PublishedPrice + 1000,
                savings: 0,
                isSelected: false
            },
            {
                ...baseFare,
                type: 'Promo Fare',
                price: baseFare.PublishedPrice + 500,
                savings: 500,
                isSelected: false
            },
            {
                ...baseFare,
                type: 'Regular Fare',
                price: baseFare.PublishedPrice,
                savings: 1000,
                isSelected: true
            }
        ];
    }, [flight.FareList]);

    const farePayload = useMemo(() => ({
        UserIp: userIp,
        ResultIndex: flight.FareList[0].FareId || "",
        SearchTokenId: searchToken
    }), [userIp, searchToken, flight.FareList[0].FareId]);

    const containerStyle = {
        marginTop: '5px',
        borderTop: '2px solid #292323',
        position: 'relative',
        width: '125px',
    };

    const beforeStyle = {
        content: '""',
        position: 'absolute',
        borderStyle: 'solid',
        borderWidth: '10px 10px 0 0',
        borderColor: '#292323 transparent transparent transparent',
        right: '-1.5px',
        top: '-10px',
        transform: 'scaleY(-1)',
    };

    const fetchData = async () => {
        try {
            const res = await fetchFareRules(

            );
            if (res?.Error?.ErrorCode === 0 && Array.isArray(res?.Result)) {
                setFareRules(res.Result);
            } else {
                console.warn("API returned error or empty result:", res?.Error?.ErrorMessage);
                setFareRules([]);
            }
        } catch (err) {
            console.error("API call failed:", err);
            setError(err);
            setFareRules([]);
        } finally {
            setLoading(false);
        }
    };

    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('flight');
    const [showFarePopup, setShowFarePopup] = useState(false);

    // Get flight segments info
    const getFlightSegments = () => {
        return flight.Segments.map((segmentGroup, tripIndex) => {
            const firstSegment = segmentGroup[0];
            const lastSegment = segmentGroup[segmentGroup.length - 1];

            return {
                tripIndex,
                segments: segmentGroup,
                from: firstSegment.Origin,
                to: lastSegment.Destination,
                airline: firstSegment.Airline,
                totalDuration: firstSegment.TotalDuration,
                stops: segmentGroup.length - 1
            };
        });
    };

    const flightSegments = getFlightSegments();

    const formatTime = (dateTimeStr) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeStr).toLocaleTimeString([], options);
    };

    const formatDuration = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const formatDate = (dateTimeStr) => {
        const options = { day: 'numeric', month: 'short' };
        return new Date(dateTimeStr).toLocaleDateString(undefined, options);
    };

    const formatFullDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        const options = {
            month: 'short',
            day: '2-digit',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        return date.toLocaleString('en-US', options).replace(',', '');
    };

    const handleFareSelection = (fareIndex) => {
        setSelectedFare(fareIndex);
    };

    return (
        <>
            <Card className="flight-card mb-3 w-full border-0 shadow-sm">
                <Card.Body className="p-3">
                    {/* Flight Segments */}

                    <Row >
                        <Col md={10}>
                            {flightSegments.map((flightInfo, index) => (
                                <div key={index} className={index > 0 ? "border-top pt-3 mt-3" : ""}>
                                    <Row className="align-items-center text-center">
                                        <Col col={2} >
                                            <img
                                                src={flightInfo.airline.airlineLogo}
                                                alt="Airline Logo"
                                                style={{ width: '40px', height: '40px' }}
                                            />
                                            <div className="fw-semibold small mt-1 flex">{flightInfo.airline.AirlineName}</div>
                                            <div className="text-muted small flex">
                                                {flightInfo.airline.AirlineCode}-{flightInfo.airline.FlightNumber}
                                            </div>
                                            <div className="text-warning small mt-1 flex">
                                                Seats left: {flight.FareList[0].SeatBaggage[index]?.[0]?.NoOfSeatAvailable || 'N/A'}
                                            </div>
                                        </Col>

                                        <Col col={3}>
                                            <div className="text-uppercase text-muted small">
                                                <i className="fa fa-plane-departure me-1"></i>
                                                {flightInfo.from.CityCode}
                                            </div>
                                            <div className="fw-bold fs-5">{formatTime(flightInfo.from.DepartTime)}</div>
                                            <div className="text-muted small">{formatDate(flightInfo.from.DepartTime)}</div>
                                        </Col>

                                        <Col col={3}>
                                            <div className="text-muted small">
                                                {flightInfo.stops > 0 ? `${flightInfo.stops} Stop(s)` : 'Non Stop(s)'}
                                            </div>
                                            <div style={containerStyle}>
                                                <span style={beforeStyle}></span>
                                            </div>
                                            <div className="fw-medium">{formatDuration(flightInfo.totalDuration)}</div>
                                        </Col>

                                        <Col col={4}>
                                            <div className="text-uppercase text-muted small">
                                                <i className="fa fa-plane-arrival me-1"></i>
                                                {flightInfo.to.CityCode}
                                            </div>
                                            <div className="fw-bold fs-5">{formatTime(flightInfo.to.ArrivalTime)}</div>
                                            <div className="text-muted small">{formatDate(flightInfo.to.ArrivalTime)}</div>
                                        </Col>

                                        {/* Fare Options - Show only on last segment */}

                                    </Row>
                                </div>
                            ))}
                        </Col>
                        {/* <Col md={2}> */}

                            <>
                                {/* <Col md={12}> */}
                                    {/* <div className="fare-options">
                                        {flight.FareList.map((fare, fareIndex) => (
                                            <div
                                                key={fareIndex}
                                                className={`fare-option mb-1 ${selectedFare === fareIndex ? 'selected' : ''}`}
                                            >
                                                <label className="d-flex align-items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="fareSelection"
                                                        value={fareIndex}
                                                        // checked={selectedFare === fareIndex}
                                                        onChange={() => handleFareSelection(fareIndex)}
                                                        className="me-2"
                                                    />
                                                    <div className="fare-info text-start">
                                                        <div className="fw-bold">₹ {fare.PublishedPrice}</div>
                                                        <div className="text-muted small">{fare.CabinClass}</div>
                                                        <div className="text-success small">
                                                            Economy, {fare.IsRefundable ? 'Refundable' : 'Non Refundable'}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div> */}
                                {/* </Col> */}


                            </>


                        {/* </Col> */}

                        <Col md={2}>
                            <Button
                                variant="primary"
                                className="w-100 mb-2 rounded-pill fw-bold"
                                style={{ backgroundColor: '#ff6b35', border: 'none' }}
                                onClick={() => setShowFarePopup(true)}
                            >
                                BOOK
                            </Button>
                            <div
                                className="text-primary cursor-pointer small fw-semibold"
                                onClick={() => {
                                    if (!hasFetchedRef.current) {
                                        fetchData();
                                        hasFetchedRef.current = true;
                                    }
                                    setShowDetails(!showDetails);
                                }}
                            >
                                Flight Details {showDetails ? '-' : '+'}
                            </div>
                        </Col>




                    </Row>


                    {/* Flight Details Section */}
                    {showDetails && (
                        <div className="flight-tab-box mt-4 border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                <Nav variant="tabs" className="mb-3">
                                    <Nav.Item><Nav.Link eventKey="flight">Flight Details</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="fare-detail">Fare Details</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="rules">Fare Rules</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="baggage">Baggage</Nav.Link></Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    <Tab.Pane eventKey="flight">
                                        {flight.Segments.map((segmentGroup, tripIndex) => (
                                            <Card key={tripIndex} className="mt-3 p-3 shadow-sm border">
                                                <div className="mb-3">
                                                    <span className="fw-bold">
                                                        {segmentGroup[0].Origin.CityName} → {segmentGroup[segmentGroup.length - 1].Destination.CityName}
                                                    </span>
                                                    <small className="ms-2 text-muted">
                                                        {formatDate(segmentGroup[0].Origin.DepartTime)}
                                                    </small>
                                                </div>

                                                {segmentGroup.map((segment, segIndex) => (
                                                    <div key={segIndex}>
                                                        <Row className="align-items-center mb-4">
                                                            <Col md={2} className="text-center">
                                                                <img
                                                                    src={segment.Airline.airlineLogo}
                                                                    alt={segment.Airline.AirlineName}
                                                                    className="img-fluid mb-2"
                                                                    style={{ maxWidth: '50px' }}
                                                                />
                                                                <h6 className="mb-0 small">{segment.Airline.AirlineName}</h6>
                                                                <small>{segment.Airline.AirlineCode}-{segment.Airline.FlightNumber}</small>
                                                            </Col>

                                                            <Col md={10}>
                                                                <Row className="text-center gy-2">
                                                                    <Col md={4}>
                                                                        <h6 className="fw-bold">
                                                                            <i className="fa fa-plane-departure me-1"></i>
                                                                            {segment.Origin.CityName}, {segment.Origin.CountryName}
                                                                        </h6>
                                                                        <p className="mb-0">
                                                                            <small>{formatFullDateTime(segment.Origin.DepartTime)}</small>
                                                                        </p>
                                                                        <small>{segment.Origin.AirportName}</small><br />
                                                                        {segment.Origin.Terminal && <small>Terminal {segment.Origin.Terminal}</small>}
                                                                    </Col>

                                                                    <Col md={4} className="position-relative">
                                                                        <div className="text-center">
                                                                            <strong>{formatDuration(segment.Duration)}</strong><br />
                                                                            <div style={containerStyle}>
                                                                                <span style={beforeStyle}></span>
                                                                            </div>
                                                                            <small className="text-muted">Duration</small>
                                                                        </div>
                                                                    </Col>

                                                                    <Col md={4}>
                                                                        <h6 className="fw-bold">
                                                                            <i className="fa fa-plane-arrival me-1"></i>
                                                                            {segment.Destination.CityName}, {segment.Destination.CountryName}
                                                                        </h6>
                                                                        <p className="mb-0">
                                                                            <small>{formatFullDateTime(segment.Destination.ArrivalTime)}</small>
                                                                        </p>
                                                                        <small>{segment.Destination.AirportName}</small><br />
                                                                        {segment.Destination.Terminal && <small>Terminal {segment.Destination.Terminal}</small>}
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mt-3">
                                                                    <Col md={6}>
                                                                        <small>{flight.FareList[0].CabinClass}</small>
                                                                    </Col>
                                                                    <Col md={6}>
                                                                        <small><strong>Craft:</strong> {segment.Craft}</small>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>

                                                        {/* Layover */}
                                                        {segmentGroup.length > 1 && segIndex < segmentGroup.length - 1 && (
                                                            <Row className="text-center">
                                                                <Col>
                                                                    <hr className="my-2" />
                                                                    <span className="text-danger fw-bold">
                                                                        LAYOVER : {segment.Layover} {segment.Destination.CityName}
                                                                    </span>
                                                                    <hr className="my-2" />
                                                                </Col>
                                                            </Row>
                                                        )}
                                                    </div>
                                                ))}
                                            </Card>
                                        ))}
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="fare-detail">
                                        <div className="my-4">
                                            <h5 className="fw-bold mb-3">Fare Details for ADULT</h5>
                                            <Table bordered hover responsive>
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Type</th>
                                                        <th>Fare</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Base Price</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.BaseFare} x 1</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.BaseFare}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Taxes and Fees</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.Tax} x 1</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.Tax}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Service and Other Charges</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.OtherCharges}</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.OtherCharges}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>GST</td>
                                                        <td>₹ 0</td>
                                                        <td>₹ 0</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Discount(-)</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.Discount}</td>
                                                        <td>₹ {fareOptions[selectedFare].Fare.Discount}</td>
                                                    </tr>
                                                    <tr className="fw-bold">
                                                        <td colSpan={2}>Total</td>
                                                        <td>₹ {fareOptions[selectedFare].price}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="rules">
                                        <div className="p-3">
                                            <Table striped bordered hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Fare Rule Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fareRules.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <div dangerouslySetInnerHTML={{ __html: item.FareRuleDetail }} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="baggage">
                                        <div className="p-3">
                                            <table className="table table-bordered text-center align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="fw-bold">Sector</th>
                                                        <th className="fw-bold">Check-In</th>
                                                        <th className="fw-bold">Cabin</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {flight.FareList[0].SeatBaggage.flat().map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.Sector}</td>
                                                            <td>{item.CheckIn || ''}</td>
                                                            <td>{item.Cabin || ''}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Fare Popup Modal */}
            <FarePopup
                show={showFarePopup}
                onClose={() => setShowFarePopup(false)}
                fares={flight || []}
            />

            {/* <style jsx>{`
                .fare-option {
                    padding: 8px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                
                .fare-option.selected {
                    border-color: #007bff;
                    background-color: #f8f9ff;
                }
                
                .fare-option:hover {
                    background-color: #f8f9fa;
                }
                
                .cursor-pointer {
                    cursor: pointer;
                }
                
                .flight-card {
                    transition: box-shadow 0.3s ease;
                }
                
                .flight-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }
            `}</style> */}
        </>
    );
};

export default FlightMultiCard;