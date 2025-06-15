import React from "react";
import "./BookingSummaryPage.css";
import StepNavigation from "./StepNavigation";
import GuestBookingForm from "./GuestBookingForm";
import FareSummaryCard from "./FareSummaryCard";
import PromoCodeCard from "./PromoCodeCard";

const GuestDetails = () => {
  return (
    <div className="booking-summary-container">
      {/* Progress bar */}
      <StepNavigation />

      {/* Main section layout */}
      <div className="booking-content">
        {/* Left Section: Guest Details */}
        <div className="guest-section">
          <GuestBookingForm />
        </div>

        {/* Right Section: Fare Summary & Promo Code */}
        <div className="summary-section">
          <FareSummaryCard />
          <PromoCodeCard />
        </div>
      </div>

      {/* Continue Button */}
      <div className="continue-button-container">
        <button className="continue-btn">Continue Booking</button>
      </div>
    </div>
  );
};

export default GuestDetails;
