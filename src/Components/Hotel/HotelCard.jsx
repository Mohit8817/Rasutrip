import React from "react";
import "./HotelCard.css";

const HotelCard = ({ hotel }) => {
  return (
    <div className="hotel-card">
      <img src={hotel.image} alt={hotel.name} className="hotel-img" />
      <div className="hotel-info">
        <h3>{hotel.name}</h3>
        <p>{hotel.location}</p>
        <div className="stars">{'★'.repeat(hotel.rating)}</div>
      </div>
      <div className="hotel-price">
        <p>₹ {hotel.price}</p>
        <span>Per Night</span>
        <button>Book</button>
      </div>
    </div>
  );
};

export default HotelCard;
