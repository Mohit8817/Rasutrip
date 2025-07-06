// SearchButton.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationContext } from '../Context/LocationContext';
import '../../Style/FlightBooking.css';

const SearchButton = ({ type }) => {
  const navigate = useNavigate();
  const { locationData } = useContext(LocationContext);

  const handleSearchClick = () => {
    const {
      fromCity,
      toCity,
      fromAirport,
      toAirport,
      fromCode,
      toCode,
      departDate,
      returnDate,
      passengers,
      cabinClass,
      tripType
    } = locationData;

    // Prevent search if cities are missing
    if (!fromCity || !toCity) {
      alert("Please select both From and To cities.");
      return;
    }

    const defaultDate = new Date().toISOString();

    switch (type) {
      case 'flight':
        navigate('/flight-results', {
          state: {
            fromCity,
            toCity,
            fromAirport,
            toAirport,
            fromCode,
            toCode,
            departDate: departDate || { PreferredTime: defaultDate },
            returnDate: returnDate || null,
            passengers: passengers || 1,
            cabinClass: cabinClass || 'Economy',
            tripType: tripType || 'oneway'
          }
        });
        break;

      case 'bus':
        navigate('/bus-results', {
          state: {
            fromCity,
            toCity,
            departDate: departDate || defaultDate
          }
        });
        break;

      case 'hotel':
        navigate('/hotel-results');
        break;

      default:
        console.warn('Unknown search type:', type);
    }
  };

  return (
    <div>
      <button className="Mybutton" onClick={handleSearchClick}>
        Search
      </button>
    </div>
  );
};

export default SearchButton;
