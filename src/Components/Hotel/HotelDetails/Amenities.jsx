import React from "react";

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

      {/* ✅ Internal CSS added here */}
      <style>
        {`
          .amenities-container {
            width: 100%;
            overflow: hidden;
          }

          .amenities-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .amenities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .amenity-item {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 0.95rem;
            text-align: center;
            word-wrap: break-word;
            overflow-wrap: anywhere;
          }
        `}
      </style>
    </div>
  );
};

export default Amenities;
