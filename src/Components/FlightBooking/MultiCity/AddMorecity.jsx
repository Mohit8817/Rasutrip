import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaPlane } from 'react-icons/fa';
import '../../../Style/FlightBooking.css'; // Your CSS

const cityList = [
    { city: 'Delhi', airport: 'Delhi Indira Gandhi Intl', code: 'DEL', flag: '🇮🇳' },
    { city: 'Mumbai', airport: 'Chhatrapati Shivaji', code: 'BOM', flag: '🇮🇳' },
    { city: 'Kolkata', airport: 'Netaji Subhas Chandra Bose Intl', code: 'CCU', flag: '🇮🇳' },
    { city: 'Bengaluru', airport: 'Bengaluru Intl Arpt', code: 'BLR', flag: '🇮🇳' },
    { city: 'Chennai', airport: 'Chennai Arpt', code: 'MAA', flag: '🇮🇳' },
    { city: 'Goa In', airport: 'Dabolim Arpt', code: 'GOI', flag: '🇮🇳' },
];

const AddMorecity = ({ onToCityChange }) => {
    const [fromCity, setFromCity] = useState('Origin');
    const [toCity, setToCity] = useState('Destination');

    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);

    const fromRef = useRef(null);
    const toRef = useRef(null);

    const handleCitySelect = (cityObj, type) => {
        if (type === 'from') {
            setFromCity(cityObj.city);
            setShowFromDropdown(false);
        } else {
            setToCity(cityObj.city);
            setShowToDropdown(false);

            if (onToCityChange) {
                onToCityChange(cityObj.city);
            }
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                fromRef.current &&
                !fromRef.current.contains(event.target) &&
                toRef.current &&
                !toRef.current.contains(event.target)
            ) {
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
        <div>
            <Card className="location-card position-relative">
                <Row className="g-0 align-items-center">

                    {/* FROM */}
                    <Col xs={6} className="location-box position-relative" ref={fromRef}>
                        <span className="location-label">From Airport</span>
                        <div
                            className={`location-city-text ${fromCity === 'Origin' ? 'default' : 'selected'}`}
                            onClick={handleFromInputClick}
                        >
                            {fromCity}
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

                    {/* TO */}
                    <Col xs={6} className="location-box position-relative" ref={toRef}>
                        <span className="location-label">To Airport</span>
                        <div
                            className={`location-city-text ${toCity === 'Destination' ? 'default' : 'selected'}`}
                            onClick={handleToInputClick}
                        >
                            {toCity}
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
        </div>
    );
};

export default AddMorecity;
