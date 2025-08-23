import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { LocationContext } from '../../Context/LocationContext';

const BusSearchSummary = () => {
  const { state } = useLocation();
  const { locationData } = useContext(LocationContext); // Add this line

  // Get initial values from navigation state
  const { fromCity, toCity, fromCityId, toCityId } = state || {};

  // Use date from LocationContext (updated by calendar) instead of navigation state
  const departDate = locationData?.departDate || state?.departDate;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Container className="mt-4 p-3 bg-white shadow-sm rounded border">
      <Row className="align-items-center text-center text-md-start flex-nowrap overflow-auto">
        <Col xs="auto" md={3} className="mb-2 mb-md-0">
          <div><strong>From</strong></div>
          <div className="text-muted small">{fromCity || 'N/A'}</div>
        </Col>
        <Col xs="auto" md={3} className="mb-2 mb-md-0 border-start">
          <div><strong>To</strong></div>
          <div className="text-muted small">{toCity || 'N/A'}</div>
        </Col>
        <Col xs="auto" md={3} className="mb-2 mb-md-0 border-start">
          <div><strong>Date</strong></div>
          <div className="text-muted small">{formatDate(departDate)}</div>
        </Col>
        <Col xs="auto" md={3} className="text-md-end text-center mt-2 mt-md-0">
          <Button variant="danger" className="btn-red">
            Modify Search
          </Button>
        </Col>
      </Row>
    </Container>

  );
};

export default BusSearchSummary;