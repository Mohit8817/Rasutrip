import React, { useState, useEffect, useContext } from 'react';
import { Form, Card } from 'react-bootstrap';
import { getNames, getCode } from 'country-list'; // ✅ Import getCode also
import '../../Style/HotelSearchForm.css';
import { HotelSearchContext } from '../Context/HotelSearchContext';

const CountrySelector = () => {
  const { hotelSearchData, setHotelSearchData } = useContext(HotelSearchContext);

  // Set initial country from context or default to 'India'
  const [country, setCountry] = useState(hotelSearchData.country || 'India');
  const countryNames = getNames();

  // ✅ Update context when country changes - include both name and code
  useEffect(() => {
    const countryCode = getCode(country); // Get country code
    setHotelSearchData((prevData) => ({
      ...prevData,
      country: country,
      countryCode: countryCode || 'IN' // ✅ Add country code to context
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