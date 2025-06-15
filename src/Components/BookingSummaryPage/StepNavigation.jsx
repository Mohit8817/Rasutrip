import React from 'react';
import './BookingSummaryPage.css';

const StepNavigation = () => {
  return (
    <div className="stepper-container">
      <div className="step-item">
        <div className="step-icon completed">🏨</div>
        <span className="step-label">Hotel Details</span>
      </div>
      <div className="step-line" />
      <div className="step-item">
        <div className="step-icon active">👤</div>
        <span className="step-label active-label">Guest Details</span>
      </div>
      <div className="step-line" />
      <div className="step-item">
        <div className="step-icon">📃</div>
        <span className="step-label">Review</span>
      </div>
      <div className="step-line" />
      <div className="step-item">
        <div className="step-icon">💳</div>
        <span className="step-label">Payment</span>
      </div>
    </div>
  );
};

export default StepNavigation;
