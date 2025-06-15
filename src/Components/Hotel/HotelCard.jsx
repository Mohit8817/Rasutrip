import React from "react";
import { useNavigate } from "react-router-dom";
import "./HotelListingPage.css";

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();

  // Guard clause: skip rendering if hotel is not defined
  if (!hotel) return null;

  const handleBookClick = () => {
    navigate(`/HotelDetailsPage/${hotel.id}`, { state: { hotel } });
  };

  return (
    <div className="hotel-card">
      <img
        src={hotel.image || "https://via.placeholder.com/300x200?text=No+Image"}
        alt={hotel.name || "Hotel"}
        className="hotel-img"
      />

      <div className="hotel-info">
        <h3>{hotel.name || "Hotel Name"}</h3>
        <p>{hotel.location || "Unknown Location"}</p>
        <div className="stars">
          {'★'.repeat(hotel.rating || 0)}
        </div>
      </div>

      <div className="hotel-price">
        <p>₹ {hotel.price || "N/A"}</p>
        <span>Per Night</span>
        <button onClick={handleBookClick}>Book</button>
      </div>
    </div>
  );
};

export default HotelCard;
