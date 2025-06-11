import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationContext } from '../Context/LocationContext';
import '../../Style/FlightBooking.css';

const SearchButton = ({ type }) => {
    const navigate = useNavigate();
    const { locationData } = useContext(LocationContext);

    const handleSearchClick = () => {
        switch (type) {
            case 'flight':
                navigate('/flight-results', {
                    state: {
                        ...locationData,
                        departDate: locationData.departDate || new Date().toISOString(), // ✅ Use context date
                    },
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
