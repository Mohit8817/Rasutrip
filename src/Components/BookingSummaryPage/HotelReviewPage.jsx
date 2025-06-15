import React from "react";
import "./BookingSummaryPage.css";
import hotelImg from "../../assest/crd1.jpeg"; 

const HotelReviewPage = () => {
  return (
    <div className="review-page-container">
      <div className="hotel-summary-card">
        <h3 className="hotel-name">Eureka hotel, United Arab Emirates</h3>
        <p className="hotel-location">
          📍 Al rigga road, deira, p.o. box 64103deiradubai, dubai, 64103, united arab emirates
        </p>

        <div className="hotel-summary">
          <img src={hotelImg} alt="Hotel Room" className="summary-image" />

          <div className="summary-info">
            <div className="summary-row">
              <div>
                <strong>📅 Check-in</strong>
                <p>Dec, 2024<br />28, Sat</p>
              </div>
              <div>
                <strong>🌙 Nights</strong>
                <p>1</p>
              </div>
              <div>
                <strong>📅 Check-out</strong>
                <p>Dec, 2024<br />29, Sun</p>
              </div>
              <div>
                <strong>🛏️ Rooms & Guests</strong>
                <p>1 Room 2 Guest</p>
              </div>
            </div>

            <div className="summary-row">
              <div>
                <strong>Room Type</strong>
                <p>Standard double - king, 1 queen bed, nonsmoking</p>
              </div>
              <div>
                <strong>No. of Guests</strong>
                <p>2 Adult</p>
              </div>
              <div className="policy-link">
                <strong>Cancellation Policy</strong>
                <p><a href="#">Cancellation Policy</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Info */}
      <div className="guest-details-card">
        <h4>
          Primary Guest Details <span className="edit-icon">✎</span>
        </h4>
        <table>
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Contact No.</th>
              <th>Guest Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>sharmasimran91262@gmail.com</td>
              <td>91 7688888884</td>
              <td>Sim SH<br />Sim SH</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms & Payment */}
      <div className="terms-section">
        <label>
          <input type="checkbox" required /> I have read and accept the
          <a href="#"> Terms & Conditions.</a>
        </label>
      </div>

      <div className="payment-button">
        <button>Continue Payment</button>
      </div>
    </div>
  );
};

export default HotelReviewPage;
