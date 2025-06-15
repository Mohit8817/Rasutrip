import React from 'react';
import './BookingSummaryPage.css';
import StepNavigation from './StepNavigation';
import HotelInfoCard from './HotelInfoCard';
import FareSummaryCard from './FareSummaryCard';
import PromoCodeCard from './PromoCodeCard';

const BookingSummaryPage = () => {
  return (
    <div className="booking-page-container">
      <StepNavigation />
      <div className="content-wrapper">
        <HotelInfoCard />
        <div className="side-panel">
          <FareSummaryCard />
          <PromoCodeCard />
        </div>
      </div>
      {/* <div className="bottom-bar">
        <button className="continue-btn">Continue Booking</button>
      </div> */}
    </div>
  );
};

export default BookingSummaryPage;
