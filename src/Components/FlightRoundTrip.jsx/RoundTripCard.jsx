import React from 'react';
import { Card, Row, Col, Form, Container } from 'react-bootstrap';
import moment from 'moment';

const safeText = (value) => value || 'N/A';
const formatTime = (time) => time ? moment(time).format('hh:mm A') : 'N/A';
const formatDate = (time) => time ? moment(time).format('DD MMM YYYY') : 'N/A';

const RoundTripCard = ({ flight, selectedFare, onSelect, type }) => {
  const segment = flight?.Segments?.[0]?.[0];
  const {
    Airline,
    Origin,
    Destination,
    TotalDuration
  } = segment || {};
  const fareList = flight?.FareList || [];

  return (
    <Container className="mb-4">
      <Row>
        <Col md={12}>
          <Card
            role="button"
            tabIndex={0}
            // onClick={() => onSelect(flight, selectedFare)}
            className={`shadow-sm p-3 round-trip-card ${selectedFare?.FareID ? 'border-primary border-2' : ''}`}
          >
            <Row className="align-items-center">
              <Col md={3} className="text-center">
                <div className="fw-bold mt-1">
                  {safeText(Airline?.AirlineName)}
                </div>
                <div className="text-muted small">
                  {safeText(Airline?.FlightNumber)}
                </div>
              </Col>

              <Col md={3} className="text-center">
                <div className="fw-bold fs-5">{safeText(Origin?.AirportCode)}</div>
                <div className="fw-semibold">{formatTime(Origin?.DepartTime)}</div>
                <div className="text-muted small">{formatDate(Origin?.DepartTime)}</div>
              </Col>

              <Col md={3} className="text-center">
                <div className="text-muted">Non Stop</div>
                <div className="my-1">
                  <span className="dot"></span>
                  <span className="line"></span>
                  <span className="dot"></span>
                </div>
                <div>{TotalDuration ? `${TotalDuration} mins` : 'N/A'}</div>
              </Col>

              <Col md={3} className="text-center">
                <div className="fw-bold fs-5">{safeText(Destination?.AirportCode)}</div>
                <div className="fw-semibold">{formatTime(Destination?.ArrivalTime)}</div>
                <div className="text-muted small">{formatDate(Destination?.ArrivalTime)}</div>
              </Col>
            </Row>

            <small className="text-muted mt-2 d-block">
              Airline Remark: {safeText(fareList?.[0]?.AirlineRemark)}
            </small>

            <div className="fare-options mt-2">
              {fareList?.map((fare) => (
                <div
                  key={fare?.FareID || Math.random()}
                  onClick={onSelect(flight,fare)}
                  className="d-flex align-items-center justify-content-between py-2 border-bottom"
                >
                  <Form.Check
                    type="radio"
                    name={`${type}-flight-${flight?.ResultIndex}`}
                    className="me-2"
                    onChange={() => onSelect(flight, fare)}
                    checked={selectedFare?.FareID === fare?.FareID}
                  />
                  <div className="me-auto">
                    <span className="fw-semibold">
                      ₹ {fare?.PublishedPrice || 'N/A'}
                    </span>{' '}
                    <span className="badge bg-secondary text-uppercase me-2">
                      {fare?.FareType || ''}
                    </span>
                    <div className="text-muted small">
                      {fare?.CabinClass || 'N/A'},{' '}
                      <span className={fare?.IsRefundable ? 'text-success' : 'text-danger'}>
                        {fare?.IsRefundable ? 'Refundable' : 'Non Refundable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RoundTripCard;
