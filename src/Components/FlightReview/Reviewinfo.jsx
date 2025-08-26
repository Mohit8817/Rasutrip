import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Row, Col, Form, Badge, Nav } from "react-bootstrap";
import { FaArrowRight, FaPen, FaInfoCircle, FaPlane } from "react-icons/fa";
import moment from "moment";

const ReviewInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [activeTab, setActiveTab] = useState('onward');

  const {
    passengerSelections = {},
    SSR,
    SelectedFare,
    passengersData,

  } = location.state || {};

  // Get flight data from localStorage
  const [onwardSegments, setOnwardSegments] = useState(null);
  const [returnSegments, setReturnSegments] = useState(null);

  const tripType = localStorage.getItem('tripType')
  const isRoundTrip = tripType == 'roundtrip' ? true : false

  useEffect(() => {
    // Check if it's round-trip or one-way
    if (isRoundTrip) {
      const onwardData = localStorage.getItem('selectedOnwardFlight');
      const returnData = localStorage.getItem('selectedReturnFlight');
      if (onwardData) {
        if (JSON.parse(onwardData).Segments.length > 1) {
          setOnwardSegments(JSON.parse(onwardData));
          setReturnSegments(JSON.parse(onwardData));
        } else {
          setOnwardSegments(JSON.parse(onwardData));
        }
      }
      if (returnData) {
        setReturnSegments(JSON.parse(returnData));
      }
    } else {
      // For one-way flights
      const selectedFlightData = localStorage.getItem('selectedFlight');
      if (selectedFlightData) {
        setOnwardSegments(JSON.parse(selectedFlightData));
      }
    }
  }, [isRoundTrip]);
  const mergedPassengersData = passengersData?.map((passenger, index) => {
    const onwardSelection = passengerSelections.onward?.[index] || passengerSelections[index] || {};
    const returnSelection = passengerSelections.return?.[index] || {};

    return {
      ...passenger,
      ...(isRoundTrip && {
        ReturnMeal: returnSelection.meal ? [returnSelection.meal] : [],
        ReturnSeat: returnSelection.seat ? [returnSelection.seat] : [],
        ReturnBaggage: returnSelection.baggage ? [returnSelection.baggage] : [],
      }),

      // Legacy format for backward compatibility
      Meal: onwardSelection.meal ? [onwardSelection.meal] : [],
      Seat: onwardSelection.seat ? [onwardSelection.seat] : [],
      Baggage: onwardSelection.baggage ? [onwardSelection.baggage] : [],
    };
  }) || [];

  // Update localStorage with merged data
  useEffect(() => {
    if (mergedPassengersData.length > 0) {
      localStorage.removeItem('passengersData');
      localStorage.setItem('passengersData', JSON.stringify(mergedPassengersData));
    }
  }, [mergedPassengersData]);

  // Flight Card Component
  const FlightCard = ({ segments, flightType, title }) => {
    if (!segments || !segments.Segments?.[0]?.[0]) {
      return <div>Flight data not available</div>;
    }
    const segmentGroups = segments.Segments;
    const currentSegments = flightType === 'return' && segmentGroups.length > 1
      ? segmentGroups[1]
      : segmentGroups[0];

    const firstSegment = currentSegments[0];
    const lastSegment = currentSegments[currentSegments.length - 1];
    const firstAirline = firstSegment.Airline || {};
    const firstOrigin = firstSegment.Origin || {};
    const lastDestination = lastSegment.Destination || {};
    const totalDuration = currentSegments.reduce((total, seg) => total + (seg.Duration || 0), 0);
    const totalDurationText = `${Math.floor(totalDuration / 60)} h ${totalDuration % 60} m`;
    const departTime = moment(firstOrigin.DepartTime).format("HH:mm");
    const departDate = moment(firstOrigin.DepartTime).format("DD MMM");
    const arrivalTime = moment(lastDestination.ArrivalTime).format("HH:mm");
    const arrivalDate = moment(lastDestination.ArrivalTime).format("DD MMM");

    return (
      <Card className="shadow-sm mb-3 flight-card-custom">
        <Card.Body>
          {title && (
            <div className="d-flex align-items-center mb-3">
              <FaPlane className="me-2 text-primary" />
              <h6 className="mb-0 fw-bold">{title}</h6>
            </div>
          )}

          {/* Overall Journey Summary */}
          <Row className="align-items-center justify-content-between mb-3 p-2 bg-light rounded">
            <Col md="auto">
              <img src={firstAirline.airlineLogo} alt={firstAirline.AirlineName} width={35} />
            </Col>

            <Col md={4}>
              <div className="fw-bold">
                {firstOrigin.CityName} → {lastDestination.CityName}{" "}
                <span className="fw-normal">
                  {firstAirline.AirlineName} {firstAirline.AirlineCode} - {firstAirline.FlightNumber}
                  {currentSegments.length > 1 && ` +${currentSegments.length - 1} more`} | Economy
                </span>
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
              <div className="small text-muted">{totalDurationText}</div>
            </Col>
          </Row>

          <hr />

          {/* Individual Segments */}
          {currentSegments.map((segment, index) => {
            const airline = segment.Airline || {};
            const origin = segment.Origin || {};
            const destination = segment.Destination || {};
            const durationMin = segment.Duration || 0;
            const durationText = `${Math.floor(durationMin / 60)} h ${durationMin % 60} m`;
            const segmentDepartTime = moment(origin.DepartTime).format("HH:mm");
            const segmentDepartDate = moment(origin.DepartTime).format("DD MMM");
            const segmentArrivalTime = moment(destination.ArrivalTime).format("HH:mm");
            const segmentArrivalDate = moment(destination.ArrivalTime).format("DD MMM");

            return (
              <div key={index}>
                {/* Segment Header */}
                <Row className="align-items-center mb-2">
                  <Col md="auto">
                    <img src={airline.airlineLogo} alt={airline.AirlineName} width={30} />
                  </Col>
                  <Col>
                    <div className="fw-bold small">
                      {airline.AirlineName} {airline.AirlineCode} - {airline.FlightNumber}
                      {segment.Craft === "BUS" && " (Bus Service)"}
                    </div>
                  </Col>
                  <Col md="auto">
                    <Badge bg="secondary" className="small">{durationText}</Badge>
                  </Col>
                </Row>

                {/* Segment Details */}
                <Row className="mb-3">
                  <Col md={8}>
                    <Row>
                      <Col xs={2} className="text-center">
                        <div><strong>{segmentDepartTime}</strong></div>
                        <div className="text-muted small">{segmentDepartDate}</div>
                      </Col>
                      <Col xs={10}>
                        <div><strong>{origin.CityName}</strong></div>
                        <div className="text-muted small">{origin.AirportName}</div>
                        <div className="text-muted small">Terminal {origin.Terminal || "N/A"}</div>
                      </Col>

                      <Col xs={2} className="d-flex justify-content-center my-2">
                        <div className="flight-dot-line"></div>
                      </Col>

                      <Col xs={10} className="d-flex align-items-center my-2">
                        <Badge bg="light" text="dark">{durationText}</Badge>
                        {segment.Craft && (
                          <Badge bg="info" className="ms-2 small">{segment.Craft}</Badge>
                        )}
                      </Col>

                      <Col xs={2} className="text-center">
                        <div><strong>{segmentArrivalTime}</strong></div>
                        <div className="text-muted small">{segmentArrivalDate}</div>
                      </Col>
                      <Col xs={10}>
                        <div><strong>{destination.CityName}</strong></div>
                        <div className="text-muted small">{destination.AirportName}</div>
                        <div className="text-muted small">Terminal {destination.Terminal || "N/A"}</div>
                      </Col>
                    </Row>
                  </Col>

                  <Col md={4} className="text-md-end text-start mt-3 mt-md-0 small">
                    <div><strong>Fare Class:</strong> {airline.FareClass || "N/A"}</div>
                    <div><strong>Aircraft:</strong> {segment.Craft || "N/A"}</div>
                    {segment.OperatingCarrier && (
                      <div><strong>Operated by:</strong> {segment.OperatingCarrier}</div>
                    )}
                  </Col>
                </Row>

                {/* Layover Information */}
                {index < currentSegments.length - 1 && segment.LayoverTime > 0 && (
                  <Row className="mb-3">
                    <Col xs={12} className="text-center">
                      <div className="p-2 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded">
                        <small className="text-warning-emphasis">
                          <FaInfoCircle className="me-1" />
                          Layover: {segment.Layover || `${Math.floor(segment.LayoverTime / 60)} h ${segment.LayoverTime % 60} m`}
                          in {destination.CityName}
                        </small>
                      </div>
                    </Col>
                  </Row>
                )}

                {/* Separator between segments */}
                {index < currentSegments.length - 1 && (
                  <hr className="my-3" style={{ borderStyle: 'dashed' }} />
                )}
              </div>
            );
          })}
        </Card.Body>
      </Card>
    );
  };

  // Passenger Add-ons Component
  const PassengerAddons = ({ flightType }) => {
    const selections = flightType === 'onward'
      ? (passengerSelections.onward || passengerSelections)
      : passengerSelections.return;

    if (!selections) return null;

    return (
      <>
        {selections?.map((selection, i) => {
          const passenger = passengersData[i];
          if (!passenger || passenger.type === 'INF') return null;

          return (
            <Card key={`${flightType}-passenger-${i}`} className="mb-3 bg-light border">
              <Card.Body>
                  <Row>
                    
                  <Col md={4}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="fw-bold mb-2">
                      Passenger {i + 1}
                      {isRoundTrip && (
                        <Badge bg={flightType === 'onward' ? 'primary' : 'success'} className="ms-2">
                          {flightType === 'onward' ? 'Onward' : 'Return'}
                        </Badge>
                      )}
                    </p>
                    <p className="m-0"><strong>Name:</strong> {passenger.Title}&nbsp;{passenger.FirstName} {passenger.LastName}</p>
                    <p className="m-0"><strong>Gender:</strong> {passenger.Gender == 1 ? 'Male' : passenger.Gender == 2 ? 'Female' : 'Other'}</p>
                    <p className="mb-3"><strong>Type:</strong> {passenger.type}</p>
                  </div>
                </div>
</Col>
              
                  <Col md={2}>
                    {selection.meal && (
                      <div className="text-muted small mb-2">
                        🍱 <strong>Meal:</strong><br />
                        {selection.meal.AirlineDescription || "N/A"}<br />
                        <span className="text-success fw-bold">₹{selection.meal.Price}</span>
                      </div>
                    )}
                  </Col>
                  <Col md={3}>
                    {selection.baggage && (
                      <div className="text-muted small mb-2">
                        🧳 <strong>Baggage:</strong><br />
                        {selection.baggage.Weight} Kg<br />
                        <span className="text-success fw-bold">₹{selection.baggage.Price}</span>
                      </div>
                    )}
                  </Col>
                  <Col md={3}>
                    {selection.seat && (
                      <div className="text-muted small mb-2">
                        💺 <strong>Seat:</strong><br />
                        {selection.seat.Code}<br />
                        <span className="text-success fw-bold">₹{selection.seat.Price}</span>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </>
    );
  };

  const handleContinue = () => {
    navigate("/Payment", {
      state: {
        passengerSelections,
        SSR,
        SelectedFare,
        isRoundTrip,
        passengersData: mergedPassengersData
      }
    });
  };

  return (
    <div className="container">
      {/* Header */}
      <Card className="mb-3 shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">Review Your Flight Details</h5>
            {isRoundTrip && (
              <small className="text-muted">Round-trip Booking</small>
            )}
          </div>
          <Button variant="" size="sm" onClick={() => navigate(-1)}>Back</Button>
        </Card.Body>
      </Card>

      <h5 className="fw-bold mb-3">Review Booking</h5>

      {/* Flight Info Cards */}
      {isRoundTrip ? (
        <>
          {/* Round-trip Tab Navigation */}
          <Card className="mb-3">
            <Card.Body>
              <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="onward" className={activeTab === 'onward' ? 'fw-bold' : ''}>
                    <FaPlane className="me-2" />
                     Flight
                  </Nav.Link>
                </Nav.Item>
                {/* <Nav.Item>
                  <Nav.Link eventKey="return" className={activeTab === 'return' ? 'fw-bold' : ''}>
                    <FaPlane className="me-2" style={{ transform: 'scaleX(-1)' }} />
                    Return Flight
                  </Nav.Link>
                </Nav.Item> */}
              </Nav>
            </Card.Body>
          </Card>

          {/* Display flight based on active tab */}
          {activeTab === 'onward' && onwardSegments && (
            <FlightCard
              segments={onwardSegments}
              flightType="onward"
              title="Onward Flight"
            />
          )}
          {/* {activeTab === 'return' && returnSegments && (
            <FlightCard
              segments={returnSegments}
              flightType="return"
              title="Return Flight"
            />
          )} */}
        </>
      ) : (
        // One-way flight
        onwardSegments && (
          <FlightCard segments={onwardSegments} flightType="onward" />
        )
      )}

      {/* Passenger Add-on Details */}
      <Card className="container mt-2">
        <div className="d-flex align-items-center mb-3 mt-4">
          <h5 className="mb-0">Passenger Add-on Details</h5>
          <FaPen className="ms-2 text-primary" />
        </div>

        {isRoundTrip ? (
          <>
            {/* Round-trip passenger addons with tabs */}
            <Nav variant="pills" activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="onward" size="sm">
                  Onward Add-ons
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="return" size="sm">
                  Return Add-ons
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <PassengerAddons flightType={activeTab} />
          </>
        ) : (
          // One-way passenger addons
          <PassengerAddons flightType="onward" />
        )}

        {/* Terms */}
        <Form.Group controlId="termsCheck" className="mb-3">
          <Form.Check
            type="checkbox"
            checked={acceptedTerms}
            onChange={() => setAcceptedTerms(!acceptedTerms)}
            label={<>I have read and accept the <a href="/" className="text-primary">Terms & Conditions</a>.</>}
          />
        </Form.Group>
      </Card>

      {/* Continue Button */}
      <div className="text-start mt-3">
        <Button
          variant="primary"
          className="btn-red"
          onClick={handleContinue}
          disabled={!acceptedTerms}
        >
          Continue Payment
        </Button>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .flight-dot-line {
          width: 2px;
          height: 40px;
          background: linear-gradient(to bottom, #007bff 0%, #007bff 30%, transparent 30%, transparent 70%, #007bff 70%, #007bff 100%);
          position: relative;
        }
        .flight-dot-line::before,
        .flight-dot-line::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #007bff;
          border-radius: 50%;
          left: -3px;
        }
        .flight-dot-line::before {
          top: -4px;
        }
        .flight-dot-line::after {
          bottom: -4px;
        }
        .flight-card-custom {
          border-left: 4px solid #007bff;
        }
        .nav-tabs .nav-link.active {
          border-bottom: 2px solid #007bff;
          font-weight: bold;
        }
        .nav-pills .nav-link.active {
          background-color: #007bff;
        }
      `}</style>
    </div>
  );
};

export default ReviewInfo;