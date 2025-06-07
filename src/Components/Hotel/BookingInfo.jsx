import React from 'react';
import './BookingInfo.css';

const BookingInfo = () => {
  return (
    <div className="booking-info">
      <div className="booking-section">
        <p><strong>Check In</strong><br />08 Jun, 2025</p>
      </div>
      <div className="booking-section">
        <p><strong>1 Night</strong></p>
      </div>
      <div className="booking-section">
        <p><strong>Check Out</strong><br />09 Jun, 2025</p>
      </div>
      <div className="booking-section">
        <p><strong>Rooms & Guests</strong><br />1 Room 2 Guest</p>
      </div>
    </div>
  );
};

export default BookingInfo;
