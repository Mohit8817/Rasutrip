import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { LocationContext } from "../Context/LocationContext";
import { fetchBusCities } from "../APIS/BusApi/BusApis";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/BusBooking.css";

const Location = () => {
  const { locationData, setLocationData } = useContext(LocationContext);
  const [busCities, setBusCities] = useState([]);
  const [fromQuery, setFromQuery] = useState("Bangalore");
  const [toQuery, setToQuery] = useState("Hyderabad");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Set default values on load
  useEffect(() => {
    if (!locationData.bookingType || locationData.bookingType !== "bus") {
      setLocationData((prev) => ({
        ...prev,
        fromCity: "Bangalore",
        fromCityId: 8463,
        toCity: "Hyderabad",
        toCityId: 9573,
        bookingType: "bus",
      }));
    }
  }, []);

  // Fetch FROM cities
  useEffect(() => {
    if (fromQuery.length >= 2) {
      fetchBusCities(fromQuery)
        .then((data) => {
          setBusCities(data?.results || []);
        })
        .catch((err) => console.error("From city error:", err));
    }
  }, [fromQuery]);

  // Fetch TO cities
  useEffect(() => {
    if (toQuery.length >= 2) {
      fetchBusCities(toQuery)
        .then((data) => {
          setBusCities(data?.results || []);
        })
        .catch((err) => console.error("To city error:", err));
    }
  }, [toQuery]);

  const handleCitySelect = (field, city) => {
    const updatedData = {
      ...locationData,
      [field]: city.city_name, // Set name
      [`${field}Id`]: city.city_id, // Set city_id
    };

    setLocationData(updatedData);

    if (field === "fromCity") {
      setFromQuery(city.city_name);
      setShowFromDropdown(false);
    } else {
      setToQuery(city.city_name);
      setShowToDropdown(false);
    }
  };

  return (
    <Container>
      <div className="city-wrapper">
        <h6 className="fw-bold  text-start">Book Bus Ticket</h6>
        <Row className="g-2">
          {/* FROM City */}
          <Col md={6}>
            <div className="city-box position-relative ">
              <Form.Group controlId="fromCity">
                <Form.Label className="city-label">FROM</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter departure city"
                  className="border-0 fw-bold city-input"
                  value={fromQuery}
                  onChange={(e) => {
                    setFromQuery(e.target.value);
                    setShowFromDropdown(true);
                    setShowToDropdown(false);
                  }}
                  onClick={() => setShowFromDropdown(true)}
                />
                {showFromDropdown && busCities.length > 0 && (
                  <ul className="dropdown-list">
                    {busCities.map((city, idx) => (
                      <li
                        key={city._id}
                        className="dropdown-item"
                        onClick={() => handleCitySelect("fromCity", city)}
                      >
                        {city.city_name}
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </div>
          </Col>

          {/* TO City */}
          <Col md={6}>
            <div className="city-box position-relative">
              <Form.Group controlId="toCity">
                <Form.Label className="city-label">TO</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter destination city"
                  className="border-0 fw-bold city-input"
                  value={toQuery}
                  onChange={(e) => {
                    setToQuery(e.target.value);
                    setShowToDropdown(true);
                    setShowFromDropdown(false);
                  }}
                  onClick={() => setShowToDropdown(true)}
                />
                {showToDropdown && busCities.length > 0 && (
                  <ul className="dropdown-list">
                    {busCities.map((city, idx) => (
                      <li
                        key={city._id}
                        className="dropdown-item"
                        onClick={() => handleCitySelect("toCity", city)}
                      >
                        {city.city_name}
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Location;
