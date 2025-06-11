import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationContext } from '../Context/LocationContext';
import '../../Style/FlightBooking.css';

const SearchButton = ({ type }) => {
    const navigate = useNavigate();
    const { locationData } = useContext(LocationContext);
    const [departDate] = useState(new Date()); // default date, you can lift state here if needed

    const handleSearchClick = () => {
        switch (type) {
            case 'flight':
                navigate('/flight-results', {
                    state: {
                        ...locationData,
                        departDate: departDate?.toISOString(), // 🔥 Inject here
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
