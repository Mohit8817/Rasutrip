import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { ArrowLeftRight } from 'react-bootstrap-icons'; // Icon from react-bootstrap-icons
import { FaPlane } from 'react-icons/fa'; // Plane icon
import '../../Style/FlightBooking.css'; // Add your custom styles

const cityList = [
  { city: 'Delhi', airport: 'Delhi Indira Gandhi Intl', code: 'DEL', flag: '🇮🇳' },
  { city: 'Mumbai', airport: 'Chhatrapati Shivaji', code: 'BOM', flag: '🇮🇳' },
  { city: 'Kolkata', airport: 'Netaji Subhas Chandra Bose Intl', code: 'CCU', flag: '🇮🇳' },
  { city: 'Bengaluru', airport: 'Bengaluru Intl Arpt', code: 'BLR', flag: '🇮🇳' },
  { city: 'Chennai', airport: 'Chennai Arpt', code: 'MAA', flag: '🇮🇳' },
  { city: 'Goa In', airport: 'Dabolim Arpt', code: 'GOI', flag: '🇮🇳' },
];

const LocationInput = () => {
  const [fromCity, setFromCity] = useState('Delhi');
  const [toCity, setToCity] = useState('Mumbai');
  const [fromAirport, setFromAirport] = useState('Delhi Indira Gandhi Intl');
  const [toAirport, setToAirport] = useState('Chhatrapati Shivaji');

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  const handleSwitch = () => {
    setFromCity(toCity);
    setToCity(fromCity);
    setFromAirport(toAirport);
    setToAirport(fromAirport);
  };

  const handleCitySelect = (cityObj, type) => {
    if (type === 'from') {
      setFromCity(cityObj.city);
      setFromAirport(cityObj.airport);
      setShowFromDropdown(false);
    } else {
      setToCity(cityObj.city);
      setToAirport(cityObj.airport);
      setShowToDropdown(false);
    }
  };

  const handleFromInputClick = () => {
    setShowFromDropdown(true);
    setShowToDropdown(false);
  };

  const handleToInputClick = () => {
    setShowToDropdown(true);
    setShowFromDropdown(false);
  };

  // Click outside close logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fromRef.current &&
        !fromRef.current.contains(event.target) &&
        toRef.current &&
        !toRef.current.contains(event.target)
      ) {
        // Clicked outside both FROM and TO dropdown
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Card className="location-card position-relative">
      <Row className="g-0 align-items-center">
        {/* FROM */}
        <Col xs={5} className="location-box position-relative" ref={fromRef}>
          <span className="location-label">FROM</span>
          <input
            type="text"
            className="location-city form-control border-0 p-0"
            value={fromCity}
            onClick={handleFromInputClick}
            onChange={(e) => setFromCity(e.target.value)}   // Added this line
          />
          <div className="location-airport">[{fromCity === 'Delhi' ? 'DEL' : fromCity === 'Mumbai' ? 'BOM' : 'XXX'}] {fromAirport}</div>

          {showFromDropdown && (
            <div className="dropdown-list">
              {cityList.map((cityObj, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleCitySelect(cityObj, 'from')}
                >
                  <FaPlane className="me-2" />
                  <strong>{cityObj.city}</strong> &nbsp;
                  <span>({cityObj.airport})</span> &nbsp;
                  <span className="ms-auto">[{cityObj.code}] {cityObj.flag}</span>
                </div>
              ))}
            </div>
          )}
        </Col>


        {/* ICON */}
        <Col xs={2} className="text-center switch-icon-wrapper">
          <div className="switch-icon" style={{ cursor: 'pointer' }} onClick={handleSwitch}>
            <ArrowLeftRight size={20} />
          </div>
        </Col>

        {/* TO */}
        <Col xs={5} className="location-box position-relative" ref={toRef}>
          <span className="location-label">TO</span>
          <input
            type="text"
            className="location-city form-control border-0 p-0"
            value={toCity}
            onClick={handleToInputClick}
            onChange={(e) => setToCity(e.target.value)}    // Added this line
          />
          <div className="location-airport">[{toCity === 'Delhi' ? 'DEL' : toCity === 'Mumbai' ? 'BOM' : 'XXX'}] {toAirport}</div>

          {showToDropdown && (
            <div className="dropdown-list">
              {cityList.map((cityObj, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleCitySelect(cityObj, 'to')}
                >
                  <FaPlane className="me-2" />
                  <strong>{cityObj.city}</strong> &nbsp;
                  <span>({cityObj.airport})</span> &nbsp;
                  <span className="ms-auto">[{cityObj.code}] {cityObj.flag}</span>
                </div>
              ))}
            </div>
          )}
        </Col>

      </Row>
    </Card>
  );
};

export default LocationInput;
