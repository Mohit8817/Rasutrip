import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css'; // Optional custom styles

const PassengerClass = () => {
  return (
    <Card className="passenger-class-box">
      <Card.Body className="">
        <div className="passenger-label">
          Travellers & Class
        </div>
        <div className="fw-bold fs-5">2 Passenger</div> 
        <div className="cabin-text">Any</div>
      </Card.Body>
    </Card>
  );
};

export default PassengerClass;
