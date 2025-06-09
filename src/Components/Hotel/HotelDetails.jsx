import React, { useState } from 'react';
import './HotelDetails.css';
import villa1 from '../../assest/villa1.jpg';
import villa2 from '../../assest/villa2.jpg';
import villa3 from '../../assest/villa3.avif';

const HotelDetails = () => {
  const images = [villa1,villa2,villa3];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="hotel-details">
      <div className="hotel-header">
        <h2>Elivaas Kamerios Verano 1 Bhk With Pool</h2>
        <p className="location">📍 Pilerne - Candolim Rd Marra, India</p>
        <div className="stars">⭐⭐⭐</div>
      </div>

      <div className="hotel-body">
        <div className="image-section">
          <img className="main-img" src={selectedImage} alt="Hotel View" />
          <div className="thumbnails">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
                alt="thumb"
              />
            ))}
          </div>
        </div>

        {/* <div className="booking-info">
          <div className="info-box">
            <h4>Check In</h4>
            <p>09 Jun, 2025<br /><small>Monday</small></p>
          </div>
          <div className="info-box">
            <h4>🕒</h4>
            <p>1 Night</p>
          </div>
          <div className="info-box">
            <h4>Check Out</h4>
            <p>10 Jun, 2025<br /><small>Tuesday</small></p>
          </div>
          <div className="info-box">
            <h4>Rooms & Guests</h4>
            <p>1 Room, 2 Guests</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default HotelDetails;
