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
            departDate,
            passengers,
            cabinClass,
            tripType // ✅ make sure tripType is included
        } = locationData;

        switch (type) {
            case 'flight':
                navigate('/flight-results', {
                    state: {
                        fromCity,
                        toCity,
                        fromAirport,
                        toAirport,
                        departDate: departDate || new Date().toISOString(),
                         ...locationData, 
                        passengers,
                        cabinClass,
                        tripType: tripType || 'oneway' // ✅ default fallback
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
