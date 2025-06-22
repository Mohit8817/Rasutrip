import React, { useState, useEffect, useRef, useContext } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { ArrowLeftRight } from 'react-bootstrap-icons';
import { FaPlane } from 'react-icons/fa';
import { LocationContext } from '../Context/LocationContext';
import { fetchLocationData } from '../FlightApi/FlightApi';
import '../../Style/FlightBooking.css';

const LocationInput = () => {
  const { locationData, setLocationData } = useContext(LocationContext);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromAirportData, setFromAirportData] = useState(null);
  const [toAirportData, setToAirportData] = useState(null);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  const fetchAirports = async (query) => {
    try {
      setLoading(true);
      const response = await fetchLocationData(query);
      setCityList(response?.results || []);
    } catch (error) {
      console.error('Error fetching airport data:', error);
      setCityList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDefaultAirports = async () => {
      try {
        const fromRes = await fetchLocationData(locationData.fromCity);
        if (fromRes?.results?.length) {
          const airport = fromRes.results[0];
          setFromAirportData(airport);
          setLocationData((prev) => ({
            ...prev,
            fromAirport: airport.name,
            fromCode: airport.code, // ✅ Save city code
          }));
        }

        const toRes = await fetchLocationData(locationData.toCity);
        if (toRes?.results?.length) {
          const airport = toRes.results[0];
          setToAirportData(airport);
          setLocationData((prev) => ({
            ...prev,
            toAirport: airport.name,
            toCode: airport.code, // ✅ Save city code
          }));
        }
      } catch (error) {
        console.error('Error fetching default airport data:', error);
      }
    };

    fetchDefaultAirports();
  },[]);

  const handleSwitch = () => {
    setLocationData((prev) => ({
      ...prev,
      fromCity: prev.toCity,
      toCity: prev.fromCity,
      fromAirport: prev.toAirport,
      toAirport: prev.fromAirport,
      fromCode: prev.toCode, // ✅ Switch codes
      toCode: prev.fromCode,
    }));
    const temp = fromAirportData;
    setFromAirportData(toAirportData);
    setToAirportData(temp);
  };

  const handleCitySelect = (cityObj, type) => {
    const formattedValue = `${cityObj.city_name}`;

    setLocationData((prev) => ({
      ...prev,
      ...(type === 'from'
        ? {
            fromCity: formattedValue,
            fromAirport: cityObj.name,
            fromCode: cityObj.code, // ✅ Save code
          }
        : {
            toCity: formattedValue,
            toAirport: cityObj.name,
            toCode: cityObj.code, // ✅ Save code
          }),
    }));

    if (type === 'from') {
      setFromAirportData(cityObj);
      setShowFromDropdown(false);
    } else {
      setToAirportData(cityObj);
      setShowToDropdown(false);
    }
  };

  const handleFromInputClick = () => {
    setShowFromDropdown(true);
    setShowToDropdown(false);
    if (locationData.fromCity) fetchAirports(locationData.fromCity);
  };

  const handleToInputClick = () => {
    setShowToDropdown(true);
    setShowFromDropdown(false);
    if (locationData.toCity) fetchAirports(locationData.toCity);
  };

  const handleClickOutside = (event) => {
    if (
      fromRef.current && !fromRef.current.contains(event.target) &&
      toRef.current && !toRef.current.contains(event.target)
    ) {
      setShowFromDropdown(false);
      setShowToDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e, type) => {
    const value = e.target.value;
    setLocationData((prev) => ({
      ...prev,
      ...(type === 'from'
        ? { fromCity: value, fromAirport: '', fromCode: '' }
        : { toCity: value, toAirport: '', toCode: '' }),
    }));

    if (value.length >= 2) {
      fetchAirports(value);
    } else {
      setCityList([]);
    }
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
            onChange={(e) => handleInputChange(e, 'from')}
            placeholder="Enter departure city"
          />
          <div className="location-airport">
            [{locationData.fromCode || fromAirportData?.code || '---'}] {locationData.fromAirport}
          </div>

          {showFromDropdown && (
            <div className="dropdown-list">
              {loading ? (
                <div className="dropdown-item text-muted">Loading...</div>
              ) : cityList.length === 0 ? (
                <div className="dropdown-item text-muted">No results found.</div>
              ) : (
                cityList.map((cityObj, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleCitySelect(cityObj, 'from')}
                  >
                    <FaPlane className="me-2" />
                    <strong>{cityObj.city_name}</strong> &nbsp;
                    <span>({cityObj.name})</span> &nbsp;
                    <span className="ms-auto">[{cityObj.code}]</span>
                  </div>
                ))
              )}
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
            onChange={(e) => handleInputChange(e, 'to')}
            placeholder="Enter arrival city"
          />
          <div className="location-airport">
            [{locationData.toCode || toAirportData?.code || '---'}] {locationData.toAirport}
          </div>

          {showToDropdown && (
            <div className="dropdown-list">
              {loading ? (
                <div className="dropdown-item text-muted">Loading...</div>
              ) : cityList.length === 0 ? (
                <div className="dropdown-item text-muted">No results found.</div>
              ) : (
                cityList.map((cityObj, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleCitySelect(cityObj, 'to')}
                  >
                    <FaPlane className="me-2" />
                    <strong>{cityObj.city_name}</strong> &nbsp;
                    <span>({cityObj.name})</span> &nbsp;
                    <span className="ms-auto">[{cityObj.code}]</span>
                  </div>
                ))
              )}
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default LocationInput;
