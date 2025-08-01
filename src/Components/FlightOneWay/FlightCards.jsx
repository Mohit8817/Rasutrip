import React, { useState, useMemo, useRef } from 'react';
import { Card, Button, Row, Col, Tab, Nav, Table } from 'react-bootstrap';
import FarePopup from './Farepopup'; // import modal component
import '../../Style/Pagescss/FlightResultsPage.css';
import { fetchFareRules } from '../APIS/FlightApi/FlightApi';

const FlightCard = ({ flight }) => {

    const [fareRules, setFareRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasFetchedRef = useRef(false);
    const userIp = localStorage.getItem("UserIp") || "";
    const searchToken = localStorage.getItem("searchToken") || "";

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
            const res = await fetchFareRules(farePayload);
            console.log("Fare Rule API Response:", res.Result);

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

    const flightStop = flight.Segments[0].length
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('flight');
    const [showFarePopup, setShowFarePopup] = useState(false);


    const segment = flight?.Segments[0][0];
    console.log('gggg', flight)

    const getStartAndEnd = (segmentsGroup) => {
        if (!segmentsGroup?.length) return null;

        // Assuming each group is an array of segments
        return segmentsGroup.map((segments) => {
            const first = segments[0];
            const last = segments[segments.length - 1];

            return {
                fromCity: first.Origin.CityName,
                fromAirport: first.Origin.AirportCode,
                fromTime: first.Origin.DepartTime,
                toCity: last.Destination.CityName,
                toAirport: last.Destination.AirportCode,
                toTime: last.Destination.ArrivalTime
            };
        });
    };

    const tripSummary = getStartAndEnd(flight.Segments);
    console.log('tripSummary', tripSummary)
    const formatTime = (dateTimeStr) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeStr).toLocaleTimeString([], options);
    };

    const formatDuration = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
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






    const formatDate = (dateTimeStr) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateTimeStr).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <Card className="flight-card mb-3 w-full">
                <Card.Body>
                    <Row className="align-items-center text-center">
                        <Col md={2}>
                            <img src={segment.Airline.airlineLogo} alt="Airline Logo" />

                            <div className="fw-semibold">{segment.Airline.AirlineName}</div>
                            <div className="text-muted small">{segment.Airline.FlightNumber}</div>
                            <div className="seats-left text-warning mt-2">
                                Seats left: {flight.
                                    FareList[0].SeatBaggage[0][0].NoOfSeatAvailable || 'N/A'}
                            </div>
                        </Col>

                        <Col md={2}>

                            <div className="text-uppercase text-muted mt-1">
                                <i class="fa fa-plane-departure"></i> {tripSummary[0].fromCity}</div>
                            <div className="fw-bold">{formatTime(tripSummary[0].fromTime)}</div>
                            <div className="text-muted small">{formatDate(tripSummary[0].fromTime)}</div>
                        </Col>

                        <Col md={2}>
                            <div className="text-muted small " > {flightStop > 1 ? flightStop - 1 + ' Stop(s)' : 'Non Stop(s)'} </div>
                            <div style={containerStyle}>
                                <span style={beforeStyle}></span>

                            </div>
                            <div className="fw-medium">{Math.floor(segment.TotalDuration / 60)}h {segment.TotalDuration % 60}m</div>
                        </Col>

                        <Col md={2}>
                            <div className="text-uppercase text-muted mt-1">
                                <i className="fa fa-plane-arrival"></i> {tripSummary[0].toCity}
                            </div>
                            <div className="fw-bold">
                                {formatTime(tripSummary[0].toTime)}
                            </div>
                            <div className="text-muted small">
                                {formatDate(tripSummary[0].toTime)}
                            </div>
                        </Col>


                        <Col md={2}>
                            <div className="fw-bold text-dark">₹ {flight.MinPublishedPrice}</div>
                            {flight.tag && (
                                <span className="badge bg-light text-dark">{flight.tag}</span>
                            )}
                            <div className="text-muted small">
                                {flight.FareList[0].CabinClass || 'Economy'}, {flight.FareList[0].IsRefundable == true ? 'Refundable' : 'Non Refundable'}
                            </div>
                        </Col>

                        <Col md={2}>
                            <Button
                                variant="danger"
                                className="w-100 card-button"
                                onClick={() => setShowFarePopup(true)}
                            >
                                View Details
                            </Button>
                            <div
                                className="flight-details-toggle mt-2 cursor-pointer"
                                onClick={() => {
                                    if (!hasFetchedRef.current) {
                                        fetchData();
                                        hasFetchedRef.current = true; // ✅ block future API calls
                                    }
                                    setShowDetails(!showDetails);
                                }}
                            >
                                {showDetails ? 'Hide Details -' : 'Flight Details +'}
                            </div>
                        </Col>
                    </Row>

                    {showDetails && (
                        <div className="flight-tab-box mt-4 border rounded p-3 bg-light-gray">
                            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                <Nav variant="tabs" className="mb-3">
                                    <Nav.Item><Nav.Link eventKey="flight">Flight Details</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="fare-detail">Fare Details</Nav.Link></Nav.Item>

                                    <Nav.Item><Nav.Link eventKey="rules">Fare Rules</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="baggage">Baggage</Nav.Link></Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    <Tab.Pane eventKey="flight">

                                        <Tab.Container defaultActiveKey="flight">
                                            <Row>

                                                <Col sm={12}>
                                                    <Tab.Content>
                                                        <Tab.Pane eventKey="flight">
                                                            <Card className="mt-3 p-3 shadow-sm border">

                                                                <span>{segment.Origin.CityName} → {segment.Destination.CityName}</span>
                                                                <small>{formatDate(segment.Origin.DepartTime)}</small>
                                                                {/* Delhi → Mumbai <small>Wed, Jul 16 2025</small> */}
                                                                {/* Segment 1 */}

                                                                {flight.Segments[0].map((segment, index) => (
                                                                    <div key={index}>
                                                                        {/* Flight Segment UI */}
                                                                        <Row className="align-items-center mb-4">
                                                                            <Col md={2} className="text-center">
                                                                                <img
                                                                                    src={segment.Airline.airlineLogo}
                                                                                    alt={segment.Airline.AirlineName}
                                                                                    className="img-fluid mb-2"
                                                                                    style={{ maxWidth: '50px' }}
                                                                                />
                                                                                <h6 className="mb-0">{segment.Airline.AirlineName}</h6>
                                                                                <small>{segment.Airline.AirlineCode}-{segment.Airline.FlightNumber}</small>
                                                                            </Col>

                                                                            <Col md={10}>
                                                                                <Row className="text-center gy-2">
                                                                                    <Col md={4}>
                                                                                        <h6 className="fw-bold"> <i class="fa fa-plane-departure"></i> {segment.Origin.CityName} , {segment.Origin.CountryName}</h6>
                                                                                        <p className="mb-0"><small>{formatFullDateTime(segment.Origin.DepartTime)}</small></p>
                                                                                        <small>{segment.Origin.AirportName}</small><br />
                                                                                        {segment.Origin.Terminal && <small>Terminal {segment.Origin.Terminal}</small>}
                                                                                    </Col>

                                                                                    <Col md={4}>
                                                                                    <div className='position-absolute text-center'>
                                                                                        <strong>{formatDuration(segment.Duration)}</strong><br />
                                                                                        <div style={containerStyle}>
                                                                                            <span style={beforeStyle}></span>

                                                                                        </div>
                                                                                        <small className="text-muted">Duration</small>
                                                                                        </div>
                                                                                    </Col>

                                                                                    <Col md={4}>
                                                                                        <h6 className="fw-bold"> <i class="fa fa-plane-arrival"></i> {segment.Destination.CityName}, {segment.Destination.CountryName}</h6>
                                                                                        <p className="mb-0"><small>{formatFullDateTime(segment.Destination.ArrivalTime)}</small></p>
                                                                                        {segment.Destination.AirportName && <small>{segment.Destination.AirportName}</small>}<br />
                                                                                        {segment.Destination.Terminal && <small>Terminal {segment.Destination.Terminal}</small>}
                                                                                    </Col>
                                                                                </Row>

                                                                                <Row className="mt-3">
                                                                                    <Col md={6}><small>{flight.FareList[0].CabinClass}</small></Col>
                                                                                    <Col md={6}><small><strong>Craft:</strong> {segment.Craft}</small></Col>
                                                                                </Row>
                                                                            </Col>
                                                                        </Row>

                                                                        {/* Layover row (only shown if NOT last segment) */}
                                                                        {flight.Segments[0].length > 1 && index < flight.Segments[0].length - 1 && (
                                                                            <Row className="text-center">
                                                                                <Col>
                                                                                    <hr className="my-2" />
                                                                                    <span className="text-danger fw-bold">LAYOVER : {segment.Layover || segment.LayoverTime} {segment.Destination.CityName}</span>
                                                                                    <hr className="my-2" />
                                                                                </Col>
                                                                            </Row>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {/* end Segment 2 */}


                                                            </Card>
                                                        </Tab.Pane>
                                                    </Tab.Content>
                                                </Col>
                                            </Row>
                                        </Tab.Container>


                                    </Tab.Pane>
                                    <Tab.Pane eventKey="fare-detail">
                                        <Tab.Container className="my-4">
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
                                                        <td>₹ {flight.FareList[0].Fare.BaseFare} x 1</td>
                                                        <td>₹ {flight.FareList[0].Fare.BaseFare}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Taxes and Fees</td>
                                                        <td>₹ {flight.FareList[0].Fare.Tax} x 1</td>
                                                        <td>₹ {flight.FareList[0].Fare.Tax}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Service and Other Charges</td>
                                                        <td>₹ {flight.FareList[0].Fare.OtherCharges}</td>
                                                        <td>₹ {flight.FareList[0].Fare.OtherCharges}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>GST</td>
                                                        <td>₹ 0</td>
                                                        <td>₹ 0</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Discount(-)</td>
                                                        <td>₹ {flight.FareList[0].Fare.Discount}</td>
                                                        <td>₹ {flight.FareList[0].Fare.Discount}</td>
                                                    </tr>
                                                    <tr className="fw-bold">
                                                        <td colSpan={2}>Total</td>
                                                        <td>
                                                            ₹ {
                                                                flight.FareList[0].Fare.BaseFare +
                                                                flight.FareList[0].Fare.Tax +
                                                                flight.FareList[0].Fare.OtherCharges -
                                                                flight.FareList[0].Fare.Discount
                                                            }
                                                        </td>

                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Tab.Container>
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
                                                    {flight.FareList[0].SeatBaggage[0].map((item, index) =>
                                                        <tr key={index}>
                                                            <td>{item.Sector}</td>
                                                            <td>{item.CheckIn || ''}</td>
                                                            <td>{item.Cabin || ''}</td>
                                                        </tr>
                                                    )}
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
        </>
    );
};

export default FlightCard;
