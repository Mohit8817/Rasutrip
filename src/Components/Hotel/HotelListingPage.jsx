import React from 'react';
import './HotelListingPage.css';
import FilterSidebar from './FilterSidebar';
import SearchSummary from './SearchSummary';
import SortBar from './SortBar';
import HotelList from './HotelList';

const HotelListingPage = () => {
  return (
    <div className="hotel-listing-container" style={{ display: 'flex' }}>
      {/* Left Sidebar */}
      <div style={{ width: '20%', padding: '10px' }}>
        <FilterSidebar />
      </div>

      {/* Main Content */}
      <div style={{ width: '80%', padding: '10px' }}>
        <SearchSummary />
        <SortBar />
        <HotelList />
      </div>
    </div>
  );
};

export default HotelListingPage;
