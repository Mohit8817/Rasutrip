import React from 'react';

const FareSummary = () => {
  return (
    <div className="fare-summary border p-3 bg-white mb-3">
      <h5>Fare Summary</h5>
      <hr />
      <div className="d-flex justify-content-between"><span>Base Fare</span><span>₹ 6616</span></div>
      <div className="d-flex justify-content-between"><span>Taxes</span><span>₹ 1028</span></div>
      <div className="d-flex justify-content-between"><span>Service Charges</span><span>₹ 0</span></div>
      <div className="d-flex justify-content-between"><span>GST (+)</span><span>₹ 0</span></div>
      <div className="d-flex justify-content-between"><span>Meal (+)</span><span>₹ 0</span></div>
      <div className="d-flex justify-content-between"><span>Baggage (+)</span><span>₹ 0</span></div>
      <div className="d-flex justify-content-between"><span>Seat (+)</span><span>₹ 0</span></div>
      <hr />
      <div className="d-flex justify-content-between fw-bold"><span>Pay Amount</span><span>₹ 7644</span></div>
    </div>
  );
};

export default FareSummary;
