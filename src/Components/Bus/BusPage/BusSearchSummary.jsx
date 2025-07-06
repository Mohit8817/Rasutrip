import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const BusSearchSummary = () => {
  const { state } = useLocation();
  const { fromCity, toCity, departDate } = state || {};

  return (
    <Container className="mt-4 p-3 bg-white shadow-sm rounded border">
      <Row className="align-items-center text-center text-md-start">
        <Col md={3} sm={6} xs={12} className="mb-2 mb-md-0">
          <div><strong>From</strong></div>
          <div className="text-muted small">{fromCity || 'N/A'}</div>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-2 mb-md-0 border-start">
          <div><strong>To</strong></div>
          <div className="text-muted small">{toCity || 'N/A'}</div>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-2 mb-md-0 border-start">
          <div><strong>Date</strong></div>
          <div className="text-muted small">{new Date(departDate).toDateString()}</div>
        </Col>
        <Col md={3} sm={6} xs={12} className="text-md-end text-center mt-2 mt-md-0">
          <Button variant="danger" className="btn-red">
            Modify Search
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default BusSearchSummary;
