import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Row, Col, Form, Card, Spinner, Table, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSeatLayout, fetchBoardingDroppingPoints } from "../../APIS/BusApi/BusApis";
import "../../../Style/Pagescss/BusResultPage.css";

// Enhanced SVG seat components with better styling
const SvgSeatIcon = ({ fill = "#f8f9fa", stroke = "#6c757d", isSelected = false, isBooked = false, isLadies = false }) => (
  <svg width="50" height="30" viewBox="0 0 60 60" style={{ filter: isSelected ? 'drop-shadow(0 2px 8px rgba(111, 168, 79, 0.3))' : 'none' }}>
    {/* Seat base */}
    <rect x="8" y="15" width="32" height="35" rx="6" ry="6"
      fill={fill} stroke={stroke} strokeWidth="2" />
    {/* Seat back */}
    <rect x="10" y="10" width="28" height="25" rx="4" ry="4"
      fill={fill} stroke={stroke} strokeWidth="2" />
    {/* Armrests */}
    <rect x="6" y="20" width="4" height="20" rx="2" ry="2"
      fill={fill} stroke={stroke} strokeWidth="1.5" />
    <rect x="38" y="20" width="4" height="20" rx="2" ry="2"
      fill={fill} stroke={stroke} strokeWidth="1.5" />
    {/* Ladies seat indicator */}
    {isLadies && (
      <circle cx="24" cy="22" r="3" fill="#fff" stroke="#ff1493" strokeWidth="2" />
    )}
  </svg>
);

const SvgUpperBerthIcon = ({ fill = "#f8f9fa", stroke = "#6c757d", isSelected = false, isBooked = false, isLadies = false }) => (
  <svg width="55" height="35" viewBox="0 0 60 40" style={{ filter: isSelected ? 'drop-shadow(0 2px 8px rgba(111, 168, 79, 0.3))' : 'none' }}>
    {/* Berth platform */}
    <rect x="5" y="15" width="50" height="20" rx="4" ry="4"
      fill={fill} stroke={stroke} strokeWidth="2" />
    {/* Pillow area */}
    <rect x="45" y="17" width="8" height="16" rx="2" ry="2"
      fill="#e9ecef" stroke={stroke} strokeWidth="1" />
    {/* Support bars */}
    <line x1="5" y1="10" x2="55" y2="10" stroke={stroke} strokeWidth="1.5" />
    <line x1="5" y1="40" x2="55" y2="40" stroke={stroke} strokeWidth="1.5" />
    {/* Ladies berth indicator */}
    {isLadies && (
      <circle cx="30" cy="25" r="3" fill="#fff" stroke="#ff1493" strokeWidth="2" />
    )}
  </svg>
);



