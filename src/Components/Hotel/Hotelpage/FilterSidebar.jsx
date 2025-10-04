import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";

const FilterSidebar = ({
  priceRange,
  actualPriceRange,
  onPriceChange,
  selectedRatings,
  onRatingChange,
  searchName,
  onSearchNameChange,
  hotelNames = [],
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // const handlePriceChange = (e) => {
  //   const newMin = parseFloat(e.target.value);
  //   onPriceChange([newMin, priceRange[1]]);
  // };
  const handlePriceChange = (e) => {
    const newMax = parseFloat(e.target.value);
    onPriceChange([actualPriceRange[0], newMax]); // ✅ Max price change hoga
  };

  const handleRatingToggle = (star) => {
    if (selectedRatings.includes(star)) {
      onRatingChange(selectedRatings.filter((r) => r !== star));
    } else {
      onRatingChange([...selectedRatings, star]);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    onSearchNameChange(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSelectSuggestion = (name) => {
    onSearchNameChange(name);
    setShowSuggestions(false);
  };

  const filteredSuggestions = hotelNames.filter((name) =>
    name.toLowerCase().includes(searchName.toLowerCase())
  );

  return (
    <Card className="p-3 filter-sidebar position-relative">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-bold">
          <i className="bi bi-funnel-fill me-2" /> Filter Results
        </div>
        <Button
          variant="link"
          className="p-0 text-decoration-none reset-link"
          onClick={() => {
            onPriceChange(actualPriceRange);
            onRatingChange([]);
            onSearchNameChange("");
          }}
        >
          Reset All
        </Button>
      </div>

      {/* Price Filter */}
      <div className="mb-4">
        <div className="filter_label">Price</div>
        {/* <input
          type="range"
          min={actualPriceRange[0]}
          max={actualPriceRange[1]}
          value={priceRange[0]}
          onChange={handlePriceChange}
          className="form-range"
        /> */}
        <input
          type="range"
          min={actualPriceRange[0]}
          max={actualPriceRange[1]}
          value={priceRange[1]} // ✅ Max value show karo
          onChange={handlePriceChange}
          className="form-range"
        />
        {/* <div className="d-flex justify-content-between">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div> */}
        <div className="d-flex justify-content-between">
          <span>₹{actualPriceRange[0]}</span>
          <span>Up to ₹{Math.round(priceRange[1])}</span>
        </div>
      </div>

      {/* Hotel Name Search with Dropdown */}
      <div className="mb-4 position-relative">
        <div className="filter_label">Hotel Name</div>
        <Form.Control
          type="text"
          placeholder="Hotel Name"
          value={searchName}
          onChange={handleNameChange}
          autoComplete="off"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            className="dropdown-menu show w-100 shadow-sm"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {filteredSuggestions.map((name, idx) => (
              <div
                key={idx}
                className="dropdown-item"
                style={{ cursor: "pointer" }}
                onClick={() => handleSelectSuggestion(name)}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Star Rating Filter */}
      <div className="mb-4">
        <div className="filter_label">Star Rating</div>
        {[5, 4, 3, 2, 1].map((star) => (
          <Form.Check
            key={star}
            type="checkbox"
            label={[...Array(star)].map((_, i) => (
              <i key={i} className="bi bi-star-fill text-warning"></i>
            ))}
            checked={selectedRatings.includes(star)}
            onChange={() => handleRatingToggle(star)}
          />
        ))}
      </div>

      {/* Location Filter (optional) */}
      <div className="mb-2">
        <div className="filter_label">Locations</div>
        <Form.Check label="None" />
      </div>
    </Card>
  );
};

export default FilterSidebar;
