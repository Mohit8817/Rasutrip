import React, { useState } from "react";
import { Card, Form,Button } from "react-bootstrap";
import "./HotelListingPage.css";

const FilterSidebar = () => {
  const [priceRange, setPriceRange] = useState([3843.66, 4895.15]);

  return (
    <Card className="p-3 filter-sidebar">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-bold"><i className="bi bi-funnel-fill me-2" /> Filter Results</div>
        <Button variant="link" className="p-0 text-decoration-none reset-link">Reset All</Button>
      </div>

      {/* Price Filter */}
      <div className="mb-4">
        <div className="filter_label">Price</div>
        <input
          type="range"
          min="3843.66"
          max="4895.15"
          value={priceRange[0]}
          onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
          className="form-range"
        />
        <div className="d-flex justify-content-between">
          <span>{priceRange[0]}</span>
          <span>{priceRange[1]}</span>
        </div>
      </div>

      {/* Hotel Name Filter */}
      <div className="mb-4">
        <div className="filter_label">Hotel Name</div>
        <Form.Control type="text" placeholder="Hotel Name" />
      </div>

      {/* Star Rating Filter */}
      <div className="mb-4">
        <div className="filter_label">Star Rating</div>
        <Form.Check
          type="checkbox"
          label={
            <>
              {[...Array(5)].map((_, i) => <i key={i} className="bi bi-star-fill text-warning"></i>)}
            </>
          }
        />
        <Form.Check
          type="checkbox"
          label={
            <>
              {[...Array(4)].map((_, i) => <i key={i} className="bi bi-star-fill text-warning"></i>)}
            </>
          }
        />
      </div>

      {/* Location Filter */}
      <div className="mb-2">
        <div className="filter_label">Locations</div>
        <Form.Check label="None" />
      </div>
    </Card>
  );
};

export default FilterSidebar;
