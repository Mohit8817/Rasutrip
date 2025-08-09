import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';

const FareSummary = ({ passengerSelections = [] }) => {
  const [fareOnward, setFareOnward] = useState(null);
  const [fareReturn, setFareReturn] = useState(null);

  const journeyType = localStorage.getItem('tripType');
  const rasocommision = parseFloat(localStorage.getItem('rasocommision')) || 0;

  useEffect(() => {
  const res = localStorage.getItem('fareSummery');
  const parsedFare = res ? JSON.parse(res) : null;

  if (!parsedFare) return;

  if (Array.isArray(parsedFare)) {
    // Format 1: Array
    setFareOnward(parsedFare[0] || null);
    setFareReturn(parsedFare[1] || null);
  } else if (parsedFare?.onward || parsedFare?.return) {
    // Format 2: Object with onward and return
    setFareOnward(parsedFare?.onward || null);
    setFareReturn(parsedFare?.return || null);
  } else {
    // Fallback: treat as single object (one-way)
    setFareOnward(parsedFare);
    setFareReturn(null);
  }
}, [journeyType]);


  const getServiceCharge = (price) => (price * rasocommision) / 100;

  const baseFare =
    (fareOnward?.PublishedPrice || 0) + (fareReturn?.PublishedPrice || 0);

  const serviceCharge =
    getServiceCharge(fareOnward?.PublishedPrice || 0) +
    getServiceCharge(fareReturn?.PublishedPrice || 0);

  const totalMeal = passengerSelections.reduce(
    (acc, p) => acc + (p?.meal?.Price || 0),
    0
  );
  const totalBaggage = passengerSelections.reduce(
    (acc, p) => acc + (p?.baggage?.Price || 0),
    0
  );
  const totalSeat = passengerSelections.reduce(
    (acc, p) => acc + (p?.seat?.Price || 0),
    0
  );

  const totalPay = (
    baseFare + serviceCharge + totalMeal + totalBaggage + totalSeat
  ).toFixed(2);

  const renderFareSection = (fareData, label) => {
    if (!fareData) return null;
    return (
      <>
        <h6 className="text-primary fw-bold mt-3 mb-1">{label} Fare</h6>
        <Row className="fare-row py-1">
          <Col>Base Fare</Col>
          <Col className="text-end">₹ {fareData?.Fare?.BaseFare}</Col>
        </Row>
        <Row className="fare-row py-1">
          <Col>Taxes</Col>
          <Col className="text-end">₹ {fareData?.Fare?.Tax || 0}</Col>
        </Row>
        <Row className="fare-row py-1">
          <Col>Other Charges</Col>
          <Col className="text-end">
            ₹ {(fareData?.Fare?.OtherCharges ?? 0).toFixed(2)}
          </Col>
        </Row>
        <Row className="fare-row py-1">
          <Col>Convenience Fee</Col>
          <Col className="text-end">
            ₹ {getServiceCharge(fareData?.PublishedPrice || 0).toFixed(2)}
          </Col>
        </Row>
      </>
    );
  };

  return (
    <Card className="fare-summary-card mb-3">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="px-3 py-2">
        {renderFareSection(fareOnward, 'Onward')}
        {fareReturn && renderFareSection(fareReturn, 'Return')}

        <Row className="fare-row py-1">
          <Col>GST (+)</Col>
          <Col className="text-end">₹ 0</Col>
        </Row>
        <Row className="fare-row py-1">
          <Col>Meal (+)</Col>
          <Col className="text-end">₹ {totalMeal.toFixed(2)}</Col>
        </Row>
        <Row className="fare-row py-1">
          <Col>Baggage (+)</Col>
          <Col className="text-end">₹ {totalBaggage.toFixed(2)}</Col>
        </Row>
        <Row className="fare-row py-1">
          <Col>Seat (+)</Col>
          <Col className="text-end">₹ {totalSeat.toFixed(2)}</Col>
        </Row>
      </Card.Body>

      <Card.Footer className="bg-light fw-bold d-flex justify-content-between">
        <span>Total Payable</span>
        <span>₹ {totalPay}</span>
      </Card.Footer>
    </Card>
  );
};

export default FareSummary;
