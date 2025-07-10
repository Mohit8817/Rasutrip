// src/Components/Bus/BusPage/BusDetailsCard.jsx
import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import "../../../Style/Pagescss/BusResultPage.css";

const BusDetailsCard = ({ bus, onSelect }) => (
  <Card className="bus-card shadow-sm mb-3 border-0">
    <Row className="g-0">
      {/* Left White Section */}
      <Col md={10}>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6 className="fw-bold">{bus.operator}</h6>
              <div>{bus.busType}</div>
              {bus.serviceName && (
                <div className="text-muted small mt-1">
                  <i className="bi bi-truck me-1" />
                  {bus.serviceName}
                </div>
              )}
            </Col>

            <Col md={2} className="text-start">
              <div className="fw-semibold fs-6">{bus.departDate}</div>
              <div className="fs-5 fw-bold">{bus.departTime}</div>
              <div>{bus.departLocation}</div>
            </Col>

            <Col md={4} className="text-center align-self-center">
              <div className="duration-box">{bus.duration}</div>
            </Col>

            <Col md={2} className="text-end">
              <div className="fw-semibold fs-6">{bus.arriveDate}</div>
              <div className="fs-5 fw-bold">{bus.arriveTime}</div>
              <div>{bus.arriveLocation}</div>
            </Col>
          </Row>

          <hr className="my-2" />

          <div className="d-flex justify-content-between align-items-center px-1">
            <div className="text-muted">Cancellation Policy</div>
            <small className="text-danger fw-semibold">
              <i className="bi bi-chair me-1" />
              {bus.seatsAvailable} Seats Available
            </small>
          </div>
        </Card.Body>
      </Col>

      {/* Right Grey Section: Price & Show Seats */}
      <Col md={2} className="price-panel d-flex flex-column p-3">
        <div className="text-center">
          <div className="text-muted small">Starting at</div>
          <div className="fs-5 fw-bold">{bus.price}</div>
          <Button className="btn-red mt-2" onClick={() => onSelect(bus)}>
            Show Seats
          </Button>
        </div>
      </Col>
    </Row>
  </Card>
);

export default BusDetailsCard;
