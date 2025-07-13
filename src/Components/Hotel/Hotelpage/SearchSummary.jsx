import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import './HotelListingPage.css';

const SearchSummary = () => {
  const location = useLocation();
  const {
    city = ' ',
    checkIn = ' ',
    checkOut = ' ',
    guests = ' ',
    rooms = ' ',
    nights = ' '
  } = location.state || {};

  return (
    <Container className="mt-5 p-3 bg-white shadow-sm rounded border overflow-auto">
      <Row className="flex-nowrap align-items-center text-center text-md-start">

        <Col style={{ minWidth: '200px' }}>
          <div><strong>📍 {city}</strong></div>
        </Col>

        <Col style={{ minWidth: '150px' }}>
          <div><strong>Check-In</strong></div>
          <div className="text-muted small">{checkIn}</div>
        </Col>

        <Col style={{ minWidth: '100px' }}>
          <div><strong>Nights</strong></div>
          <div className="text-muted small">{nights}</div>
        </Col>

        <Col style={{ minWidth: '150px' }}>
          <div><strong>Check-Out</strong></div>
          <div className="text-muted small">{checkOut}</div>
        </Col>

        <Col style={{ minWidth: '180px' }}>
          <div><strong>Rooms & Guests</strong></div>
          <div className="text-muted small">{guests} Guest, {rooms} Room</div>
        </Col>

        <Col style={{ minWidth: '150px' }} className="text-end">
          <Button className="btn-red">
            Modify Search
          </Button>
        </Col>

      </Row>
    </Container>
  );
};

export default SearchSummary;
