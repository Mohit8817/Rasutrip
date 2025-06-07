import React from 'react';
import './RoomCard.css';

const RoomCard = () => {
  return (
    <div className="room-card">
      <p><strong>Apartment, 1 Queen Bed, Non Smoking, Kitchen</strong> - 1 Queen Bed - Package Deal</p>
      <p className="price">₹3941.6</p>
      <button className="book-now">Book Now</button>
    </div>
  );
};

export default RoomCard;
