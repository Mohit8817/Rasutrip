import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Row, Col, Form, Card, Table, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSeatLayout, fetchBoardingDroppingPoints } from "../../APIS/BusApi/BusApis";
import "../../../Style/Pagescss/BusResultPage.css";

// SVG Seat Components - Made smaller
const SvgSeatIcon = ({
  fill = "#f8f9fa",
  stroke = "#6c757d",
  isSelected = false,
  isBooked = false,
  isLadies = false,
  width = 35,
  height = 25
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 60"
    style={{
      filter: isSelected ? 'drop-shadow(0 2px 8px rgba(111, 168, 79, 0.3))' : 'none'
    }}
  >
    {/* Seat base */}
    <rect
      x="8" y="15" width="32" height="35" rx="6" ry="6"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
    {/* Seat back */}
    <rect
      x="10" y="10" width="28" height="25" rx="4" ry="4"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
    {/* Armrests */}
    <rect
      x="6" y="20" width="4" height="20" rx="2" ry="2"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
    />
    <rect
      x="38" y="20" width="4" height="20" rx="2" ry="2"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
    />
    {/* Ladies seat indicator */}
    {isLadies && (
      <circle
        cx="24" cy="22" r="3"
        fill="#fff"
        stroke="#ff1493"
        strokeWidth="2"
      />
    )}
  </svg>
);

const SvgSleeperIcon = ({
  fill = "#f8f9fa",
  stroke = "#6c757d",
  isSelected = false,
  isBooked = false,
  isLadies = false,
  width = 55,
  height = 28
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 70 40"
    style={{
      filter: isSelected ? 'drop-shadow(0 2px 8px rgba(111, 168, 79, 0.3))' : 'none'
    }}
  >
    {/* Sleeper bed base */}
    <rect
      x="5" y="18" width="60" height="18" rx="3" ry="3"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
    {/* Headrest/pillow */}
    <rect
      x="52" y="20" width="10" height="14" rx="2" ry="2"
      fill="#e9ecef"
      stroke={stroke}
      strokeWidth="1"
    />
    {/* Mattress lines for texture */}
    <line
      x1="10" y1="22" x2="50" y2="22"
      stroke={stroke}
      strokeWidth="0.5"
      strokeDasharray="2,2"
    />
    <line
      x1="10" y1="26" x2="50" y2="26"
      stroke={stroke}
      strokeWidth="0.5"
      strokeDasharray="2,2"
    />
    <line
      x1="10" y1="30" x2="50" y2="30"
      stroke={stroke}
      strokeWidth="0.5"
      strokeDasharray="2,2"
    />
    {/* Support legs */}
    <rect
      x="8" y="36" width="2" height="4"
      fill={stroke}
    />
    <rect
      x="60" y="36" width="2" height="4"
      fill={stroke}
    />
    {/* Ladies sleeper indicator */}
    {isLadies && (
      <circle
        cx="30" cy="27" r="3"
        fill="#fff"
        stroke="#ff1493"
        strokeWidth="2"
      />
    )}
  </svg>
);

const SvgUpperBerthIcon = ({
  fill = "#f8f9fa",
  stroke = "#6c757d",
  isSelected = false,
  isBooked = false,
  isLadies = false,
  width = 50,
  height = 28
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 60 40"
    style={{
      filter: isSelected ? 'drop-shadow(0 2px 8px rgba(111, 168, 79, 0.3))' : 'none'
    }}
  >
    {/* Berth platform */}
    <rect
      x="5" y="15" width="50" height="20" rx="4" ry="4"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
    {/* Pillow area */}
    <rect
      x="45" y="17" width="8" height="16" rx="2" ry="2"
      fill="#e9ecef"
      stroke={stroke}
      strokeWidth="1"
    />
    {/* Support bars */}
    <line
      x1="5" y1="10" x2="55" y2="10"
      stroke={stroke}
      strokeWidth="1.5"
    />
    <line
      x1="5" y1="40" x2="55" y2="40"
      stroke={stroke}
      strokeWidth="1.5"
    />
    {/* Ladies berth indicator */}
    {isLadies && (
      <circle
        cx="30" cy="25" r="3"
        fill="#fff"
        stroke="#ff1493"
        strokeWidth="2"
      />
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
  const [error, setError] = useState(null);

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
      setError(null);
    }
  }, [show]);

  // Load seat layout and boarding/dropping points
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
    setError(null);

    try {
      console.log("🚀 Loading seat layout and boarding/dropping points...");

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

      // Load seat layout
      console.log("🎫 Fetching seat layout...");
      const seatData = await fetchSeatLayout(seatPayload);
      const seats = seatData?.Result?.SeatLayout?.SeatDetails?.flat() ?? [];
      setSeatLayout(seats);
      console.log(`✅ Loaded ${seats.length} seats`);

      // Load boarding/dropping points
      console.log("📍 Fetching boarding/dropping points...");
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

      console.log(`✅ Points loaded: ${boardingList.length} boarding, ${droppingList.length} dropping`);

      setBoardingPoints(boardingList);
      setDroppingPoints(droppingList);

      // Auto-select first boarding and dropping points if available
      if (boardingList.length > 0) {
        setBoarding(boardingList[0]);
      }
      if (droppingList.length > 0) {
        setDropping(droppingList[0]);
      }

    } catch (error) {
      console.error("❌ Error loading data:", error);
      setError("Failed to load bus information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [show, bus, isValidToken]);

  // Load data when modal opens
  useEffect(() => {
    if (show && bus?.SearchTokenId) {
      const timer = setTimeout(loadAllData, 100);
      return () => clearTimeout(timer);
    }
  }, [show, bus?.SearchTokenId, loadAllData]);

  const toggleSeat = (seat) => {
    if (!seat.SeatStatus) return; // Don't allow selecting booked seats

    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some((s) => s.SeatName === seat.SeatName);

      if (isAlreadySelected) {
        return prev.filter((s) => s.SeatName !== seat.SeatName);
      } else {
        return [...prev, seat];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    return sum + (seat?.Price?.PublishedPrice || seat?.SeatFare || 0);
  }, 0);

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  // Organize seats by rows and columns
  const organizeSeatsByLayout = (seats) => {
    const organized = {};

    seats.forEach(seat => {
      const berth = seat.IsUpper ? 'upper' : 'lower';
      const row = seat.RowNo || '000';

      if (!organized[berth]) organized[berth] = {};
      if (!organized[berth][row]) organized[berth][row] = [];

      organized[berth][row].push(seat);
    });

    // Sort seats in each row by column
    Object.keys(organized).forEach(berth => {
      Object.keys(organized[berth]).forEach(row => {
        organized[berth][row].sort((a, b) =>
          parseInt(a.ColumnNo || '0') - parseInt(b.ColumnNo || '0')
        );
      });
    });

    return organized;
  };

  const getSeatColors = (seat) => {
    const isSelected = selectedSeats.some(s => s.SeatName === seat.SeatName);
    const isBooked = !seat.SeatStatus;

    if (isBooked) {
      return { fill: "#d6d8db", stroke: "#6c757d" };
    } else if (isSelected) {
      return { fill: "#28a745", stroke: "#28a745" };
    } else if (seat.IsLadiesSeat) {
      return { fill: "#fd7e14", stroke: "#6c757d" };
    } else {
      return { fill: "#ffffff", stroke: "#6c757d" };
    }
  };

  const renderSeat = (seat) => {
    const isSelected = selectedSeats.some(s => s.SeatName === seat.SeatName);
    const isBooked = !seat.SeatStatus;
    const colors = getSeatColors(seat);

    // Determine seat type based on SeatType or other properties
    const isSleeper = seat.SeatType === 0 || seat.SeatType === 2; // Assuming 0 or 2 is sleeper
    const isUpperBerth = seat.IsUpper;

    const SeatComponent = isSleeper
      ? (isUpperBerth ? SvgUpperBerthIcon : SvgSleeperIcon)
      : SvgSeatIcon;

    return (
      <div
        key={seat.SeatName}
        className="seat-container position-relative"
        style={{
          margin: '1px',
          cursor: isBooked ? 'not-allowed' : 'pointer',
          display: 'inline-block'
        }}
        onClick={() => !isBooked && toggleSeat(seat)}
        title={`Seat ${seat.SeatName} - ₹${seat.Price?.PublishedPrice || seat.SeatFare} ${isBooked ? '(Booked)' : ''} ${seat.SeatType === 1 ? '(Seater)' : '(Sleeper)'}`}
      >
        <SeatComponent
          fill={colors.fill}
          stroke={colors.stroke}
          isSelected={isSelected}
          isBooked={isBooked}
          isLadies={seat.IsLadiesSeat}
        />
      </div>
    );
  };

  const renderBerthLayout = (berthSeats, berthName) => {
    const rows = Object.keys(berthSeats).sort();

    return (
      <div className="mb-4">
        <h6 className="mb-3 text-primary border-bottom pb-2">
          <i className={`fas ${berthName === 'Upper' ? 'fa-bed' : 'fa-chair'} me-2`}></i>
          {berthName} Berth
        </h6>
        <div className="seat-grid border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
          {rows.map(rowNo => (
            <div key={rowNo} className="seat-row d-flex justify-content-center align-items-center mb-1">
              <div className="d-flex">
                {berthSeats[rowNo].map((seat, index) => (
                  <React.Fragment key={seat.SeatName}>
                    {renderSeat(seat)}
                    {/* Add aisle space after 2nd seat if more than 4 seats in row */}
                    {index === 1 && berthSeats[rowNo].length > 4 && (
                      <div style={{ width: '10px', borderRight: '2px dashed #dee2e6', margin: '0 2px' }}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSeatLayout = () => {
    if (seatLayout.length === 0) {
      return (
        <div className="text-center text-muted py-5">
          <i className="fas fa-chair fa-3x mb-3"></i>
          <div>No seats available</div>
        </div>
      );
    }

    const organizedSeats = organizeSeatsByLayout(seatLayout);

    return (
      <div className="seat-layout-container">
        <div className="row h-100">
          {/* Seat Layout (col-9) */}
          <div className="col-md-9 h-100">
            {/* Fixed Scrollable Container */}
            <div
              className="position-relative border rounded p-2 shadow-sm"
              style={{
                overflow: 'auto',
                minHeight: 'auto',
                maxHeight: 'auto'
              }}
            >
              {/* Content Container */}
              <div style={{
                minWidth: '600px',
                width: '100%'
              }}>
                {/* Upper Berth */}
                {organizedSeats.upper && (
                  <div className="berth-section text-dark">
                    {renderBerthLayout(organizedSeats.upper, "Upper")}
                  </div>
                )}

                {/* Lower Berth */}
                {organizedSeats.lower && (
                  <div className="berth-section text-dark">
                    {renderBerthLayout(organizedSeats.lower, "Lower")}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Legend Info (col-3) */}
          <div className="col-md-3">
            <div
              className="d-flex flex-column"
              style={{
                overflow: 'auto'
              }}
            >
              <h6 className="mb-3 text-center border-bottom pb-2">
                Seat Legend
              </h6>

              {/* Legend Items */}
              <div className="flex-grow-1">
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center">
                    <SvgSeatIcon fill="#ffffff" stroke="#6c757d" width={25} height={18} />
                    <small className="fw-medium ms-2">Available</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <SvgSeatIcon fill="#28a745" stroke="#28a745" width={25} height={18} />
                    <small className="fw-medium ms-2">Selected</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <SvgSeatIcon fill="#fd7e14" stroke="#6c757d" isLadies={true} width={25} height={18} />
                    <small className="fw-medium ms-2">Ladies Only</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <SvgSeatIcon fill="#d6d8db" stroke="#6c757d" width={25} height={18} />
                    <small className="fw-medium ms-2">Booked</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <SvgUpperBerthIcon fill="#ffffff" stroke="#6c757d" width={30} height={18} />
                    <small className="fw-medium ms-2">Sleeper</small>
                  </div>
                </div>
              </div>
            </div>
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

    // Navigate with selected seats
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
        droppingTime: formatTime(dropping?.CityPointTime),

        // API parameters
        userIp: bus.UserIp,
        searchTokenId: bus.SearchTokenId,
        resultIndex: bus.ResultIndex,
        originId: bus.OriginId,
        destinationId: bus.DestinationId,
        boardingPointId: boarding?.CityPointId || boarding?.Id || 1,
        droppingPointId: dropping?.CityPointId || dropping?.Id || 1,
      },
    });
  };

  return (

    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <h5> <i className="fas fa-bus me-2"></i>
            Select Seats - {bus?.operator || 'Bus'}</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Row>
          {/* Seat Selection */}
          <Col md={8}>
            {loading ? (
              <div className="text-center py-5">
                <div className="text-muted">Please wait...</div>
              </div>
            ) : (
              renderSeatLayout()
            )}
          </Col>

          {/* Booking Info */}
          <Col md={4}>
            <Card className="p-3 mb-3 shadow-sm">
              <h5 className="text-danger fw-bold">{bus?.operator}</h5>
              <div className="text-muted small mb-3">
                {bus?.departDate} | {bus?.departTime} - {bus?.arriveTime} | {bus?.busType}
              </div>

              {loading ? (
                <div className="text-center py-3">
                  <div className="text-muted">Please wait...</div>
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
                </div>
                <div className="selected-seats-list">
                  {selectedSeats.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {selectedSeats.map(seat => (
                        <span key={seat.SeatName} className="badge bg-danger text-white">
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
              <div className="price-breakdown p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-dark">Total Amount:</strong>
                  <strong className="text-dark fs-5">₹ {totalPrice.toFixed(2)}</strong>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                className="w-100 py-2 btn-red"
                onClick={handleContinue}
                disabled={!boarding || !dropping || selectedSeats.length === 0}
              >
                Continue
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