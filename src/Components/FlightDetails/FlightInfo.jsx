import React from 'react';

const FlightInfo = () => {
  return (
    <div>
      <div className="review-header bg-light p-3 mb-3">
        <h5>Review Your Flight Details</h5>
      </div>

      <div className="flight-route bg-white p-3 mb-3 border position-relative">
        <strong className="text-success">Depart</strong> Delhi → <strong>Mumbai</strong><br />
        <small>Delhi | 0 Stops | 2 h 15 m</small>
        <button className="btn btn-sm btn-outline-primary position-absolute end-0 top-0 m-3">Fare Rules</button>
      </div>

      <div className="flight-card border p-3 bg-white">
        <div className="d-flex align-items-center mb-2">
          <img src="/spicejet-logo.png" alt="Spicejet" width="30" />
          <div className="ms-2">
            <strong>Spicejet</strong> | SG-8157 | Economy | <span className="text-success">Refundable</span>
          </div>
        </div>

        <div className="time-info d-flex justify-content-between">
          <div>
            <strong>06:10</strong><br />
            <small>20 Jun<br />Delhi (T3)</small>
          </div>
          <div className="text-center">
            <span>2 h 15 m</span><br />
            <span className="text-muted">0 Stops</span>
          </div>
          <div>
            <strong>08:25</strong><br />
            <small>20 Jun<br />Mumbai (T1)</small>
          </div>
        </div>

        <div className="mt-3">
          <strong>(Adult) Check-In:</strong> 15 Kg | <strong>Child:</strong> 7 Kg | <strong>Infant:</strong> 7 Kg<br />
          <strong>Fare Class:</strong> RS, <strong>Aircraft:</strong> 737
        </div>
      </div>
    </div>
  );
};

export default FlightInfo;
