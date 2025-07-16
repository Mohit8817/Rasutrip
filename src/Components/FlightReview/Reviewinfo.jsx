import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Row, Col, Form, Badge } from "react-bootstrap";
import { FaArrowRight, FaPen, FaInfoCircle } from "react-icons/fa";
import moment from "moment";

const ReviewInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const { passengerSelections = [], SSR, SelectedFare } = location.state || {};

  const data = localStorage.getItem('selectedFlight')
  const segments = JSON.parse(data);
   console.log('segments',segments)
  const segment = segments?.Segments?.[0]?.[0] || {};
  const airline = segment.Airline || {};
  const origin = segment.Origin || {};
  const destination = segment.Destination || {};
  const durationMin = segment.Duration || 0;

  const departTime = moment(origin.DepartTime).format("HH:mm");
  const departDate = moment(origin.DepartTime).format("DD MMM");

  const arrivalTime = moment(destination.ArrivalTime).format("HH:mm");
  const arrivalDate = moment(destination.ArrivalTime).format("DD MMM");

  const durationText = `${Math.floor(durationMin / 60)} h ${durationMin % 60} m`;

  const handleContinue = () => {
    navigate("/Payment", {
      state: {
        passengerSelections,
        SSR,
        SelectedFare
      }
    });
  };

  return (
    <div className="container">
      {/* Header */}
      <Card className="mb-3 shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Review Your Flight Details</h5>
          <Button variant="" size="sm" onClick={() => navigate(-1)}>Back</Button>
        </Card.Body>
      </Card>

      <h5 className="fw-bold mb-3">Review Booking</h5>

      {/* Flight Info Card */}
      <Card className="shadow-sm mb-3 flight-card-custom">
        <Card.Body>
          <Row className="align-items-center justify-content-between">
            <Col md="auto">
              <img src={airline.airlineLogo} alt={airline.AirlineName} width={35} />
            </Col>

            <Col md={4}>
              <div className="fw-bold">
                {origin.CityName} → {destination.CityName}{" "}
                <span className="fw-normal">
                  {airline.AirlineName} {airline.AirlineCode} - {airline.FlightNumber} | Economy
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
              <div className="small text-muted">{durationText}</div>
              <div className="small text-muted">0 Stops</div>
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
                  <div><strong>{origin.CityName}</strong></div>
                  <div className="text-muted small">{origin.AirportName}</div>
                  <div className="text-muted small">Terminal {origin.Terminal || "N/A"}</div>
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
                  <div><strong>{destination.CityName}</strong></div>
                  <div className="text-muted small">{destination.AirportName}</div>
                  <div className="text-muted small">Terminal {destination.Terminal || "N/A"}</div>
                </Col>
              </Row>
            </Col>

            <Col md={4} className="text-md-end text-start mt-3 mt-md-0 small">
              <div><strong>Fare Class:</strong> {airline.FareClass || "N/A"}</div>
              <div><strong>Aircraft:</strong> {segment.Craft || "N/A"}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Pax Info */}
      <Card className="container mt-2">
        <div className="d-flex align-items-center mb-3">
          <h5 className="mb-0">Passenger Add-on Details</h5>
          <FaPen className="ms-2 text-primary" />
        </div>

        {passengerSelections.map((selection, i) => (
          <Card key={i} className="mb-3 bg-light border">
            <Card.Body>
              <p className="fw-bold mb-2">Passenger {i + 1}</p>
              {selection.meal && (
                <div className="text-muted small">
                  🍱 <strong>Meal:</strong> {selection.meal.AirlineDescription || "N/A"} | ₹{selection.meal.Price}
                </div>
              )}
              {selection.baggage && (
                <div className="text-muted small">
                  🧳 <strong>Baggage:</strong> {selection.baggage.Weight} Kg | ₹{selection.baggage.Price}
                </div>
              )}
              {selection.seat && (
                <div className="text-muted small">
                  💺 <strong>Seat:</strong> {selection.seat.Code} | ₹{selection.seat.Price}
                </div>
              )}
            </Card.Body>
          </Card>
        ))}

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
    </div>
  );
};

export default ReviewInfo;
