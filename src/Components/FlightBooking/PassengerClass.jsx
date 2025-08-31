import React, { useRef, useEffect, useContext, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css';
import { LocationContext } from '../Context/LocationContext';
import { useDispatch } from 'react-redux';

const PassengerClass = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { locationData, setLocationData } = useContext(LocationContext);
  const dispatch = useDispatch();
  const { passengers = { adults: 1, children: 0, infants: 0 }, cabinClass } = locationData;

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
    setLocationData(prev => {
      const newCount = Math.max(0, prev.passengers[type] + change);
      const currentPassengers = prev.passengers;
      const newPassengers = {
        ...currentPassengers,
        [type]: newCount
      };
      const totalCount = newPassengers.adults + newPassengers.children + newPassengers.infants;
      if (type === 'infants' && newCount > 1) {
        return prev;
      }
      if (totalCount > 9) {
        return prev; 
      }
      if (type === 'adults' && newCount < 1) {
        return prev;
      }
      
      return {
        ...prev,
        passengers: newPassengers
      };
    });
  };

  useEffect(() => {
    if (!locationData.cabinClass) {
      setLocationData(prev => ({
        ...prev,
        cabinClass: 1
      }));
    }
  }, [locationData]);

  const handleCabinChange = (value) => {
    setLocationData(prev => ({
      ...prev,
      cabinClass: value
    }));
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const cabinOptions = [
    { label: 'Economy', value: 1 },
    { label: 'Premium Economy', value: 2 },
    { label: 'Business', value: 4 },
    { label: 'First', value: 5 },
  ];

  const selectedCabinLabel = cabinOptions.find(opt => opt.value === cabinClass)?.label || 'Select';
  const isIncrementDisabled = (type) => {
    if (type === 'infants') {
      return passengers.infants >= 1;
    }
    return totalPassengers >= 9;
  };
  const isDecrementDisabled = (type) => {
    if (type === 'adults') {
      return passengers.adults <= 1;
    }
    return passengers[type] <= 0;
  };

  return (
    <div className="passenger-class-wrapper" ref={ref}>
      <Card className="passenger-class-box" onClick={toggleDropdown}>
        <Card.Body>
          <div className="passenger-label">Travellers & Class</div>
          <div className="fw-bold fs-5">{totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}</div>
          <div className="cabin-text">{selectedCabinLabel}</div>
        </Card.Body>
      </Card>

      {showDropdown && (
        <Card className="dropdown-box mt-2">
          <Card.Body>
            {['adults', 'children', 'infants'].map((type, idx) => {
              const labels = {
                adults: 'Adults',
                children: 'Children',
                infants: 'Infants',
              };
              const ages = {
                adults: '12+ Years',
                children: '2y - 12y',
                infants: 'Below 2y',
              };
              return (
                <div key={idx} className="d-flex justify-content-between align-items-center mb-3">
                  <div className='text-start'>
                    <div className="fw-semibold">{labels[type]}</div>
                    <div className="text-muted small">{ages[type]}</div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button 
                      variant="light" 
                      className="circle-btn" 
                      disabled={isDecrementDisabled(type)}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        updateCount(type, -1); 
                      }}
                    >
                      -
                    </Button>
                    <span className="mx-3">{passengers[type]}</span>
                    <Button 
                      variant="light" 
                      className="circle-btn" 
                      disabled={isIncrementDisabled(type)}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        updateCount(type, 1); 
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="fw-bold mb-3 mt-2 text-start">Cabin Class</div>
            {cabinOptions.map(option => (
              <div
                key={option.value}
                className="cabin-option"
                onClick={() => handleCabinChange(option.value)}
              >
                <div className={`custom-radio ${cabinClass === option.value ? 'checked' : ''}`} />
                <div className="cabin-label">{option.label}</div>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PassengerClass;
