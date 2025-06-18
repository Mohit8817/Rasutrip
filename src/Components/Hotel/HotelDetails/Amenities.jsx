import React from "react";
import "./HotelDetails.css";

const Amenities = () => {
  const amenities = [
    ["Games", "Number of outdoor pools - 1", "Uncovered parking"],
    ["Spa services on site", "Wheelchair accessible — no", "No accessible shuttle"],
    ["Full-service spa", "Free self parking", "24-hour front desk"],
  ];

  return (
    <div className="amenities-container mt-3">
      <h3 className="amenities-title">Amenities & Info</h3>
      <div className="amenities-grid">
        {amenities.map((row, rowIndex) =>
          row.map((item, colIndex) => (
            <div className="amenity-item" key={`${rowIndex}-${colIndex}`}>
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Amenities;
