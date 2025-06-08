import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Card } from 'react-bootstrap';
import '../../Style/HotelSearchForm.css'; // custom styles

const CountrySelector = () => {
    const [country, setCountry] = useState('India');

    return (
        <Card className="country-card   ">
            <Form.Group controlId="countrySelect">
                <Form.Label className="country_label">COUNTRY</Form.Label>
                <Form.Select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="fw-bold country-select border-0 p-0"
                >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                </Form.Select>
            </Form.Group>
        </Card>
    );
};

export default CountrySelector;
