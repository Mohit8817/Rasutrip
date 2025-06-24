import React, { useContext } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { LocationContext } from '../../Components/Context/LocationContext';
import '../../Style/Pagescss/FlightResultsPage.css';

const RoundsearchBar = () => {
  const { locationData } = useContext(LocationContext);

  const {
    fromCity = 'Delhi',
    toCity = 'Mumbai',
    fromAirport = 'DEL',
    toAirport = 'BOM',
    departDate: departObj,
    returnDate: returnObj,
    passengers = { adults: 1, children: 0, infants: 0 },
    cabinClass = 1,
  } = locationData || {};

  // Extract PreferredTime from object
  const departDate = departObj?.PreferredTime || departObj || null;
  const returnDate = returnObj?.PreferredTime || returnObj || null;

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const dayName = date.toLocaleDateString('en-GB', {
      weekday: 'long',
    });
    return `${formatted}, ${dayName}`;
  };

  const formattedDepartDate = formatDate(departDate) || 'Not selected';
  const formattedReturnDate = formatDate(returnDate) || 'Not selected';

  // Cabin class label mapping
  const cabinClassLabelMap = {
    1: 'Economy',
    2: 'Premium Economy',
    4: 'Business',
    5: 'First',
  };

  const selectedCabinLabel = cabinClassLabelMap[cabinClass] || 'Not selected';

  return (
    <div>
      <Container className="p-3 bg-white shadow-sm rounded border mt-5 overflow-auto">
        <Row className="flex-nowrap align-items-center text-center text-md-start">
          <Col style={{ minWidth: '200px' }}>
            <strong>{fromAirport}</strong>
            <div className="text-muted small">{fromCity}</div>
          </Col>

          <Col style={{ minWidth: '10px' }} className="text-center">
            <div style={{ fontSize: '20px' }}>→</div>
          </Col>

          <Col style={{ minWidth: '200px' }}>
            <strong>{toAirport}</strong>
            <div className="text-muted small">{toCity}</div>
          </Col>

          <Col style={{ minWidth: '180px' }} className="text-start">
            <div><strong>Departure</strong></div>
            <div className="text-muted small">{formattedDepartDate}</div>
          </Col>

          <Col style={{ minWidth: '180px' }}>
            <div><strong>Return</strong></div>
            <div className="text-muted small">{formattedReturnDate}</div>
          </Col>

          <Col style={{ minWidth: '20px' }}>
            <div><strong>Travellers</strong></div>
            <div className="text-muted small">{totalPassengers}</div>
          </Col>

          <Col style={{ minWidth: '20px' }}>
            <div><strong>Travel Class</strong></div>
            <div className="text-muted small">{selectedCabinLabel}</div>
          </Col>

          <Col style={{ minWidth: '20px' }} className="text-end">
            <Button variant="primary" className="ModifyButton">
              Modify
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RoundsearchBar;
    