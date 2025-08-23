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
      <Row className="items-center text-center md:text-left">
        {/* First Row on Mobile - Check-In & Check-Out */}
        <Col xs={6} md>
          <div className="fw-semibold">Check-In</div>
          <small className="text-muted">{checkIn}</small>
        </Col>

        <Col xs={6} md>
          <div className="fw-semibold">Check-Out</div>
          <small className="text-muted">{checkOut}</small>
        </Col>

        {/* Second Row on Mobile - Nights & Rooms/Guests */}
        <Col xs={6} md className="mt-2 md:mt-0">
          <div className="fw-semibold">Nights</div>
          <small className="text-muted">{nights}</small>
        </Col>

        <Col xs={6} md className="mt-2 md:mt-0">
          <div className="fw-semibold">Rooms & Guests</div>
          <small className="text-muted">
            {guests} Guest{guests > 1 ? "s" : ""}, {rooms} Room{rooms > 1 ? "s" : ""}
          </small>
        </Col>

        {/* Button - Full width on mobile, auto on desktop */}
        <Col xs={12} md="auto" className="text-center md:text-end mt-3 md:mt-0">
          <Button className="btn-red w-full md:w-auto">Modify Search</Button>
        </Col>
      </Row>
    </Container>


  );
};

export default SearchSummary;
