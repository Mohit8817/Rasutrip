import React from 'react';
import './MultiCity.css'; // Your custom styles

const AddCityButton = ({ onClick }) => {
    return (
        <div>
            <button className="Citybutton" onClick={onClick}>
                Add City
            </button>
        </div>
    );
};

export default AddCityButton;
