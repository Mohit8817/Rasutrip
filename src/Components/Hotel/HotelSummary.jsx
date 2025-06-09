import React from 'react';
import './HotelSummary.css';
import villa1 from '../../assest/villa1.jpg';
const HotelSummary = () => {
  return (
    <div className="summary-container">
      <div className="stepper">
        <span className="step active">🏨 Hotel Details</span>
        <span className="step">👤 Guest Details</span>
        <span className="step">📝 Review</span>
        <span className="step">💳 Payment</span>
      </div>

      <h2 className="section-title">Review Your Hotel Details</h2>

      <div className="summary-body">
        <div className="left-box">
          <h3>Elivaas kamerios verano 1 bhk with pool, India</h3>
          <p className="location">📍 Pilerne - candolim rd marra india</p>

          <div className="hotel-info">
            <img src={villa1} alt="Bathroom" className="hotel-image" />
            <div className="details">
              <div><strong>Check-in:</strong> 09 Jun, 2025 (Mon)</div>
              <div><strong>Check-out:</strong> 10 Jun, 2025 (Tue)</div>
              <div><strong>Nights:</strong> 1</div>
              <div><strong>Rooms & Guests:</strong> 1 Room, 2 Guest</div>
              <div><strong>Room Type:</strong> Apartment, 1 queen bed, non smoking, kitchen - package deal</div>
              <div><strong>No. of Guests:</strong> 2 Adult</div>
              <div>
                <strong>Cancellation Policy:</strong>{' '}
                <a href="/" className="cancel-link">Cancellation Policy</a>
              </div>
            </div>
          </div>
        </div>

        <div className="right-box">
          <div className="fare-summary">
            <h4>Fare Summary</h4>
            <p><span>Base Fare</span><span>₹ 3890.42</span></p>
            <p><span>Tax</span><span>₹ 11.8</span></p>
            <p><span>Service Charges</span><span>₹ 0</span></p>
            <p><span>GST (+)</span><span>₹ 0</span></p>
            <hr />
            <p className="total"><span>Pay Amount</span><span>₹ 3902.22</span></p>
          </div>

          <div className="promo-code">
            <h4>Promo Code</h4>
            <input type="text" placeholder="Enter Your Promo Code" />
            <button>Apply</button>
          </div>
        </div>
      </div>

      <div className="book-button">
        <button>Continue Booking</button>
      </div>
    </div>
  );
};

export default HotelSummary;
