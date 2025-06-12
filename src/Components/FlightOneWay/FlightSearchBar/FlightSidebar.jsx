import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import '../../../Style/Pagescss/FlightResultsPage.css';

const FlightSidebar = () => {
    const [priceRange, setPriceRange] = useState([29617.58, 130327]);
    const [selectedDeparture, setSelectedDeparture] = useState('');
    const [selectedArrival, setSelectedArrival] = useState('');

    const timeSlots = [
        { label: '12AM-6AM', icon: 'bi-sunrise' },
        { label: '6AM-12PM', icon: 'bi-brightness-high' },
        { label: '12PM-6PM', icon: 'bi-sunset' },
        { label: '6PM-12AM', icon: 'bi-moon' },
    ];

    const renderTimeButtons = (selected, setSelected, name) => (
        <Row className="g-2 mb-3">
            {timeSlots.map((slot, index) => (
                <Col xs={6} key={index}>
                    <Button
                        variant={selected === slot.label ? 'light' : 'outline-light'}
                        className={`w-100 d-flex align-items-center justify-content-start border ${selected === slot.label ? 'selected-time' : ''} text-dark filter_day_night_btn`}
                        onClick={() => setSelected(slot.label)}
                    >
                        <i className={`bi ${slot.icon} me-2`} />
                        {slot.label}
                    </Button>
                </Col>
            ))}
        </Row>
    );

    return (
        <div>
            <Card className="p-3 filter-sidebar">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="fw-bold"><i className="bi bi-funnel-fill me-2" /> Filter Results</div>
                    <Button variant="link" className="p-0 text-decoration-none reset-link">Reset All</Button>
                </div>

                {/* Price Filter */}
                <div className="mb-4">
                    <div className="filter_label">Price</div>
                    <input
                        type="range"
                        min="29617.58"
                        max="130327"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                        className="form-range"
                    />
                    <div className="d-flex justify-content-between">
                        <div className='filter_label'>{priceRange[0]}</div>
                        <div className='filter_label'>{priceRange[1]}</div>
                    </div>
                </div>

                {/* Fare Type */}
                <div className="mb-4">
                    <div className="filter_label">Fare Type</div>
                    <Form.Check label="Refundable" />
                    <Form.Check label="Non Refundable" />
                </div>

                {/* Stop Filter */}
                <div className="mb-4">
                    <div className="filter_label">Stop</div>
                    <Form.Check label="Non Stop" />
                    <Form.Check label="1 Stop" />
                    <Form.Check label="2 Stop" />
                </div>

                {/* Departure Times */}
                <div className="mb-4">
                    <div className="filter_label">Departure Times</div>
                    {renderTimeButtons(selectedDeparture, setSelectedDeparture, 'departure')}
                </div>

                {/* Arrival Times */}
                <div className="mb-4">
                    <div className="filter_label">Arrival Times</div>
                    {renderTimeButtons(selectedArrival, setSelectedArrival, 'arrival')}
                </div>

                {/* Airlines */}
                <div className="mb-2">
                    <div className="filter_label">Airlines</div>
                    <Form.Check label="Ai Express" />
                    <Form.Check label="Air India" />
                    <Form.Check label=" Akasa Air" />
                    <Form.Check label="Indigo" />
                    <Form.Check label="Spicejet" />
                </div>
            </Card>
        </div>
    );
};

export default FlightSidebar;
