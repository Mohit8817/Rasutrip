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
  const handlePriceChange = (e) => {
    const newMin = parseFloat(e.target.value);
    onPriceChange([newMin, actualPriceRange[1]]);
  };

  const handleOperatorChange = (op) => {
    setSelectedOperators((prev) =>
      prev.includes(op) ? prev.filter((item) => item !== op) : [...prev, op]
    );
  };

  const handleBusTypeChange = (type) => {
    setSelectedBusTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
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
        <Button variant="link" className="p-0 text-decoration-none text-dark" onClick={handleReset}>
          Reset All
        </Button>
      </div>

      {/* Price Filter */}
      <div className="mb-4">
        <div className="filter-label mb-1">Min Price (INR)</div>
        <Form.Range
          min={actualPriceRange[0]}
          max={actualPriceRange[1]}
          step="1"
          value={priceRange[0]}
          onChange={handlePriceChange}
        />
        <div className="d-flex justify-content-between">
          <span>From ₹{priceRange[0]}</span>
          <span>To ₹{actualPriceRange[1]}</span>
        </div>
      </div>

      {/* Travel Operators */}
      <div className="mb-4">
        <div className="filter-label mb-1">Travel Operators</div>
        {availableOperators.map((op, index) => (
          <Form.Check
            key={index}
            type="checkbox"
            label={op}
            checked={selectedOperators.includes(op)}
            onChange={() => handleOperatorChange(op)}
          />
        ))}
      </div>

      {/* Bus Types */}
      <div className="mb-4">
        <div className="filter-label mb-1">Bus Types</div>
        {availableBusTypes.map((type, idx) => (
          <Form.Check
            key={idx}
            type="checkbox"
            label={type}
            checked={selectedBusTypes.includes(type)}
            onChange={() => handleBusTypeChange(type)}
          />
        ))}
      </div>
    </Card>
  );
};

export default BusSidebarFilter;
