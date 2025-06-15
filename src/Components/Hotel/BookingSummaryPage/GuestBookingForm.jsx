import React from 'react';
import './BookingSummaryPage.css';

const GuestBookingForm = () => {
  return (
    <div className="form-container">
      <div className="section">
        <h2>Guest Details</h2>
        <p>Please make sure you enter the Name as per your Government photo id.</p>
        <div className="room">
          <h3>Room 1</h3>

          {[1, 2].map((num) => (
            <div className="guest-row" key={num}>
              <label>Adult {num}</label>
              <div className="input-group">
                <select>
                  <option value="">Title</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                </select>
                <input type="text" placeholder="First Name" />
                <input type="text" placeholder="Last Name" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Contact Details</h2>
        <p><span className="icon">📧</span> Your ticket and flight details will be shared here</p>
        <div className="input-group">
          <select>
            <option>India (91)</option>
            <option>USA (1)</option>
            <option>UK (44)</option>
          </select>
          <input type="tel" placeholder="Mobile Number" />
          <input type="email" placeholder="Email" />
        </div>
      </div>

      <div className="section">
        <h2>Use GSTIN for this booking (Optional)</h2>
        <p>Claim credit of GST charges. Your taxes may get updated post submitting your GST details.</p>
        <button className="add-btn">ADD</button>
      </div>

      <button className="continue-btn">Continue Booking</button>
    </div>
  );
};

export default GuestBookingForm;
