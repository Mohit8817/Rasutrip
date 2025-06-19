import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import "../../../Style/Pagescss/BusResultPage.css";

const BusSidebarFilter = () => {
    const [priceRange, setPriceRange] = useState([577.5, 5248.95]);
    const [searchTerm, setSearchTerm] = useState("");
    const [busTypeSearch, setBusTypeSearch] = useState("");

    const travelOperators = [
        "Avm Tours And Travels",
        "Bmcc Travels",
        "Jabbar Travels",
        "Dhanunjaya Travels",
        "Tranzindia Travels",
        "Solemn Travels",
        "Avm Tours And Travels",
        "Bmcc Travels",
        "Jabbar Travels",
        "Dhanunjaya Travels",
        "Tranzindia Travels",
        "Solemn Travels"
    ];

    const busTypes = [

        "A/c Seater / Sleeper (2+2)",
        "Volvo Multi-axle A/c Sleeper (2+1)",
        "Volvo Multi Axle Sleeper Bl Ir (2+1)",
        "Benz A/c Sleeper (2+1)",
        "Mercedes Benz A/c Sleeper (2+1)",
        "Volvo Multi Axle B9r A/c Sleeper (2+1)",
        "Non Ac Seater (2+2)",
        "A/c Sleeper (1 +1 +1)",
        "Volvo A/c Semi Sleeper (2+2)",
        "A/c Volvo Bl Ir Multi-axle Sleeper"
    ];

    const departureTimes = ["Morning", "Afternoon", "Evening", "Night"];

    const filteredOperators = travelOperators.filter(op =>
        op.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBusTypes = busTypes.filter(bt =>
        bt.toLowerCase().includes(busTypeSearch.toLowerCase())
    );

    return (
        <Card className="bus-filter-sidebar p-3 shadow-sm">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-bold"><i className="bi bi-funnel-fill me-2" /> Filter Results</div>
                <Button variant="link" className="p-0 text-decoration-none  text-dark">Reset All</Button>
            </div>

            {/* Price Range */}
            <div className="mb-4">
                <div className="filter-label mb-1">Price Range (INR)</div>
                <Form.Range
                    min="577.5"
                    max="5248.95"
                    step="1"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                />
                <Form.Range
                    min="577.5"
                    max="5248.95"
                    step="1"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                />
                <div className="d-flex justify-content-between">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                </div>
            </div>

            {/* Travel Operators */}
            <div className="mb-4">
                <div className="filter-label mb-1">Travel Operators</div>
                <Form.Control
                    type="text"
                    placeholder="Search Travel Operators"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                />
                <div className="">
                    {filteredOperators.map((op, index) => (
                        <Form.Check key={index} type="checkbox" label={op} />
                    ))}
                </div>
            </div>

            {/* Bus Type */}
            <div className="mb-4">
                <div className="filter-label mb-1">Bus Type</div>
                <Form.Control
                    type="text"
                    placeholder="Search Bus Type"
                    value={busTypeSearch}
                    onChange={(e) => setBusTypeSearch(e.target.value)}
                    className="mb-2"
                />
                <div className="">
                    {filteredBusTypes.map((type, idx) => (
                        <Form.Check key={idx} type="checkbox" label={type} />
                    ))}
                </div>
            </div>

            {/* Departure Times */}
            <div>
                <div className="filter-label mb-1">Departure Times</div>
                {departureTimes.map((time, idx) => (
                    <Form.Check key={idx} type="checkbox" label={time} />
                ))}
            </div>
        </Card>
    );
};

export default BusSidebarFilter;
