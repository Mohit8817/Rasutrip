import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/FlightBooking.css'; // Add your custom styles

const SearchButton = () => {
    const navigate = useNavigate();

    const handleSearch = () => {
        navigate('/hotels'); // Make sure '/hotels' route is defined in your router
    };

    return (
        <div>
            <button className="Mybutton" onClick={handleSearch}>
                Search
            </button>
        </div>
    );
};

export default SearchButton;
