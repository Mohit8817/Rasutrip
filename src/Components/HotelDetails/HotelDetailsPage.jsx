import React from "react";
import "./HotelDetails.css";

import Heading from "./Heading";
import ImageGallery from "./ImageGallery";
import BookingInfoCard from "./BookingInfoCard";
import RoomCard from "./RoomCard";
import Amenities from "./Amenities";
import AboutHotel from "./AboutHotel";

const HotelDetailsPage = () => {
  return (
    <div className="hotel-details-container">
      {/* Heading */}
      <Heading />

      {/* Main content layout */}
      <div className="hotel-main-content">
        {/* Left Column */}
        <div className="hotel-left-section">
          <ImageGallery />
          <RoomCard />
          <Amenities />
          <AboutHotel />
        </div>

        {/* Right Column */}
        <div className="hotel-right-section">
          <BookingInfoCard />
          {/* Optional: Add Google Map or static placeholder */}
          <div className="map-placeholder">
            <iframe
              title="hotel-map"
              width="100%"
              height="200"
              frameBorder="0"
              style={{ border: 0 }}
              src="https://maps.google.com/maps?q=Pilerne%20-%20Candolim%20Rd,%20Marra,%20India&t=&z=13&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsPage;
