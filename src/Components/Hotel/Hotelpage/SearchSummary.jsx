import React, { useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { HotelSearchContext } from "../../Context/HotelSearchContext";

const SearchSummary = () => {
  const { hotelSearchData } = useContext(HotelSearchContext);

  const {
    city = "—",
    checkIn = "—",
    checkOut = "—",
    guests = "—",
    rooms = "—",
    nights = "—",
  } = hotelSearchData || {};

  return (
    <Container className="mt-4 p-3 bg-white shadow-sm rounded border">
      <Row className="flex-nowrap align-items-center text-center text-md-start">
        <Col style={{ minWidth: 200 }}>
          <strong>📍 {city}</strong>
        </Col>
        <Col style={{ minWidth: 140 }}>
          <div className="fw-semibold">Check-In</div>
          <small className="text-muted">{checkIn}</small>
        </Col>
        <Col style={{ minWidth: 80 }}>
          <div className="fw-semibold">Nights</div>
          <small className="text-muted">{nights}</small>
        </Col>
        <Col style={{ minWidth: 140 }}>
          <div className="fw-semibold">Check-Out</div>
          <small className="text-muted">{checkOut}</small>
        </Col>
        <Col style={{ minWidth: 180 }}>
          <div className="fw-semibold">Rooms & Guests</div>
          <small className="text-muted">
            {guests} Guest&nbsp;&bull;&nbsp;{rooms} Room
          </small>
        </Col>
        <Col className="text-end" style={{ minWidth: 150 }}>
          <Button className="btn-red">Modify Search</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchSummary;
