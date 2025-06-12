import React, { useRef, useEffect, useContext } from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css';
import { LocationContext } from '../Context/LocationContext'; // Adjust the path as needed

const PassengerClass = () => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const { locationData, setLocationData } = useContext(LocationContext);

  const { passengers, cabinClass } = locationData;

  const ref = useRef();

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCount = (type, change) => {
    setLocationData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + change)
      }
    }));
  };

  const handleCabinChange = (option) => {
    setLocationData(prev => ({
      ...prev,
      cabinClass: option
    }));
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <div className="passenger-class-wrapper" ref={ref}>
      <Card className="passenger-class-box" onClick={toggleDropdown}>
        <Card.Body>
          <div className="passenger-label">Travellers & Class</div>
          <div className="fw-bold fs-5">{totalPassengers} Passenger</div>
          <div className="cabin-text">{cabinClass}</div>
        </Card.Body>
      </Card>

      {showDropdown && (
        <Card className="dropdown-box mt-2">
          <Card.Body>
            {['adults', 'children', 'infants'].map((type, idx) => {
              const labels = {
                adults: 'Adults',
                children: 'Children',
                infants: 'Infant',
              };
              const ages = {
                adults: '12+ Years',
                children: '2y - 12y',
                infants: 'below 2y',
              };
              return (
                <div key={idx} className="d-flex justify-content-between align-items-center mb-3">
                  <div className='text-start'>
                    <div className="fw-semibold">{labels[type]}</div>
                    <div className="text-muted small">{ages[type]}</div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button variant="light" className="circle-btn" onClick={(e) => { e.stopPropagation(); updateCount(type, -1) }}>-</Button>
                    <span className="mx-3">{passengers[type]}</span>
                    <Button variant="light" className="circle-btn" onClick={(e) => { e.stopPropagation(); updateCount(type, 1) }}>+</Button>
                  </div>
                </div>
              );
            })}

            <div className="fw-bold mb-3 mt-2 text-start">Cabin Class</div>
            {['ANY', 'ECONOMY', 'BUSINESS', 'PREMIUM ECONOMY', 'PREMIUM BUSINESS', 'FIRST'].map(option => (
              <div key={option} className="cabin-option" onClick={() => handleCabinChange(option)}>
                <div className={`custom-radio ${cabinClass === option ? 'checked' : ''}`} />
                <div className="cabin-label">{option}</div>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PassengerClass;
