import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import "../../../Style/Pagescss/BusResultPage.css";

const BusSidebarFilter = ({ actualPriceRange = [577.5, 5248.95], onPriceChange }) => {
  const [minPrice, setMinPrice] = useState(actualPriceRange[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [busTypeSearch, setBusTypeSearch] = useState("");

  const travelOperators = [
    "Avm Tours And Travels", "Bmcc Travels", "Jabbar Travels", "Dhanunjaya Travels",
    "Tranzindia Travels", "Solemn Travels"
  ];

  const busTypes = [
    "A/c Seater / Sleeper (2+2)", "Volvo Multi-axle A/c Sleeper (2+1)",
    "Volvo Multi Axle Sleeper Bl Ir (2+1)", "Benz A/c Sleeper (2+1)",
    "Mercedes Benz A/c Sleeper (2+1)", "Non Ac Seater (2+2)"
  ];

  const departureTimes = ["Morning", "Afternoon", "Evening", "Night"];

  const filteredOperators = travelOperators.filter(op =>
    op.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBusTypes = busTypes.filter(bt =>
    bt.toLowerCase().includes(busTypeSearch.toLowerCase())
  );

  const handlePriceChange = (e) => {
    const newMin = parseFloat(e.target.value);
    setMinPrice(newMin);
    onPriceChange([newMin, actualPriceRange[1]]);
  };

  const handleReset = () => {
    setMinPrice(actualPriceRange[0]);
    onPriceChange(actualPriceRange);
  };

  return (
    <Card className="bus-filter-sidebar p-3 shadow-sm">
      {/* Header */}
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
          value={minPrice}
          onChange={handlePriceChange}
        />
        <div className="d-flex justify-content-between">
          <span>From ₹{minPrice}</span>
          <span>To ₹{actualPriceRange[1]}</span>
        </div>
      </div>

      {/* Travel Operators (Static UI) */}
      <div className="mb-4">
        <div className="filter-label mb-1">Travel Operators</div>
        <Form.Control
          type="text"
          placeholder="Search Travel Operators"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
        <div>
          {filteredOperators.map((op, index) => (
            <Form.Check key={index} type="checkbox" label={op} disabled />
          ))}
        </div>
      </div>

      {/* Bus Type (Static UI) */}
      <div className="mb-4">
        <div className="filter-label mb-1">Bus Type</div>
        <Form.Control
          type="text"
          placeholder="Search Bus Type"
          value={busTypeSearch}
          onChange={(e) => setBusTypeSearch(e.target.value)}
          className="mb-2"
        />
        <div>
          {filteredBusTypes.map((type, idx) => (
            <Form.Check key={idx} type="checkbox" label={type} disabled />
          ))}
        </div>
      </div>

      {/* Departure Times (Static UI) */}
      <div>
        <div className="filter-label mb-1">Departure Times</div>
        {departureTimes.map((time, idx) => (
          <Form.Check key={idx} type="checkbox" label={time} disabled />
        ))}
      </div>
    </Card>
  );
};

export default BusSidebarFilter;
