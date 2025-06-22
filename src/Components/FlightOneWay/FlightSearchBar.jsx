import React, { useContext } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { LocationContext } from '../Context/LocationContext';
import '../../Style/Pagescss/FlightResultsPage.css';

const FlightSearchBar = () => {
  const { locationData } = useContext(LocationContext);

  const {
    fromCity = '',
    toCity = '',
    fromAirport = '',
    toAirport = '',
    departDate,
    passengers = { adults: 1, children: 0, infants: 0 },
    cabinClass = 2,
  } = locationData || {};

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  let formattedDate = 'Not selected';
  if (departDate?.PreferredTime) {
    const jsDate = new Date(departDate.PreferredTime);
    if (!isNaN(jsDate.getTime())) {
      formattedDate =
        jsDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        ', ' +
        jsDate.toLocaleDateString('en-GB', {
          weekday: 'long',
        });
    }
  }

  return (
    <Container className="p-3 bg-white shadow-sm rounded border mt-5">
      <Row className="align-items-center text-center text-md-start">
        <Col md={2} xs={6}>
          <strong>{fromAirport}</strong>
          <div className="text-muted small">{fromCity}</div>
        </Col>

        <Col md={1}>
          <div style={{ fontSize: '20px' }}>→</div>
        </Col>

        <Col md={2} xs={6}>
          <strong>{toAirport}</strong>
          <div className="text-muted small">{toCity}</div>
        </Col>

        <Col md={2} xs={6}>
          <div><strong>Departure Date</strong></div>
          <div className="text-muted small">{formattedDate}</div>
        </Col>

        <Col md={2} xs={6}>
          <div><strong>Travellers</strong></div>
          <div className="text-muted small">{totalPassengers}</div>
        </Col>

        <Col md={2} xs={6}>
          <div><strong>Travel Class</strong></div>
          <div className="text-muted small">{cabinClass}</div>
        </Col>

        <Col md={1} xs={12} className="text-end">
          <Button variant="primary" className="ModifyButton">
            Modify
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FlightSearchBar;
