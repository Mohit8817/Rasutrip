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
      returnDate, // ✅ include returnDate
      passengers,
      cabinClass,
      tripType
    } = locationData;

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
            departDate: departDate || { PreferredTime: new Date().toISOString() },
            returnDate: returnDate || null, // ✅ Pass returnDate if exists
            passengers,
            cabinClass,
            tripType: tripType || 'oneway'
          }
        });
        break;

      case 'bus':
        navigate('/bus-results');
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
