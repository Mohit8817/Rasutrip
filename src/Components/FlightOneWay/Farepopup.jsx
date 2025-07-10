// src/Components/FarePopup.js
import React from 'react';
import { Modal, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const FarePopup = ({ show, onClose, fares = [], searchToken }) => {
  const navigate = useNavigate();

  const handleBook = (SelectedFare,FareData) => {
    onClose(); // Close the modal
    navigate('/flight-details', {
      state: { SelectedFare,FareData }
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered dialogClassName="custom-modal-width">
      <Modal.Header closeButton>
        <Modal.Title>Fare Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {fares?.FareList?.map((fare, index) => (
            <Col md={4} key={index}>
              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="text-danger">₹{fare?.Fare?.OfferedPrice}</h5>
                    {fare?.IsRefundable && (
                      <Badge bg="warning" text="dark">Refundable</Badge>
                    )}
                  </div>
                  <h6 className="fw-bold">{fare?.FareType}</h6>
                  <p className="text-muted">Class: {fare?.FareClass}</p>

                  <hr />
                  <h6>Baggage</h6>
                  <p className="mb-1 text-success">✔ Cabin: {fare?.SeatBaggage?.[0]?.[0]?.Cabin || 'N/A'}</p>
                  <p className="mb-2 text-success">✔ Check-In: {fare?.SeatBaggage?.[0]?.[0]?.CheckIn || 'N/A'}</p>

                  <h6>Flexibility</h6>
                  <p className="mb-1 text-danger">✖ Cancellation fees apply</p>
                  <p className="mb-2 text-danger">✖ Date change fees apply</p>

                  <h6>Seats & More</h6>
                  <p className="text-success">✔ Free Seat Selection</p>

                  <Button
                    variant="danger"
                    className="w-100 mt-2"
                    onClick={() => handleBook(fare,fares)}
                  >
                    Book Now
                  </Button>
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
