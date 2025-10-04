import React from "react";
import { Card, Form, Button } from "react-bootstrap";
import "../../../Style/Pagescss/BusResultPage.css";

const BusSidebarFilter = ({
  actualPriceRange = [577.5, 5248.95],
  priceRange,
  onPriceChange,
  availableOperators = [],
  availableBusTypes = [],
  selectedOperators,
  setSelectedOperators,
  selectedBusTypes,
  setSelectedBusTypes,
}) => {
  // Handle single range change (only controls minimum price for now)
  // const handlePriceChange = (e) => {
  //   const newMin = parseFloat(e.target.value);
  //   // Keep max price as actualPriceRange[1] or allow user to set it
  //   onPriceChange([newMin, actualPriceRange[1]]);
  // };
  const handlePriceChange = (e) => {
    const newMax = parseFloat(e.target.value);
    onPriceChange([actualPriceRange[0], newMax]); // ✅ Max price change hoga
  };

  // Alternative: Handle range with input fields for precise control
  const handleMinInputChange = (e) => {
    const newMin = parseFloat(e.target.value) || actualPriceRange[0];
    if (newMin <= priceRange[1]) {
      onPriceChange([newMin, priceRange[1]]);
    }
  };

  const handleMaxInputChange = (e) => {
    const newMax = parseFloat(e.target.value) || actualPriceRange[1];
    if (newMax >= priceRange[0]) {
      onPriceChange([priceRange[0], newMax]);
    }
  };

  const handleOperatorChange = (op) => {
    setSelectedOperators((prev) =>
      prev.includes(op) ? prev.filter((item) => item !== op) : [...prev, op]
    );
  };

  const handleBusTypeChange = (type) => {
    setSelectedBusTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const handleReset = () => {
    onPriceChange(actualPriceRange);
    setSelectedOperators([]);
    setSelectedBusTypes([]);
  };

  return (
    <Card className="bus-filter-sidebar p-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-bold">
          <i className="bi bi-funnel-fill me-2" /> Filter Results
        </div>
        <Button
          variant="link"
          className="p-0 text-decoration-none text-dark"
          onClick={handleReset}
        >
          Reset All
        </Button>
      </div>

      {/* Price Filter */}
      <div className="mb-4">
        <div className="filter-label mb-2">Price Range (INR)</div>

        {/* Single Range Slider for Min Price */}
        <div className="mb-2">
          {/* <label className="form-label small">
            Minimum Price: ₹{Math.round(priceRange[0])}
          </label> */}
          <label className="form-label small">
            Maximum Price: ₹{Math.round(priceRange[1])}
          </label>

          {/* <Form.Range
            min={actualPriceRange[0]}
            max={priceRange[1]} // Max can't exceed current max selection
            step="10"
            value={priceRange[0]}
            onChange={handlePriceChange}
          /> */}
          <Form.Range
            min={actualPriceRange[0]}
            max={actualPriceRange[1]}
            step="10"
            value={priceRange[1]} // ✅ Max value show karo
            onChange={handlePriceChange}
          />
        </div>

        <div className="d-flex justify-content-between small text-muted">
          <span>₹{Math.round(actualPriceRange[0])}</span>
          <span>₹{Math.round(actualPriceRange[1])}</span>
        </div>
      </div>

      {/* Travel Operators */}
      <div className="mb-4">
        <div className="filter-label mb-2">Travel Operators</div>
        {availableOperators.length > 0 ? (
          <div>
            {availableOperators.map((op, index) => (
              <Form.Check
                key={index}
                type="checkbox"
                label={op}
                checked={selectedOperators.includes(op)}
                onChange={() => handleOperatorChange(op)}
                className="mb-1"
              />
            ))}
          </div>
        ) : (
          <div className="text-muted small">No operators available</div>
        )}
      </div>

      {/* Bus Types */}
      <div className="mb-4">
        <div className="filter-label mb-2">Bus Types</div>
        {availableBusTypes.length > 0 ? (
          <div>
            {availableBusTypes.map((type, idx) => (
              <Form.Check
                key={idx}
                type="checkbox"
                label={type}
                checked={selectedBusTypes.includes(type)}
                onChange={() => handleBusTypeChange(type)}
                className="mb-1"
              />
            ))}
          </div>
        ) : (
          <div className="text-muted small">No bus types available</div>
        )}
      </div>
    </Card>
  );
};

export default BusSidebarFilter;
