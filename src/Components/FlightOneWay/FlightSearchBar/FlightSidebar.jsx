import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import '../../../Style/Pagescss/FlightResultsPage.css';

const FlightSidebar = () => {
    const [priceRange, setPriceRange] = useState([29617.58, 130327]);
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
                    <div className="mb-3">
                        <div>
                            <input
                                type="range"
                                min="29617.58"
                                max="130327"
                                value={priceRange[0]}
                                onChange={(e) =>
                                    setPriceRange([parseFloat(e.target.value), priceRange[1]])
                                }
                                className="form-range w-100"
                            />
                        </div>

                        <div className="d-flex justify-content-between">
                            <div className='filter_label'>{priceRange[0]}</div>
                            <div className='filter_label'>{priceRange[1]}</div>
                        </div>
                    </div>

                </div>

                {/* Fare Type */}
                <div className="mb-4">
                    <div className="filter_label">Fare Type</div>
                    <Form.Check label="Refundable" />
                    <Form.Check label="Non Refundable" />
                </div>

                {/* Stop Filter */}
                <div>
                    <div className="filter_label">Stop</div>
                    <Form.Check label="Non Stop" />
                    <Form.Check label="1 Stop" />
                </div>
            </Card>



        </div>
    )
}

export default FlightSidebar