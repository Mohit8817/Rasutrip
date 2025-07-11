import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Row, Col, Form, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../../Style/Pagescss/BusResultPage.css";
import { fetchSeatLayout } from "../../APIS/BusApi/BusApis";

// 🪑 Lower Berth Icon
const SvgSeatIcon = ({ fill = "none", stroke = "#000", label = "" }) => (
  <svg width="30" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="25" height="40" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="30" y="10" width="18" height="10" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="45" y="10" width="10" height="40" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="30" y="40" width="18" height="10" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    {/* {label && (
      <text x="50%" y="58" textAnchor="middle" fontSize="10" fill={stroke} fontWeight="bold">
        {label}
      </text>
    )} */}
  </svg>
);

// 🛏️ Upper Berth Icon
const SvgUpperBerthIcon = ({ fill = "none", stroke = "#000", label = "" }) => (
  <svg width="55" height="50" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="20" width="50" height="15" rx="3" ry="3" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="45" y="20" width="8" height="15" rx="2" ry="1" fill="white" stroke={stroke} strokeWidth="1.5" />
    {/* {label && (
      <text x="50%" y="55" textAnchor="middle" fontSize="10" fill={stroke} fontWeight="bold">
        {label}
      </text>
    )} */}
  </svg>
);

const BusSeatSelect = ({ show, onHide, bus }) => {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSeatLayout = async () => {
      if (!show || !bus?.SearchTokenId || !bus?.resultIndex) return;
      setLoading(true);

      try {
        const data = await fetchSeatLayout({
          SearchTokenId: bus.SearchTokenId,
          ResultIndex: bus.resultIndex,
          UserIp: bus.UserIp,
          OriginId: bus.OriginId,
          DestinationId: bus.DestinationId,
        });

        const seats = data?.Result?.SeatLayout?.SeatDetails?.flat() ?? [];
        setSeatLayout(seats);
      } catch (err) {
        console.error("Error loading seat layout:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSeatLayout();
  }, [show, bus]);

  const toggleSeat = (seat) => {
    if (!seat.SeatStatus) return;

    setSelectedSeats((prev) =>
      prev.some((s) => s.SeatName === seat.SeatName)
        ? prev.filter((s) => s.SeatName !== seat.SeatName)
        : [...prev, seat]
    );
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + (seat?.Price?.PublishedPrice ?? 450),
    0
  );

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body>
        <Row>
          {/* Seat layout */}
          <Col md={6}>
            <h5 className="mb-4 fw-bold">Select Seats</h5>
            <div className="seat-layout-box border p-3">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : seatLayout.length ? (
                <div className="bus-layout-wrapper">
                  <div className="deck-label">UPPER</div>
                  <div className="seat-deck upper-deck d-flex flex-wrap gap-2 mb-4">
                    {seatLayout
                      .filter((seat) => seat.IsUpper)
                      .map((seat) => {
                        const isBooked = seat.SeatStatus === false;
                        const isSelected = selectedSeats.some((s) => s.SeatName === seat.SeatName);

                        return (
                          <div
                            key={seat.SeatName}
                            className="seat-icon-wrapper"
                            onClick={() => !isBooked && toggleSeat(seat)}
                            style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                          >
                            <SvgUpperBerthIcon
                              fill={
                                isBooked
                                  ? "#f2f2f2"
                                  : isSelected
                                    ? "#6FA84F"
                                    : seat?.IsLadiesSeat
                                      ? "#ff69b4"
                                      : "#eaeaea"
                              }
                              label={seat.SeatName}
                            />
                          </div>
                        );
                      })}
                  </div>

                  <div className="deck-label">LOWER</div>
                  <div className="seat-deck lower-deck d-flex flex-wrap gap-2">
                    {seatLayout
                      .filter((seat) => !seat.IsUpper)
                      .map((seat) => {
                        const isBooked = seat.SeatStatus === false;
                        const isSelected = selectedSeats.some((s) => s.SeatName === seat.SeatName);

                        return (
                          <div
                            key={seat.SeatName}
                            className="seat-icon-wrapper"
                            onClick={() => !isBooked && toggleSeat(seat)}
                            style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                          >
                            <SvgSeatIcon
                              fill={
                                isBooked
                                  ? "#B8B8B8"
                                  : isSelected
                                    ? "#6FA84F"
                                    : seat?.IsLadiesSeat
                                      ? "#ff69b4"
                                      : "#eaeaea"
                              }
                              label={seat.SeatName}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-muted">No seat layout available.</div>
              )}
            </div>
          </Col>

          {/* Legend */}
          <Col md={2} className="mt-5">
            <div className="legend d-flex flex-column gap-3">
              <div><SvgSeatIcon fill="#eaeaea" /> Available seat</div>
              <div><SvgSeatIcon fill="#ff69b4" /> Reserved for ladies</div>
              <div><SvgSeatIcon fill="#6FA84F" /> Selected seat</div>
              <div><SvgSeatIcon fill="#B8B8B8" /> Booked seat</div>
            </div>
          </Col>

          {/* Booking info */}
          <Col md={4}>
            <Card className="p-3 shadow-sm mb-3">
              <h6 className="fw-bold">{bus?.operator}</h6>
              <div className="small text-muted mb-3">
                {bus?.departTime} - {bus?.arriveTime} | {bus?.busType}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Boarding Point</Form.Label>
                <Form.Select>
                  {bus?.BoardingPointsDetails.map((p, i) => (
                    <option key={i}>{p.CityPointName}</option>  
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dropping Point</Form.Label>
                <Form.Select>
                  {bus?.DroppingPointsDetails.map((p, i) => (
                    <option key={i}>{p.CityPointName}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="mb-2">
                <strong>Selected Seats:</strong>{" "}
                {selectedSeats.map((s) => s.SeatName).join(", ") || "None"}
              </div>

              <div className="mb-3">
                <strong>You Pay:</strong>{" "}
                <span className="fs-5 fw-bold">₹ {totalPrice.toFixed(2)}</span>
              </div>

              <Button className="btn-red w-100" onClick={() => navigate("/bus-detail")}>
                Continue
              </Button>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default BusSeatSelect;
