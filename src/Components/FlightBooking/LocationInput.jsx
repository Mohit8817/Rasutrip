import React, { useState, useEffect, useRef, useContext } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { ArrowLeftRight } from 'react-bootstrap-icons';
import { FaPlane } from 'react-icons/fa';
import { LocationContext } from '../Context/LocationContext';
import '../../Style/FlightBooking.css';

const cityList = [
  { city: 'Delhi', airport: 'Delhi Indira Gandhi Intl', code: 'DEL', flag: '🇮🇳' },
  { city: 'Mumbai', airport: 'Chhatrapati Shivaji', code: 'BOM', flag: '🇮🇳' },
  { city: 'Kolkata', airport: 'Netaji Subhas Chandra Bose Intl', code: 'CCU', flag: '🇮🇳' },
  { city: 'Bengaluru', airport: 'Bengaluru Intl Arpt', code: 'BLR', flag: '🇮🇳' },
  { city: 'Chennai', airport: 'Chennai Arpt', code: 'MAA', flag: '🇮🇳' },
  { city: 'Goa In', airport: 'Dabolim Arpt', code: 'GOI', flag: '🇮🇳' },
];

const LocationInput = () => {
  const { locationData, setLocationData } = useContext(LocationContext);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  const handleSwitch = () => {
    setLocationData((prev) => ({
      ...prev,
      fromCity: prev.toCity,
      toCity: prev.fromCity,
      fromAirport: prev.toAirport,
      toAirport: prev.fromAirport,
    }));
  };

  const handleCitySelect = (cityObj, type) => {
    setLocationData((prev) => ({
      ...prev,
      ...(type === 'from'
        ? { fromCity: cityObj.city, fromAirport: cityObj.airport }
        : { toCity: cityObj.city, toAirport: cityObj.airport }),
    }));

    if (type === 'from') setShowFromDropdown(false);
    else setShowToDropdown(false);
  };

  const handleFromInputClick = () => {
    setShowFromDropdown(true);
    setShowToDropdown(false);
  };

  const handleToInputClick = () => {
    setShowToDropdown(true);
    setShowFromDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fromRef.current && !fromRef.current.contains(event.target) &&
        toRef.current && !toRef.current.contains(event.target)
      ) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIATACode = (city) => {
    const found = cityList.find(c => c.city === city);
    return found ? found.code : 'XXX';
  };

  return (
    <Card className="location-card position-relative">
      <Row className="g-0 align-items-center">
        {/* FROM */}
        <Col xs={5} className="location-box position-relative" ref={fromRef}>
          <span className="location-label">FROM</span>
          <input
            type="text"
            className="location-city form-control border-0 p-0"
            value={locationData.fromCity}
            onClick={handleFromInputClick}
            onChange={(e) =>
              setLocationData((prev) => ({
                ...prev,
                fromCity: e.target.value,
              }))
            }
          />
          <div className="location-airport">
            [{getIATACode(locationData.fromCity)}] {locationData.fromAirport}
          </div>

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

        {/* Switch Icon */}
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
            value={locationData.toCity}
            onClick={handleToInputClick}
            onChange={(e) =>
              setLocationData((prev) => ({
                ...prev,
                toCity: e.target.value,
              }))
            }
          />
          <div className="location-airport">
            [{getIATACode(locationData.toCity)}] {locationData.toAirport}
          </div>

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
