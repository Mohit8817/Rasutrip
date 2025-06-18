import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import "./HotelDetails.css";

const BookingInfoCard = () => {
  return (

    <div className="p-3 card">
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col xs={2}>
              <img
                src="/icons/checkin.png"
                alt="Check In"
                width="30"
              />
            </Col>
            <Col>
              <div className="fw-bold">Check In</div>
              <div className="text-dark fw-semibold">19 Jun, 2025</div>
              <div className="text-muted small">Thursday</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body className="d-flex align-items-center">
          <img
            src="/icons/night.png"
            alt="Night"
            width="30"
            className="me-2"
          />
          <span className="fw-bold">1 Night</span>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col xs={2}>
              <img
                src="/icons/checkout.png"
                alt="Check Out"
                width="30"
              />
            </Col>
            <Col>
              <div className="fw-bold">Check Out</div>
              <div className="text-dark fw-semibold">20 Jun, 2025</div>
              <div className="text-muted small">Friday</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Row>
            <Col xs={2}>
              <img
                src="/icons/roomguest.png"
                alt="Room & Guests"
                width="30"
              />
            </Col>
            <Col>
              <div className="fw-bold">Rooms & Guests</div>
            </Col>
            <Col className="text-end">
              <span className="fw-bold">
                1 Room <span className="fw-normal">2 Guest</span>
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BookingInfoCard;
