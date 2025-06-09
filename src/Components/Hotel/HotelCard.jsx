import React from 'react';
import './HotelList.css';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null; // prevents undefined access

  return (
    <div className="hotel-card">
      <img src={hotel.image} alt={hotel.name} className="hotel-image" />
      <div className="hotel-info">
        <h3 className="hotel-name">{hotel.name}</h3>
        <p className="hotel-location">{hotel.location}</p>
        <div className="hotel-rating">{'⭐'.repeat(hotel.rating)}</div>
      </div>
      <div className="hotel-booking">
        <h3 className="hotel-price">₹ {hotel.price.toFixed(2)}</h3>
        <p className="hotel-tax">+ ₹ {hotel.tax.toFixed(2)} taxes & fees</p>
        <button className="book-button">Book</button>
      </div>
    </div>
  );
};


export default HotelCard;
