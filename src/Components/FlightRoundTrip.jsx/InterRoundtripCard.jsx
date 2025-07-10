import React, { useState } from 'react';
import './InterRoundtripCard.css';
import { FaPlaneDeparture } from 'react-icons/fa';
import { Button, Col, Row, Tab, Nav } from 'react-bootstrap';
import FarePopup from '../FlightOneWay/Farepopup';

const InterRoundtripCard = ({ flight }) => {
  const [showFarePopup, setShowFarePopup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('flight');

  const fare = flight?.Fare?.PublishedFare || 0;
  const refundable = flight?.Fare?.IsRefundable ? 'Refundable' : 'Non-refundable';
  const cabinClass = flight?.Fare?.FareBasis?.[0] || 'Economy';
  const seatsLeft = flight?.SeatsAvailable || 9;
  const firstSegment = flight?.Segments?.[0]?.[0];

  const formatDate = (str) => new Date(str).toDateString();
  const formatTime = (str) => new Date(str).toTimeString().slice(0, 5);

  const renderSegment = (segment, i) => {
    const seg = segment[0];
    const airline = seg?.Airline?.AirlineName || 'Airline';
    const flightCode = `${seg?.Airline?.AirlineCode}-${seg?.FlightNumber}`;
    const from = seg?.Origin?.CityName || seg?.Origin?.AirportCode || '';
    const to = seg?.Destination?.CityName || seg?.Destination?.AirportCode || '';
    const depTime = seg?.DepTime?.split('T')[1]?.slice(0, 5);
    const arrTime = seg?.ArrTime?.split('T')[1]?.slice(0, 5);
    const depDate = new Date(seg?.DepTime).toDateString().slice(4, 10);
    const arrDate = new Date(seg?.ArrTime).toDateString().slice(4, 10);
    const duration = `${Math.floor(seg?.Duration / 60)}h ${seg?.Duration % 60}m`;

    return (
      <Row key={i} className="align-items-center py-3">
        <Col md={3} className="d-flex align-items-center">
          <img src={seg?.Airline?.LogoUrl} alt="logo" width={32} height={32} className="me-2" />
          <div>
            <div className="fw-semibold">{airline}</div>
            <div className="small text-muted">{flightCode}</div>
          </div>
        </Col>
        <Col md={2} className="text-center">
          <div className="fw-bold">{from}</div>
          <div className="text-muted small">{depTime}</div>
          <div className="text-muted small">{depDate}</div>
        </Col>
        <Col md={2} className="text-center">
          <div className="text-muted">1 Stop</div>
          <div className="fw-semibold">{duration}</div>
        </Col>
        <Col md={2} className="text-center">
          <div className="fw-bold">{to}</div>
          <div className="text-muted small">{arrTime}</div>
          <div className="text-muted small">{arrDate}</div>
        </Col>
        <Col md={3} className="text-end">
          <div className="fw-bold fs-5 text-dark">₹ {fare}</div>
          <div className="badge bg-warning text-dark mb-1">{cabinClass}</div>
          <div className="small">
            <span className={refundable === 'Refundable' ? 'text-success' : 'text-danger'}>
              {refundable}
            </span>
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <div className="flight-card border rounded bg-white shadow-sm p-3 mb-4">
      {flight?.Segments?.map((segment, i) => renderSegment(segment, i))}

      <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
        <div className="text-muted small">
          <FaPlaneDeparture className="me-2" />
          Arrives after 1 Day(s) | <span className="text-warning fw-semibold">Seats left: {seatsLeft}</span>
        </div>

        <div className="text-end">
          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setShowFarePopup(true)}>
            View Details
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Flight Info' : 'Flight Details +'}
          </Button>
        </div>
      </div>

      {showDetails && firstSegment && (
        <div className="mt-4 p-3 bg-light border rounded">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs">
              <Nav.Item><Nav.Link eventKey="flight">Flight</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="rules">Rules</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="baggage">Baggage</Nav.Link></Nav.Item>
            </Nav>

            <Tab.Content className="mt-3">
              <Tab.Pane eventKey="flight">
                <Row>
                  <Col md={6}>
                    <strong>{firstSegment?.Origin?.CityName}</strong> to <strong>{firstSegment?.Destination?.CityName}</strong>
                    <p>{formatDate(firstSegment?.DepTime)}</p>
                    <p>{firstSegment?.Origin?.AirportName}, Terminal {firstSegment?.Origin?.Terminal}</p>
                    <p>Departs at {formatTime(firstSegment?.DepTime)}</p>
                  </Col>
                  <Col md={6}>
                    <p>{firstSegment?.Destination?.AirportName}, Terminal {firstSegment?.Destination?.Terminal}</p>
                    <p>Arrives at {formatTime(firstSegment?.ArrTime)}</p>
                    <p>Duration: {Math.floor(firstSegment.Duration / 60)}h {firstSegment.Duration % 60}m</p>
                    <p>Seats left: {seatsLeft}</p>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="rules">
                <p>Cancellation Fee: ₹{Math.round(fare * 0.4)}</p>
                <p>Date Change: ₹{Math.round(fare * 0.3)} + fare difference</p>
                <p>No-show: Taxes only</p>
              </Tab.Pane>

              <Tab.Pane eventKey="baggage">
                <p>Check-in Baggage: 15kg</p>
                <p>Cabin: 7kg</p>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      )}

      <FarePopup
        show={showFarePopup}
        onClose={() => setShowFarePopup(false)}
        fares={flight}
      />
    </div>
  );
};

export default InterRoundtripCard;
