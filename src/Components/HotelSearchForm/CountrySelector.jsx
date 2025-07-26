import React, { useState } from 'react';
import { Form, Card } from 'react-bootstrap';
import { getNames } from 'country-list'; // ✅ import country list
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/HotelSearchForm.css';

const CountrySelector = () => {
    const [country, setCountry] = useState('India');
    const countryNames = getNames(); // ✅ get array of all country names

    return (
        <Card className="country-card">
            <Form.Group controlId="countrySelect">
                <Form.Label className="country_label">COUNTRY</Form.Label>
                <Form.Select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="fw-bold country-select border-0 p-0"
                >
                    {countryNames.map((countryName, index) => (
                        <option key={index} value={countryName}>
                            {countryName}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
        </Card>
    );
};

export default CountrySelector;
