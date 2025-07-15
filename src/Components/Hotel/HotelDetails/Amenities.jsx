import React from "react";
import "./HotelDetails.css";

const Amenities = ({ facilities = [] }) => {
  // Group into rows of 3 amenities per row for layout consistency
  const chunkAmenities = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const groupedAmenities = chunkAmenities(facilities, 3);

  return (
    <div className="amenities-container mt-3">
      <h3 className="amenities-title">Amenities & Info</h3>
      <div className="amenities-grid">
        {groupedAmenities.map((row, rowIndex) =>
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
