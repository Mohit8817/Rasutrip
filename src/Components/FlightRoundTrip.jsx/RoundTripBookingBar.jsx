import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
 import { Container, Row, Col } from 'react-bootstrap';


const RoundTripBookingBar = () => {
  const navigate = useNavigate();

  // Get all selected flight data from Redux
  const {
    onward: selectedOnward,
    return: selectedReturn,
    selectedOnwardFare,
    selectedReturnFare
  } = useSelector((state) => state.selectedFlights);
  // Don't render if any required data is missing
  if (!selectedOnward || !selectedReturn || !selectedOnwardFare || !selectedReturnFare) {
    return null;
  }
  const onwardSeg = selectedOnward?.Segments?.[0]?.[0] || {};
  const returnSeg = selectedReturn?.Segments?.[0]?.[0] || {};
  const onwardFare = selectedOnwardFare?.Fare?.BaseFare || 0;
  const returnFare = selectedReturnFare?.Fare?.BaseFare || 0;
  const totalFare = onwardFare + returnFare;

  const handleBook = () => {
    navigate('/flight-details', {
      state: {
        SelectedFare: {
          onward: selectedOnwardFare,
          return: selectedReturnFare,
        },
        FareData: {
          onwardPrice: onwardFare,
          returnPrice: returnFare,
          totalPrice: totalFare
        },
        selectedFlights: {
          onward: selectedOnward,
          return: selectedReturn,
        },
        journeyType: 'roundtrip',
        fares:selectedOnwardFare
      },
    });
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(11, 16); // Extracts HH:MM from ISO string
  };


return (
  <div
    className="position-fixed left-0 bottom-0 w-100 bg-danger text-white py-2 shadow"
    style={{ zIndex: 1050 }}
  >
    <Container fluid>
      <Row className="align-items-center">
        {/* Onward Flight Info - Col-3 */}
        <Col col={2} className="mb-2 mb-md-0">
          <div className="text-center text-md-start">
            <p className="mb-0 small">{onwardSeg?.Airline?.AirlineName || 'Onward Flight'}</p>
            <p className="mb-0 fw-semibold small">
              {onwardSeg?.Origin?.AirportCode} {formatTime(onwardSeg?.Origin?.DepartTime)} ➝{' '}
              {onwardSeg?.Destination?.AirportCode} {formatTime(onwardSeg?.Destination?.ArrivalTime)}
            </p>
            <div className="fw-bold">₹ {onwardFare.toLocaleString()}</div>
          </div>
        </Col>

        {/* Return Flight Info - Col-3 */}
        <Col col={3} className="mb-2 mb-md-0">
          <div className="text-center text-md-start">
            <p className="mb-0 small">{returnSeg?.Airline?.AirlineName || 'Return Flight'}</p>
            <p className="mb-0 fw-semibold small">
              {returnSeg?.Origin?.AirportCode} {formatTime(returnSeg?.Origin?.DepartTime)} ➝{' '}
              {returnSeg?.Destination?.AirportCode} {formatTime(returnSeg?.Destination?.ArrivalTime)}
            </p>
            <div className="fw-bold">₹ {returnFare.toLocaleString()}</div>
          </div>
        </Col>

        {/* Total Fare - Col-3 */}
        <Col col={3} className="mb-2 mb-md-0">
          <div className="text-center">
            <p className="mb-0 small">Total Fare</p>
            <p className="mb-0 fw-bold fs-4">₹ {totalFare.toLocaleString()}</p>
          </div>
        </Col>

        {/* Book Button - Col-3 */}
        <Col col={3}>
          <div className="text-center">
            <button
              onClick={handleBook}
              className="btn btn-light fw-semibold px-4 py-2 rounded-pill w-100"
              disabled={!selectedOnward || !selectedReturn}
            >
              BOOK NOW
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
);
};

export default RoundTripBookingBar;