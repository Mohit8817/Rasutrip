import React from "react";
import "./FilterSidebar.css";

const FilterSidebar = () => {
  return (
    <div className="sidebar">
      <h3>Filter Results</h3>
      <div className="filter-section">
        <label>Price</label>
        <input type="range" min="4422.66" max="8254.23" />
      </div>
      <div className="filter-section">
        <label>Hotel Name</label>
        <input type="text" placeholder="Hotel Name" />
      </div>
      <div className="filter-section">
        <label>Star Rating</label>
        <div className="rating-options">
          <label><input type="checkbox" /> ★★★★★</label>
          <label><input type="checkbox" /> ★★★★☆</label>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;