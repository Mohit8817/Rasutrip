// src/Components/FarePopup.js
import React from 'react';
import { Modal, Row, Col, Card, Button, Badge } from 'react-bootstrap';

const FarePopup = ({ show, onClose, fares = [] }) => {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Fare Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {fares.map((fare, index) => (
            <Col md={4} key={index}>
              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="text-danger">₹{fare.price}</h5>
                    {fare.refundable && (
                      <Badge bg="warning" text="dark">Refundable</Badge>
                    )}
                  </div>
                  <h6 className="fw-bold">{fare.type}</h6>
                  <p className="text-muted">({fare.subType})</p>

                  <hr />
                  <h6>Baggage</h6>
                  <p className="mb-1 text-success">✔ {fare.checkin}</p>
                  <p className="mb-2 text-success">✔ {fare.baggage} Check-In Baggage</p>

                  <h6>Flexibility</h6>
                  <p className="mb-1 text-danger">✖ Cancellation fees apply</p>
                  <p className="mb-2 text-danger">✖ Date change fees apply</p>

                  <h6>Seats & More</h6>
                  <p className="text-success">✔ Free Seat Selection</p>

                  <Button variant="primary" className="w-100 mt-2">Book Now</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default FarePopup;