const BusSeatSelect = ({ show, onHide, bus }) => {
  const navigate = useNavigate();
  const { fromCity, toCity, departDate } = useLocation().state || {};

  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [boarding, setBoarding] = useState(null);
  const [dropping, setDropping] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const isValidToken = useCallback((token) => {
    return token && typeof token === 'string' && token.length > 10;
  }, []);

  // Reset states when modal closes
  useEffect(() => {
    if (!show) {
      setSeatLayout([]);
      setSelectedSeats([]);
      setBoardingPoints([]);
      setDroppingPoints([]);
      setBoarding(null);
      setDropping(null);
      setLoading(false);
      setPointsLoading(false);
      setError(null);
      setRetryCount(0);
      setIsRetrying(false);
    }
  }, [show]);

  const fetchPointsWithRetry = useCallback(async (pointsPayload, maxRetries = 3) => {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Fetching boarding/dropping points - Attempt ${attempt}/${maxRetries}`);

        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        const pointsData = await fetchBoardingDroppingPoints(pointsPayload);

        let boardingList = [];
        let droppingList = [];

        if (pointsData?.Result) {
          boardingList = pointsData.Result.BoardingPointsDetails || pointsData.Result.BoardingPoints || [];
          droppingList = pointsData.Result.DroppingPointsDetails || pointsData.Result.DroppingPoints || [];
        } else if (pointsData) {
          boardingList = pointsData.BoardingPointsDetails || pointsData.BoardingPoints || [];
          droppingList = pointsData.DroppingPointsDetails || pointsData.DroppingPoints || [];
        }

        setBoardingPoints(boardingList);
        setDroppingPoints(droppingList);

        if (boardingList.length > 0) {
          setBoarding(boardingList[0]);
          console.log("📍 Auto-selected boarding point:", boardingList[0].CityPointName);
        }
        if (droppingList.length > 0) {
          setDropping(droppingList[0]);
          console.log("📍 Auto-selected dropping point:", droppingList[0].CityPointName);
        }

        console.log(`✅ Points loaded successfully on attempt ${attempt}: ${boardingList.length} boarding, ${droppingList.length} dropping`);

        return {
          success: true,
          boardingPoints: boardingList,
          droppingPoints: droppingList
        };

      } catch (error) {
        console.error(`❌ Points fetch attempt ${attempt} failed:`, error);
        lastError = error;

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${attempt} second(s)...`);
          continue;
        }
      }
    }

    console.error(`❌ All ${maxRetries} attempts failed. Last error:`, lastError);
    return {
      success: false,
      error: lastError
    };
  }, []);

  const loadAllData = useCallback(async () => {
    if (!show || !bus) return;

    if (!isValidToken(bus.SearchTokenId)) {
      console.error("❌ Invalid SearchTokenId:", bus.SearchTokenId);
      setError("Search session expired. Please close and search again.");
      return;
    }

    const requiredFields = ['ResultIndex', 'OriginId', 'DestinationId', 'UserIp'];
    const missingFields = requiredFields.filter(field => !bus[field]);

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      setError(`Missing bus information: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setPointsLoading(true);
    setError(null);
    setIsRetrying(false);

    try {
      console.log("🚀 Loading all data...");

      const seatPayload = {
        SearchTokenId: bus.SearchTokenId,
        ResultIndex: bus.ResultIndex,
        OriginId: bus.OriginId,
        DestinationId: bus.DestinationId,
        UserIp: bus.UserIp
      };

      const pointsPayload = {
        UserIp: bus.UserIp,
        SearchTokenId: bus.SearchTokenId,
        ResultIndex: bus.ResultIndex,
      };

      const seatPromise = fetchSeatLayout(seatPayload);
      const pointsPromise = fetchPointsWithRetry(pointsPayload, 3);

      try {
        const seatData = await seatPromise;
        const seats = seatData?.Result?.SeatLayout?.SeatDetails?.flat() ?? [];
        setSeatLayout(seats);
        console.log(`✅ Loaded ${seats.length} seats`);

        if (seats.length === 0) {
          setError("No seats available for this bus.");
        }
      } catch (seatError) {
        console.error("❌ Seat layout failed:", seatError);
        setError("Failed to load seat layout");
        return;
      }

      try {
        setIsRetrying(true);
        const pointsResult = await pointsPromise;

        if (pointsResult.success) {
          if (pointsResult.boardingPoints.length === 0 && pointsResult.droppingPoints.length === 0) {
            setError("No boarding or dropping points available for this bus.");
          }
        } else {
          console.error("❌ All boarding/dropping points attempts failed");
          setBoardingPoints([]);
          setDroppingPoints([]);

          setError("Unable to load boarding/dropping points. You can still select seats, but please contact support for assistance.");
        }
      } catch (pointsError) {
        console.error("❌ Unexpected error in points loading:", pointsError);
        setBoardingPoints([]);
        setDroppingPoints([]);
      }

    } catch (error) {
      console.error("❌ Error loading data:", error);

      if (error.message?.includes('Invalid search token') ||
        error.response?.data?.error?.ErrorMessage?.includes('Invalid search token')) {
        setError("Search session expired. Please close and search again.");
      } else if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to load bus information. Please try again.");
      }
    } finally {
      setLoading(false);
      setPointsLoading(false);
      setIsRetrying(false);
    }
  }, [show, bus, isValidToken, fetchPointsWithRetry]);

  useEffect(() => {
    if (show && bus?.SearchTokenId) {
      const timer = setTimeout(loadAllData, 100);
      return () => clearTimeout(timer);
    }
  }, [show, bus?.SearchTokenId, loadAllData]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
    loadAllData();
  };

  useEffect(() => {
    if (seatLayout.length > 0 &&
      boardingPoints.length === 0 &&
      droppingPoints.length === 0 &&
      !pointsLoading &&
      !isRetrying &&
      retryCount < 2) {

      console.log("🔄 Auto-retrying boarding/dropping points...");
      setRetryCount(prev => prev + 1);

      setTimeout(() => {
        if (show && bus?.SearchTokenId) {
          setPointsLoading(true);
          setIsRetrying(true);

          const pointsPayload = {
            UserIp: bus.UserIp,
            SearchTokenId: bus.SearchTokenId,
            ResultIndex: bus.ResultIndex,
          };

          fetchPointsWithRetry(pointsPayload, 2).finally(() => {
            setPointsLoading(false);
            setIsRetrying(false);
          });
        }
      }, 2000);
    }
  }, [seatLayout.length, boardingPoints.length, droppingPoints.length, pointsLoading, isRetrying, retryCount, show, bus, fetchPointsWithRetry]);

  const toggleSeat = (seat) => {
    if (!seat.SeatStatus) return;

    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some((s) => s.SeatName === seat.SeatName);

      if (isAlreadySelected) {
        return prev.filter((s) => s.SeatName !== seat.SeatName);
      } else {
        return [...prev, seat];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, s) => {
    const price = s?.Price?.PublishedPrice || s?.PublishedPrice || 450;
    return sum + price;
  }, 0);

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  // Enhanced seat rendering with realistic bus layout
  const renderBusLayout = (isUpper = false) => {
    const seats = seatLayout.filter(s => s.IsUpper === isUpper);

    if (seats.length === 0) {
      return (
        <div className="text-center text-muted py-4" style={{ minHeight: '200px' }}>
          <div className="mb-2">No {isUpper ? 'upper' : 'lower'} berth seats available</div>
        </div>
      );
    }

    // Sort seats by row and column for proper arrangement
    const sortedSeats = seats.sort((a, b) => {
      const aRow = parseInt(a.SeatName.match(/\d+/)?.[0] || 0);
      const bRow = parseInt(b.SeatName.match(/\d+/)?.[0] || 0);
      const aCol = a.SeatName.match(/[A-Z]+/)?.[0] || '';
      const bCol = b.SeatName.match(/[A-Z]+/)?.[0] || '';

      if (aRow !== bRow) return aRow - bRow;
      return aCol.localeCompare(bCol);
    });

    // Group seats by rows (typically 4 seats per row: 2+2 layout)
    const seatRows = [];
    const seatsPerRow = 4; // Common bus layout

    for (let i = 0; i < sortedSeats.length; i += seatsPerRow) {
      const row = sortedSeats.slice(i, i + seatsPerRow);
      seatRows.push(row);
    }

    return (
      <div className="bus-layout-container" style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '15px',
        padding: '20px',
        border: '3px solid #dee2e6',
        position: 'relative',
        minHeight: '200px'
      }}>
        {/* Bus frame styling */}
        <div>

          {/* Seat rows */}
          <div className="seat-rows-container px-3">
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className="seat-row mb-3 d-flex justify-content-center align-items-center">

                {/* Left side seats (2 seats) */}
                <div className="left-seats d-flex gap-2">
                  {row.slice(0, 2).map((seat, seatIndex) => {
                    if (!seat) return <div key={seatIndex} style={{ width: '45px' }}></div>;

                    const isBooked = seat.SeatStatus === false;
                    const isSelected = selectedSeats.some((s) => s.SeatName === seat.SeatName);
                    const isLadies = seat?.IsLadiesSeat;
                    const SeatComponent = isUpper ? SvgUpperBerthIcon : SvgSeatIcon;

                    const getSeatColor = () => {
                      if (isBooked) return "#d6d8db";
                      if (isSelected) return "#28a745";
                      if (isLadies) return "#fd7e14";
                      return "#ffffff";
                    };

                    return (
                      <div
                        key={seat.SeatName}
                        className="seat-wrapper position-relative"
                        onClick={() => !isBooked && toggleSeat(seat)}
                        style={{
                          cursor: isBooked ? "not-allowed" : "pointer",
                          transition: 'transform 0.2s ease',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                        }}
                        title={`Seat ${seat.SeatName} - ₹${seat?.Price?.PublishedPrice || seat?.PublishedPrice || 450} - ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                      >
                        <SeatComponent
                          fill={getSeatColor()}
                          stroke={isSelected ? "#28a745" : "#6c757d"}
                          isSelected={isSelected}
                          isBooked={isBooked}
                          isLadies={isLadies}
                        />
                        <div className="seat-number text-center mt-1" style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: isBooked ? '#6c757d' : '#000'
                        }}>
                          {seat.SeatName}
                        </div>
                        {/* Price tag */}
                        <div className="seat-price text-center" style={{
                          fontSize: '9px',
                          color: '#6c757d'
                        }}>
                          ₹{seat?.Price?.PublishedPrice || seat?.PublishedPrice || 450}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Aisle space */}
                <div className="aisle mx-4" style={{
                  width: '40px',
                  height: '60px',
                  borderLeft: '2px dashed #dee2e6',
                  borderRight: '2px dashed #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#6c757d',
                    transform: 'rotate(90deg)',
                    whiteSpace: 'nowrap'
                  }}>
                    AISLE
                  </div>
                </div>

                {/* Right side seats (2 seats) */}
                <div className="right-seats d-flex gap-2">
                  {row.slice(2, 4).map((seat, seatIndex) => {
                    if (!seat) return <div key={seatIndex + 2} style={{ width: '45px' }}></div>;

                    const isBooked = seat.SeatStatus === false;
                    const isSelected = selectedSeats.some((s) => s.SeatName === seat.SeatName);
                    const isLadies = seat?.IsLadiesSeat;
                    const SeatComponent = isUpper ? SvgUpperBerthIcon : SvgSeatIcon;

                    const getSeatColor = () => {
                      if (isBooked) return "#d6d8db";
                      if (isSelected) return "#28a745";
                      if (isLadies) return "#fd7e14";
                      return "#ffffff";
                    };

                    return (
                      <div
                        key={seat.SeatName}
                        className="seat-wrapper position-relative"
                        onClick={() => !isBooked && toggleSeat(seat)}
                        style={{
                          cursor: isBooked ? "not-allowed" : "pointer",
                          transition: 'transform 0.2s ease',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                        }}
                        title={`Seat ${seat.SeatName} - ₹${seat?.Price?.PublishedPrice || seat?.PublishedPrice || 450} - ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                      >
                        <SeatComponent
                          fill={getSeatColor()}
                          stroke={isSelected ? "#28a745" : "#6c757d"}
                          isSelected={isSelected}
                          isBooked={isBooked}
                          isLadies={isLadies}
                        />
                        <div className="seat-number text-center mt-1" style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: isBooked ? '#6c757d' : '#000'
                        }}>
                          {seat.SeatName}
                        </div>
                        {/* Price tag */}
                        <div className="seat-price text-center" style={{
                          fontSize: '9px',
                          color: '#6c757d'
                        }}>
                          ₹{seat?.Price?.PublishedPrice || seat?.PublishedPrice || 450}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Row number indicator */}
                <div className="row-number ms-3" style={{
                  width: '30px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e9ecef',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6c757d'
                }}>
                  {rowIndex + 1}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    if (!boarding) {
      alert("Please select a boarding point.");
      return;
    }

    if (!dropping) {
      alert("Please select a dropping point.");
      return;
    }

    // Navigate directly without blocking seats
    navigate("/bus-detail", {
      state: {
        bus,
        selectedSeats,
        totalPrice,
        fromCity,
        toCity,
        departDate,
        arriveDate: bus?.arriveDate,
        departTime: bus?.departTime,
        arriveTime: bus?.arriveTime,
        boarding,
        dropping,
        boardingTime: formatTime(boarding?.CityPointTime),
        droppingTime: formatTime(dropping?.CityPointTime)
      },
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Select Seats - {bus?.operator || 'Bus'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-3 d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <Button variant="outline-danger" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Auto-Retry Progress Alert */}
        {isRetrying && (
          <Alert variant="info" className="mb-3 d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Auto-retrying to load boarding/dropping points... (Attempt {retryCount + 1})</span>
          </Alert>
        )}

        <Row>
          <Col md={6}>
            <h5 className="mb-4 fw-bold">Select Seats</h5>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" />
                <div className="mt-2">Loading seat layout...</div>
              </div>
            ) : seatLayout.length ? (
              <>
                {/* Upper Berth */}
                {seatLayout.some(s => s.IsUpper) && (
                  <div className="upper-berth-section mb-4">
                    <h6 className="mb-3 text-primary">
                      <i className="bi bi-arrow-up-circle me-2"></i>
                      Upper Berth
                    </h6>
                    {renderBusLayout(true)}
                  </div>
                )}

                {/* Lower Berth */}
                {seatLayout.some(s => !s.IsUpper) && (
                  <div className="lower-berth-section mb-4">
                    <h6 className="mb-3 text-success">
                      <i className="bi bi-arrow-down-circle me-2"></i>
                      Lower Berth
                    </h6>
                    {renderBusLayout(false)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted py-4">
                No seat layout available.
                <br />
                <Button variant="link" onClick={handleRetry}>
                  Try loading again
                </Button>
              </div>
            )}

          </Col>

          <Col md={2}>
            {/* Enhanced Legend */}
            <div className="legend-section mt-4">
              <h6 className="mb-3">Seat Legend</h6>
              <Row>

                <div className="legend-item d-flex align-items-center mb-2">
                  <SvgSeatIcon fill="#ffffff" stroke="#6c757d" />
                  <span className="ms-2 small">Available</span>
                </div>
                <div className="legend-item d-flex align-items-center mb-2">
                  <SvgSeatIcon fill="#28a745" stroke="#28a745" isSelected={true} />
                  <span className="ms-2 small">Selected</span>
                </div>

                <div className="legend-item d-flex align-items-center mb-2">
                  <SvgSeatIcon fill="#fd7e14" stroke="#6c757d" isLadies={true} />
                  <span className="ms-2 small">Ladies Only</span>
                </div>
                <div className="legend-item d-flex align-items-center mb-2">
                  <SvgSeatIcon fill="#d6d8db" stroke="#6c757d" isBooked={true} />
                  <span className="ms-2 small">Booked</span>
                </div>

              </Row>
            </div>

          </Col>

          {/* Booking Info */}
          <Col md={4}>
            <Card className="p-3 mb-3 shadow-sm">
              <h6 className="text-primary">{bus?.operator}</h6>
              <div className="text-muted small mb-3">
                {bus?.departDate} | {bus?.departTime} - {bus?.arriveTime} | {bus?.busType}
              </div>

              {pointsLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <div className="mt-2">
                    {isRetrying ? `Loading boarding/dropping points... (Attempt ${retryCount + 1})` : 'Loading boarding/dropping points...'}
                  </div>
                </div>
              ) : (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-geo-alt me-1"></i>
                      Boarding Point
                    </Form.Label>
                    <Form.Select
                      value={boarding ? JSON.stringify(boarding) : ""}
                      onChange={e => setBoarding(e.target.value ? JSON.parse(e.target.value) : null)}
                      disabled={boardingPoints.length === 0}
                      className="form-select-sm"
                    >
                      <option value="">
                        {boardingPoints.length === 0 ? "No boarding points available" : "Select Boarding Point"}
                      </option>
                      {boardingPoints.map((bp, i) => (
                        <option key={i} value={JSON.stringify(bp)}>
                          {bp.CityPointName} – {formatTime(bp.CityPointTime)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      Dropping Point
                    </Form.Label>
                    <Form.Select
                      value={dropping ? JSON.stringify(dropping) : ""}
                      onChange={e => setDropping(e.target.value ? JSON.parse(e.target.value) : null)}
                      disabled={droppingPoints.length === 0}
                      className="form-select-sm"
                    >
                      <option value="">
                        {droppingPoints.length === 0 ? "No dropping points available" : "Select Dropping Point"}
                      </option>
                      {droppingPoints.map((dp, i) => (
                        <option key={i} value={JSON.stringify(dp)}>
                          {dp.CityPointName} – {formatTime(dp.CityPointTime)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              {/* Selected Seats Summary */}
              <div className="selected-seats-summary p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark">Selected Seats:</strong>
                  <span className="badge bg-primary">{selectedSeats.length}</span>
                </div>
                <div className="selected-seats-list">
                  {selectedSeats.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {selectedSeats.map(seat => (
                        <span key={seat.SeatName} className="badge bg-success">
                          {seat.SeatName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">None selected</div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown p-3 mb-3" style={{ backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #28a745' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-success">Total Amount:</strong>
                  <strong className="text-success fs-5">₹ {totalPrice.toFixed(2)}</strong>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} × ₹{selectedSeats.length > 0 ? Math.round(totalPrice / selectedSeats.length) : 0}
                    </small>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <Button
                className="w-100 py-2 btn-red"
                variant=""
                onClick={handleContinue}
                disabled={!boarding || !dropping || selectedSeats.length === 0}
              >
                <i className="bi bi-arrow-right-circle me-2 btn-red"></i>
                Continue ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
              </Button>

              {/* Quick Info */}
              <div className="mt-3 text-center">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Select your preferred seats
                </small>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Journey Summary Table */}
        {(boarding || dropping) && (
          <Row className="mt-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-map me-2"></i>
                    Journey Summary
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Table responsive size="sm" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th><i className="bi bi-play-circle text-success me-1"></i>Boarding</th>
                        <th>Landmark</th>
                        <th>Address</th>
                        <th>Time</th>
                        <th><i className="bi bi-stop-circle text-danger me-1"></i>Dropping</th>
                        <th>Landmark</th>
                        <th>Address</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-semibold">{boarding?.CityPointName || "-"}</td>
                        <td>{boarding?.CityPointLandmark || "-"}</td>
                        <td>{boarding?.CityPointAddress || "-"}</td>
                        <td className="text-success fw-semibold">{boarding ? formatTime(boarding.CityPointTime) : "-"}</td>
                        <td className="fw-semibold">{dropping?.CityPointName || "-"}</td>
                        <td>{dropping?.CityPointLandmark || "-"}</td>
                        <td>{dropping?.CityPointAddress || "-"}</td>
                        <td className="text-danger fw-semibold">{dropping ? formatTime(dropping.CityPointTime) : "-"}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default BusSeatSelect;