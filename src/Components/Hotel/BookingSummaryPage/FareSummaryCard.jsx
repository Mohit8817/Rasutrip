import React from 'react';
import './BookingSummaryPage.css';

const FareSummaryCard = () => (
  <div className="fare-card">
    <h4>Fare Summary</h4>
    <div className="fare-row"><span>Base Fare</span><span>₹ 3924.36</span></div>
    <div className="fare-row"><span>Tax</span><span>₹ 11.8</span></div>
    <div className="fare-row"><span>Service Charges</span><span>₹ 0</span></div>
    <div className="fare-row"><span>GST (+)</span><span>₹ 0</span></div>
    <hr />
    <div className="fare-row total"><span>Pay Amount</span><span>₹ 3936.16</span></div>
  </div>
);

export default FareSummaryCard;
