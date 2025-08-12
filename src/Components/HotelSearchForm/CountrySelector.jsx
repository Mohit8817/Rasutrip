import React, { useState, useEffect, useContext } from 'react';
import { Form, Card } from 'react-bootstrap';
import { getNames } from 'country-list';
import '../../Style/HotelSearchForm.css';
import { HotelSearchContext } from '../Context/HotelSearchContext'; // Context import

const CountrySelector = () => {
  const { hotelSearchData, setHotelSearchData } = useContext(HotelSearchContext);

  // Set initial country from context or default to 'India'
  const [country, setCountry] = useState(hotelSearchData.country || 'India');
  const countryNames = getNames();

  // Update context when country changes
  useEffect(() => {
    setHotelSearchData((prevData) => ({
      ...prevData,
      country: country
    }));
  }, [country, setHotelSearchData]);

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
