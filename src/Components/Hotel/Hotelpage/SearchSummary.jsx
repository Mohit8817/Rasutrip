import React, { useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { HotelSearchContext } from "../../Context/HotelSearchContext";

const SearchSummary = () => {
  const { hotelSearchData } = useContext(HotelSearchContext);

  const {
    city = "—",
    checkIn = "—",
    checkOut = "—",
    nights = "—",
    guests = "—",             // Used in UI
    rooms = "—",              // Used in UI
    // adultsCount = 0,          // Used in payload only
    // childrenCount = 0,        // Used in payload only
    // roomDetails = [],         // Used in payload only
  } = hotelSearchData || {};

  return (
    <Container className="mt-4 p-3 bg-white shadow-sm rounded border">
      {/* Mobile Layout */}
      <div className="d-block d-md-none">
        {/* First Line: Check-In date | Check-Out date */}
        <div className="text-center mb-1 text-sm">
          <span className="fw-semibold">Check-In</span> <span className="text-muted">{checkIn}</span>
          <span className="mx-2">|</span>
          <span className="fw-semibold">Check-Out</span> <span className="text-muted">{checkOut}</span>
        </div>

        {/* Second Line: Nights number | Rooms & Guests */}
        <div className="text-center mb-2 text-sm">
          <span className="fw-semibold">Nights</span> <span className="text-muted">{nights}</span>
          <span className="mx-2">|</span>
          <span className="fw-semibold">Rooms & Guests</span> <span className="text-muted">
            {rooms} Room{rooms > 1 ? "s" : ""}, {guests} Guest{guests > 1 ? "s" : ""}
          </span>
        </div>

        {/* Button */}
        <div className="text-center">
          <Button className="btn-red w-full text-sm">Modify Search</Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <Row className="items-center text-left d-none d-md-flex">
        <Col md>
          <div className="fw-semibold">Check-In</div>
          <small className="text-muted">{checkIn}</small>
        </Col>

        <Col md>
          <div className="fw-semibold">Check-Out</div>
          <small className="text-muted">{checkOut}</small>
        </Col>

        <Col md>
          <div className="fw-semibold">Nights</div>
          <small className="text-muted">{nights}</small>
        </Col>

        <Col md>
          <div className="fw-semibold">Rooms & Guests</div>
          <small className="text-muted">
            {guests} Guest{guests > 1 ? "s" : ""}, {rooms} Room{rooms > 1 ? "s" : ""}
          </small>
        </Col>

        <Col md="auto" className="text-end">
          <Button className="btn-red">Modify Search</Button>
        </Col>
      </Row>
    </Container>


  );
};

export default SearchSummary;
