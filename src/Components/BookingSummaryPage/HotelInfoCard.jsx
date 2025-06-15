import React from 'react';
import './BookingSummaryPage.css';

const HotelInfoCard = () => (
  <div className="hotel-info-card">
    <h3 className="section-title">Review Your Hotel Details</h3>
    <div className="hotel-box">
      <div className="hotel-title-row">
        <div>
          <h4>Elivaas kamerios verano 1 bhk with pool, India</h4>
          <p className="location">📍 Pilerne - candolim rd marra india</p>
        </div>
        <div className="star-rating">⭐⭐⭐⭐</div>
      </div>

      <div className="hotel-details-grid">
        <div className="hotel-image-wrapper">
          <img
            src="./images/card1.jpg"
            alt="Room"
            className="hotel-img"
          />
        </div>

        <div className="hotel-info-columns">
          <div className="info-item">
            <strong>🛎 Check-in:</strong>
            <div>Jun,2025<br />16,Mon</div>
          </div>
          <div className="info-item">
            <strong>🌙 Nights:</strong>
            <div>1</div>
          </div>
          <div className="info-item">
            <strong>📤 Check-out:</strong>
            <div>Jun,2025<br />17,Tue</div>
          </div>
          <div className="info-item">
            <strong>🛏 Rooms & Guests:</strong>
            <div>1 Room 2 Guest</div>
          </div>
          <div className="info-item">
            <strong>🏷 Room Type:</strong>
            <div>
              Apartment, 1 queen bed, non-smoking, kitchen - 1 queen bed - package deal
            </div>
          </div>
          <div className="info-item">
            <strong>🧍‍♂️ Guests:</strong>
            <div>2 Adult</div>
          </div>
          <div className="info-item">
            <strong>📄 Cancellation Policy:</strong>
            <div><a href="#">Cancellation Policy</a></div>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button className="continue-btn">Continue Booking</button>
      </div>
    </div>
  </div>
);

export default HotelInfoCard;
 