import React, { useContext, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { LocationContext } from '../Context/LocationContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/BusBooking.css';

const Location = () => {
  const { locationData, setLocationData } = useContext(LocationContext);

  // ✅ Override only once for bus default
  useEffect(() => {
    if (
      locationData.fromCity === 'Delhi' &&
      locationData.toCity === 'Mumbai'
    ) {
      setLocationData((prev) => ({
        ...prev,
        fromCity: 'Bangalore',
        toCity: 'Hyderabad',
      }));
    }
  }, []);

  const handleChange = (e) => {
    setLocationData({
      ...locationData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container>
      <div className="city-wrapper">
        <h6 className="fw-bold mb-3 text-start">Book Bus Ticket</h6>
        <Row className="g-2">
          <Col md={6}>
            <div className="city-box">
              <Form.Group controlId="fromCity">
                <Form.Label className="city-label">FROM</Form.Label>
                <Form.Control
                  name="fromCity"
                  type="text"
                  placeholder="Bangalore"
                  className="border-0 fw-bold city-input"
                  value={locationData.fromCity || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </Col>

          <Col md={6}>
            <div className="city-box">
              <Form.Group controlId="toCity">
                <Form.Label className="city-label">TO</Form.Label>
                <Form.Control
                  name="toCity"
                  type="text"
                  placeholder="Hyderabad"
                  className="border-0 fw-bold city-input"
                  value={locationData.toCity || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Location;
