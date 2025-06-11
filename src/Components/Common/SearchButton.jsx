import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/FlightBooking.css';

const SearchButton = ({ type }) => {
    const navigate = useNavigate();

    const handleSearchClick = () => {
        switch (type) {
            case 'flight':
                navigate('/flight-results');
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
