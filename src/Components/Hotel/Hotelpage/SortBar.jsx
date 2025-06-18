import React from 'react';
import './HotelListingPage.css';

const SortBar = () => {
  return (
    <div className="sort-bar">
      <span>Showing Result 5 of 5 Hotels</span>
      <select>
        <option>Sort By</option>
        <option>Hotel Name</option>
        <option>Price</option>
      </select>
    </div>
  );
};

export default SortBar;
