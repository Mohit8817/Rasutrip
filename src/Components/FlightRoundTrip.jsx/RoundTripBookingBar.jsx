import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
  const onwardFare = selectedOnwardFare?.PublishedPrice || 0;
  const returnFare = selectedReturnFare?.PublishedPrice || 0;
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
        journeyType: 'roundtrip' // Added to identify trip type
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
      className="position-fixed left-0 bottom-0 w-100 bg-danger text-white py-1 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center shadow"
      style={{ zIndex: 1050 }}
    >
      {/* Onward Flight Info */}
      <div className="d-flex flex-column flex-sm-row align-items-center gap-3 mb-3 mb-md-0">
        <div className="me-3">
          <p className="mb-0 small">{onwardSeg?.Airline?.AirlineName || 'Onward Flight'}</p>
          <p className="mb-0 fw-semibold">
            {onwardSeg?.Origin?.AirportCode} {formatTime(onwardSeg?.Origin?.DepartTime)} ➝{' '}
            {onwardSeg?.Destination?.AirportCode} {formatTime(onwardSeg?.Destination?.ArrivalTime)}
          </p>
        </div>
        <div className="fw-bold fs-6">₹ {onwardFare.toLocaleString()}</div>
      </div>

      {/* Return Flight Info */}
      <div className="d-flex   flex-sm-row align-items-center gap-3 mb-3 mb-md-0">
        <div className="me-3">
          <p className="mb-0 small">{returnSeg?.Airline?.AirlineName || 'Return Flight'}</p>
          <p className="mb-0 fw-semibold">
            {returnSeg?.Origin?.AirportCode} {formatTime(returnSeg?.Origin?.DepartTime)} ➝{' '}
            {returnSeg?.Destination?.AirportCode} {formatTime(returnSeg?.Destination?.ArrivalTime)}
          </p>
        </div>
        <div className="fw-bold fs-6">₹ {returnFare.toLocaleString()}</div>
      </div>

      {/* Total Fare and Book Button */}
      <div className="text-center">
        <p className="mb-1 fw-bold fs-5">₹ {totalFare.toLocaleString()}</p>
        <button
          onClick={handleBook}
          className="btn btn-light w-fitcontent fw-semibold px-4 py-2 rounded-pill"
          disabled={!selectedOnward || !selectedReturn}
        >
          BOOK NOW
        </button>
      </div>
    </div>
  );
};

export default RoundTripBookingBar;