import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../../../Style/Pagescss/FlightResultsPage.css'; // Optional for custom styling

const FlightSearchBar = () => {
  return (
    <Container className="p-3 bg-white shadow-sm rounded border mt-3">
      <Row className="align-items-center text-center text-md-start">
        <Col md={1} xs={6} className="mb-2 mb-md-0">
          <div><strong>DEL</strong></div>
          <div className="text-muted small">Delhi</div>
        </Col>

        <Col md={1} className="mb-2 mb-md-0">
          <div style={{ fontSize: '20px' }}>→</div>
        </Col>

        <Col md={1} xs={6} className="mb-2 mb-md-0">
          <div><strong>BOM</strong></div>
          <div className="text-muted small">Mumbai</div>
        </Col>

        <Col md={2} xs={6} className="mb-2 mb-md-0">
          <div><strong>Departure</strong></div>
          <div className="text-muted small">12 Jun ’2025, Thursday</div>
        </Col>

        <Col md={2} xs={6} className="mb-2 mb-md-0">
          <div><strong>Travellers</strong></div>
          <div className="text-muted small">3</div>
        </Col>

        <Col md={2} xs={6} className="mb-2 mb-md-0">
          <div><strong>Travel Class</strong></div>
          <div className="text-muted small">Business</div>
        </Col>

        <Col md={3} xs={12} className="text-end">
          <Button className='ModifyButton'>
            Modify
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FlightSearchBar;
