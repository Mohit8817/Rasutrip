import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { ArrowLeftRight } from 'react-bootstrap-icons'; // Icon from react-bootstrap-icons
import '../../Style/FlightBooking.css'; // Add your custom styles

const LocationInput = () => {
  // State for fromCity and toCity
  const [fromCity, setFromCity] = useState('Delhi');
  const [toCity, setToCity] = useState('Mumbai');

  // State for fromAirport and toAirport (optional — agar aap airport name bhi swap karna chahte ho)
  const [fromAirport, setFromAirport] = useState('[DEL] Delhi Indira Gand...');
  const [toAirport, setToAirport] = useState('[BOM] Chhatrapati Shiv...');

  // Function to handle switch
  const handleSwitch = () => {
    // Swap cities
    setFromCity(toCity);
    setToCity(fromCity);

    // Swap airports
    setFromAirport(toAirport);
    setToAirport(fromAirport);
  };

  return (
    <Card className="location-card">
      <Row className="g-0 align-items-center">
        {/* FROM */}
        <Col xs={5} className="location-box">
          <span className="location-label">FROM</span>
          <input
            type="text"
            className="location-city form-control border-0 p-0"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
          />
          <div className="location-airport">{fromAirport}</div>
        </Col>

        {/* ICON */}
        <Col xs={2} className="text-center switch-icon-wrapper">
          <div className="switch-icon" style={{ cursor: 'pointer' }} onClick={handleSwitch}>
            <ArrowLeftRight size={20} />
          </div>
        </Col>

        {/* TO */}
        <Col xs={5} className="location-box">
          <span className="location-label">TO</span>
          <input
            type="text"
            className="location-city form-control border-0 p-0"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
          />
          <div className="location-airport">{toAirport}</div>
        </Col>
      </Row>
    </Card>
  );
};

export default LocationInput;
