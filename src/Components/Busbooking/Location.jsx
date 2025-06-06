import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/BusBooking.css'; // Your custom styles

const Location = () => {
  return (
    <Container>
      <div className="city-wrapper">
        <h6 className="fw-bold mb-3 text-start">Book Bus Ticket</h6>
        <Row className="g-2">
          {/* FROM */}
          <Col md={6}>
            <div className="city-box">
              <Form.Group controlId="fromCity">
                <Form.Label className="city-label">FROM</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Bangalore"
                  className="border-0 fw-bold city-input"
                />
              </Form.Group>
            </div>
          </Col>

          {/* TO */}
          <Col md={6}>
            <div className="city-box">
              <Form.Group controlId="toCity">
                <Form.Label className="city-label">TO</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Hyderabad"
                  className="border-0 fw-bold city-input"
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
