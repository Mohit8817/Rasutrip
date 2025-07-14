// BusSeatSelect.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form, Card, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../Style/Pagescss/BusResultPage.css";
import { fetchSeatLayout } from "../../APIS/BusApi/BusApis";

// Lower Berth Icon
const SvgSeatIcon = ({ fill = "none", stroke = "#000" }) => (
  <svg width="30" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="25" height="40" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="30" y="10" width="18" height="10" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="45" y="10" width="10" height="40" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="30" y="40" width="18" height="10" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
  </svg>
);

// Upper Berth Icon
const SvgUpperBerthIcon = ({ fill = "none", stroke = "#000" }) => (
  <svg width="55" height="50" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="20" width="50" height="15" rx="3" ry="3" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="45" y="20" width="8" height="15" rx="2" ry="1" fill="white" stroke={stroke} strokeWidth="1.5" />
  </svg>
);

const BusSeatSelect = ({ show, onHide, bus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fromCity, toCity, departDate } = location?.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boarding, setBoarding] = useState(null);
  const [dropping, setDropping] = useState(null);

  useEffect(() => {
    const loadSeatLayout = async () => {
      if (!show || !bus?.SearchTokenId || !bus?.ResultIndex) return;
      setLoading(true);

      try {
        const payload = {
          SearchTokenId: bus.SearchTokenId,
          ResultIndex: bus.ResultIndex,
          OriginId: bus.OriginId,
          DestinationId: bus.DestinationId,
        };

        if (bus.UserIp) payload.UserIp = bus.UserIp;

        console.log("📡 Sending seat layout request:", payload);

        const data = await fetchSeatLayout(payload);

        const seats = data?.Result?.SeatLayout?.SeatDetails?.flat() ?? [];
        setSeatLayout(seats);
      } catch (err) {
        console.error("❌ Error loading seat layout:", err.response?.data || err.message);
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

  const handleContinue = () => {
    if (!boarding || !dropping || selectedSeats.length === 0) {
      alert("Please select seats, boarding and dropping point.");
      return;
    }

    navigate("/bus-detail", {
      state: {
        bus,
        selectedSeats,
        totalPrice,
        boarding,
        dropping,
        fromCity,
        toCity,
        departDate,
        departTime: bus?.departTime,
        arriveTime: bus?.arriveTime,
      },
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h5 className="mb-4 fw-bold">Select Seats</h5>
            <div className="seat-layout-box border p-3">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : seatLayout.length ? (
                <>
                  {/* UPPER Berth */}
                  <div className="upper-berth-container d-flex mb-4">
                    <div className="deck-label-vertical text-uppercase">
                      {"UPPER".split("").map((char, index) => (
                        <div key={index}>{char}</div>
                      ))}
                    </div>
                    <div className="seat-grid">
                      <div className="row">
                        {seatLayout.filter((s, i) => s.IsUpper && i % 2 === 0).map((seat) => {
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
                                    ? "#b8b8b8"
                                    : isSelected
                                      ? "#6FA84F"
                                      : seat?.IsLadiesSeat
                                        ? "#ff69b4"
                                        : "#fdfcfcff"
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="row">
                        {seatLayout.filter((s, i) => s.IsUpper && i % 2 !== 0).map((seat) => {
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
                                    ? "#b8b8b8"
                                    : isSelected
                                      ? "#6FA84F"
                                      : seat?.IsLadiesSeat
                                        ? "#ff69b4"
                                        : "#fdfcfcff"
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* LOWER Berth */}
                  <div className="lower-berth-container d-flex">
                    <div className="deck-label-vertical text-uppercase">
                      {"LOWER".split("").map((char, index) => (
                        <div key={index}>{char}</div>
                      ))}
                    </div>
                    <div className="seat-grid">
                      <div className="row">
                        {seatLayout.filter((s, i) => !s.IsUpper && i % 2 === 0).map((seat) => {
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
                                    ? "#b8b8b8"
                                    : isSelected
                                      ? "#6FA84F"
                                      : seat?.IsLadiesSeat
                                        ? "#ff69b4"
                                        : "#fdfcfcff"
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="row">
                        {seatLayout.filter((s, i) => !s.IsUpper && i % 2 !== 0).map((seat) => {
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
                                    ? "#b8b8b8"
                                    : isSelected
                                      ? "#6FA84F"
                                      : seat?.IsLadiesSeat
                                        ? "#ff69b4"
                                        : "#fdfcfcff"
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted">No seat layout available.</div>
              )}
            </div>
          </Col>

          {/* Legend */}
          <Col md={2} className="mt-5">
            <div className="legend d-flex flex-column gap-0">
              <div><SvgSeatIcon fill="#fdfcfcff" /> Available seat</div>
              <div><SvgSeatIcon fill="#ff69b4" /> Reserved for ladies</div>
              <div><SvgSeatIcon fill="#6FA84F" /> Selected seat</div>
              <div><SvgSeatIcon fill="#B8B8B8" /> Booked seat</div>
            </div>
          </Col>

          {/* Booking Info */}
          <Col md={4}>
            <Card className="p-3 shadow-sm mb-3">
              <h6 className="fw-bold">{bus?.operator}</h6>
              <div className="small text-muted mb-3">
                {bus?.departTime} - {bus?.arriveTime} | {bus?.busType}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Boarding Point</Form.Label>
                <Form.Select onChange={(e) => setBoarding(JSON.parse(e.target.value))}>
                  <option value="">Select Boarding</option>
                  {bus?.BoardingPointsDetails.map((p, i) => (
                    <option key={i} value={JSON.stringify(p)}>
                      {p.CityPointName} - {p.DepTime}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dropping Point</Form.Label>
                <Form.Select onChange={(e) => setDropping(JSON.parse(e.target.value))}>
                  <option value="">Select Dropping</option>
                  {bus?.DroppingPointsDetails.map((p, i) => (
                    <option key={i} value={JSON.stringify(p)}>
                      {p.CityPointName} - {p.ArrTime}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="mb-2">
                <strong>Selected Seats:</strong> {selectedSeats.map((s) => s.SeatName).join(", ") || "None"}
              </div>

              <div className="mb-3">
                <strong>You Pay:</strong> <span className="fs-5 fw-bold">₹ {totalPrice.toFixed(2)}</span>
              </div>

              <Button className="btn-red w-100" onClick={handleContinue}>
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
