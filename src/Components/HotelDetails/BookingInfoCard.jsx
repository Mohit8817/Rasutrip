import React from "react";
import "./HotelDetails.css";

const BookingInfoCard = () => {
  return (
    <div className="booking-card-container">
      <div className="booking-info-row">
        <div className="icon-text">
          <img src="/icons/checkin.png" alt="Check In" />
          <div>
            <p className="label">Check In</p>
          </div>
        </div>
        <div className="info-text">
          <p className="bold">16 Jun,2025</p>
          <p className="subtext">Monday</p>
        </div>
      </div>

      <div className="booking-info-row">
        <div className="icon-text">
          <img src="/icons/night.png" alt="Night" />
          <p className="bold">1 Night</p>
        </div>
      </div>

      <div className="booking-info-row">
        <div className="icon-text">
          <img src="/icons/checkout.png" alt="Check Out" />
          <p className="label">Check Out</p>
        </div>
        <div className="info-text">
          <p className="bold">17 Jun,2025</p>
          <p className="subtext">Tuesday</p>
        </div>
      </div>

      <div className="booking-info-row">
        <div className="icon-text">
          <img src="/icons/room.png" alt="Rooms" />
          <p className="label">Rooms & Guests</p>
        </div>
        <div className="info-text">
          <p className="bold">1 Room 2 Guest</p>
        </div>
      </div>
    </div>
  );
};

export default BookingInfoCard;
