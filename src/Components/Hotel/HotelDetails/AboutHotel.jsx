import React from "react";
import "./HotelDetails.css";

const AboutHotel = ({ description = "" }) => {
  return (
    <div className="about-container mt-3">
      <h3 className="about-title">About The Hotel</h3>
      {description ? (
        <p className="about-text">{description}</p>
      ) : (
        <p className="text-muted">Hotel description not available.</p>
      )}
    </div>
  );
};

export default AboutHotel;
