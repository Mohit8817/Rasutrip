// src/Components/FarePopup.js
import React from 'react';
import { Modal, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const FarePopup = ({ show, onClose, fares = [], searchToken }) => {
  const navigate = useNavigate();
  const journeyType = localStorage.getItem('tripType')
  const fareList = fares?.FareList || (Array.isArray(fares) ? fares : []);

  const handleBook = (selectedFare, fareData) => {
    localStorage.setItem('selectedFlight', JSON.stringify(fareData));
    localStorage.setItem('fareSummery', JSON.stringify(selectedFare));
    localStorage.setItem('selectedOnwardFlight', JSON.stringify(fareData));
    onClose(); // Close the modal
    navigate('/flight-details', {
      state: { SelectedFare: selectedFare, FareData: fareData, journeyType,fares }
    });
  };
  if (!fareList || fareList.length === 0) {
    return (
      <Modal show={show} onHide={onClose} size="lg" centered dialogClassName="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title>Fare Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <p>No fare options available</p>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered dialogClassName="custom-modal-width">
      <Modal.Header closeButton>
        <Modal.Title>Fare Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {fareList.map((fare, index) => (
            <Col md={4} key={index}>
              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="text-danger">
                      ₹{fare?.Fare?.BaseFare}
                      {/* ₹{fare?.OfferedPrice || fare?.PublishedPrice || fare?.Fare?.OfferedPrice || 0} */}
                    </h5>
                    {fare?.IsRefundable && (
                      <Badge bg="success" text="white">Refundable</Badge>
                    )}
                    {!fare?.IsRefundable && (
                      <Badge bg="secondary" text="white">Non-Refundable</Badge>
                    )}
                  </div>

                  <h6 className="fw-bold m-0">{fare?.CabinClass || 'Economy'}</h6>
                  <p className="text-muted small m-0">{fare?.FareType || 'Publish'}</p>

                  {/* Fare Breakdown */}
                  {/* <div className="mt-2 mb-3">
                    <small className="text-muted">
                      Base: ₹{fare?.Fare?.BaseFare || 0} +
                      Tax: ₹{fare?.Fare?.Tax || 0}
                    </small>
                  </div> */}

                  <hr />

                  {/* Baggage Information */}
                  <h6>Baggage</h6>
                  <p className="mb-1 text-success">
                    ✔ Cabin: {fare?.SeatBaggage?.[0]?.[0]?.Cabin === 'Included' ? '7 KG' : fare?.SeatBaggage?.[0]?.[0]?.Cabin || '7 KG'}
                  </p>
                  <p className="mb-2 text-success">
                    ✔ Check-In: {fare?.SeatBaggage?.[0]?.[0]?.CheckIn === '0 KG' ? '20 KG' : fare?.SeatBaggage?.[0]?.[0]?.CheckIn || '20 KG'}
                  </p>

                  {/* Flexibility */}
                  <h6>Flexibility</h6>
                  {fare?.IsRefundable ? (
                    <>
                      <p className="mb-1 text-success">✔ Refundable with charges</p>
                      <p className="mb-2 text-warning">⚠ Date change fees apply</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-1 text-danger">✖ Non-refundable</p>
                      <p className="mb-2 text-danger">✖ Date change fees apply</p>
                    </>
                  )}

                  {/* Seats & More */}
                  <h6>Seats & More</h6>
                  <p className="text-muted small mb-2">
                    Seats Available: {fare?.SeatBaggage?.[0]?.[0]?.NoOfSeatAvailable || 'Limited'}
                  </p>
                  <p className="text-success small">✔ Free Seat Selection</p>

                  <Button
                    variant="danger"
                    className="w-100 mt-2"
                    onClick={() => handleBook(fare, fares)}
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