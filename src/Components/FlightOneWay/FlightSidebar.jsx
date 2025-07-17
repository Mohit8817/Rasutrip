import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';

const FlightSidebar = ({ filters, setFilters }) => {
    const timeSlots = [
        { label: '12AM-6AM', icon: 'bi-sunrise', hours: [0, 6] },
        { label: '6AM-12PM', icon: 'bi-brightness-high', hours: [6, 12] },
        { label: '12PM-6PM', icon: 'bi-sunset', hours: [12, 18] },
        { label: '6PM-12AM', icon: 'bi-moon', hours: [18, 24] },
    ];

    const renderTimeButtons = (selectedTimeRange, name) => (
        <Row className="g-2 mb-3">
            {timeSlots.map((slot, index) => {
                const isSelected = selectedTimeRange && 
                    selectedTimeRange[0] === slot.hours[0] && 
                    selectedTimeRange[1] === slot.hours[1];
                
                return (
                    <Col xs={6} key={index}>
                        <Button
                            variant={isSelected ? 'light' : 'outline-light'}
                            className={`w-100 d-flex align-items-center justify-content-start border ${isSelected ? 'selected-time' : ''} text-dark filter_day_night_btn`}
                            onClick={() =>
                                setFilters(prev => ({
                                    ...prev,
                                    [name]: isSelected ? null : slot.hours // Toggle selection
                                }))
                            }
                        >
                            <i className={`bi ${slot.icon} me-2`} />
                            {slot.label}
                        </Button>
                    </Col>
                );
            })}
        </Row>
    );

    const handleAirlineChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            airlines: prev?.airlines?.includes(value)
                ? prev?.airlines.filter(a => a !== value)
                : [...(prev?.airlines || []), value]
        }));
    };

    const handleStopChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            stops: prev?.stops?.includes(value)
                ? prev?.stops.filter(s => s !== value)
                : [...(prev?.stops || []), value]
        }));
    };

    const handleRefundableChange = (e) => {
        const value = e.target.value;
        const isChecked = e.target.checked;
        setFilters(prev => ({
            ...prev,
            refundable: isChecked ? value : null
        }));
    };

    const handlePriceChange = (e) => {
        const value = parseFloat(e.target.value);
        setFilters(prev => ({
            ...prev,
            priceRange: [value, prev?.priceRange?.[1] || 10000]
        }));
    };

    return (
        <Card className="p-3 filter-sidebar" style={{"position": "sticky",
    "top": "104px",
    "overflow-y": "hidden"}}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-bold"><i className="bi bi-funnel-fill me-2" /> Filter Results</div>
                <Button variant="link" className="p-0 text-decoration-none reset-link" onClick={() => setFilters({
                    priceRange: [1000, 10000], // Updated based on your API response
                    refundable: null,
                    stops: [],
                    departureTime: null,
                    arrivalTime: null,
                    airlines: []
                })}>Reset All</Button>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
                <div className="filter_label">Price</div>
                <input
                    type="range"
                    min="1000"
                    max="10000"
                    value={filters?.priceRange?.[0] || 1000}
                    onChange={handlePriceChange}
                    className="form-range"
                />
                <div className="d-flex justify-content-between">
                    <div className='filter_label'>₹{filters?.priceRange?.[0] || 1000}</div>
                    <div className='filter_label'>₹{filters?.priceRange?.[1] || 10000}</div>
                </div>
            </div>

            {/* Fare Type */}
            <div className="mb-4">
                <div className="filter_label">Fare Type</div>
                <Form.Check 
                    type="radio"
                    label="Refundable" 
                    value="refundable" 
                    name="refundable"
                    onChange={handleRefundableChange} 
                    checked={filters?.refundable === "refundable"} 
                />
                <Form.Check 
                    type="radio"
                    label="Non Refundable" 
                    value="non-refundable" 
                    name="refundable"
                    onChange={handleRefundableChange} 
                    checked={filters?.refundable === "non-refundable"} 
                />
            </div>

            {/* Stop Filter */}
            <div className="mb-4">
                <div className="filter_label">Stop</div>
                <Form.Check label="Non Stop" value="0" onChange={handleStopChange} checked={filters?.stops?.includes("0")} />
                <Form.Check label="1 Stop" value="1" onChange={handleStopChange} checked={filters?.stops?.includes("1")} />
                <Form.Check label="2 Stop" value="2" onChange={handleStopChange} checked={filters?.stops?.includes("2")} />
            </div>

            {/* Departure Times */}
            <div className="mb-4">
                <div className="filter_label">Departure Times</div>
                {renderTimeButtons(filters?.departureTime, 'departureTime')}
            </div>

            {/* Arrival Times */}
            <div className="mb-4">
                <div className="filter_label">Arrival Times</div>
                {renderTimeButtons(filters?.arrivalTime, 'arrivalTime')}
            </div>

            {/* Airlines */}
            <div className="mb-2">
                <div className="filter_label">Airlines</div>
                {["Ai Express", "Air India", "Akasa Air", "Indigo", "Spicejet"].map((airline) => (
                    <Form.Check
                        key={airline}
                        label={airline}
                        value={airline}
                        onChange={handleAirlineChange}
                        checked={filters?.airlines?.includes(airline)}
                    />
                ))}
            </div>
        </Card>
    );
};

export default FlightSidebar;