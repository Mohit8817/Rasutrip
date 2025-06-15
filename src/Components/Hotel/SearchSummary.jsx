import React from 'react';
import './HotelListingPage.css';

const SearchSummary = () => {
  return (
    <div className="search-summary">
      <div><strong>📍 SAIPEM, GOA, INDIA</strong></div>
      <div>Check-In <strong>16 Jun 25</strong></div>
      <div>Nights <strong>1</strong></div>
      <div>Check-Out <strong>17 Jun 25</strong></div>
      <div>Rooms & Guests <strong>2 Guest, 1 Rooms</strong></div>
      <button className="modify-btn">Modify Search</button>
    </div>
  );
};

export default SearchSummary;
