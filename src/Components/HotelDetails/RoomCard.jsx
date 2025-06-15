import React from "react";
import "./HotelDetails.css";

const RoomCard = () => (
  <div className="room-card">
    <h2>Rooms:</h2>
    <p><strong>Apartment, 1 Queen Bed, Non Smoking, Kitchen</strong> - Package Deal</p>
    <p>Room Only</p>
    <p className="price">₹3936.16</p>
    <button className="book-btn">Book Now</button>
  </div>
);

export default RoomCard;
