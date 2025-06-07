import React from 'react';
import HotelImages from './HotelImages';
import BookingInfo from './BookingInfo';
import RoomCard from './RoomCard';

const HotelDetails = () => {
  return (
    <div className="hotel-container">
      <div className="hotel-left">
        <h2>ELIVAAS Kamerios Verano 1 BHK with Pool</h2>
        <p className="location">📍 Pilerne - Candolim Rd Marra India</p>
        <HotelImages />
        <RoomCard />
      </div>
      <div className="hotel-right">
        <BookingInfo />
      </div>
    </div>
  );
};

export default HotelDetails;
