import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css'; // Optional custom styles

const PassengerClass = () => {
  return (
    <Card className="passenger-class-box border rounded-4">
      <Card.Body className="">
        <div className="text-uppercase small fw-semibold text-secondary">
          Travellers & Class
        </div>
        <div className="fw-bold fs-6">2 Passenger</div>
        <div className="text-muted small">Any</div>
      </Card.Body>
    </Card>
  );
};

export default PassengerClass;
