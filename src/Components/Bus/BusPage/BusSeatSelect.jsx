import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  Card,
  Spinner,
  Table
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSeatLayout, fetchBoardingDroppingPoints } from "../../APIS/BusApi/BusApis";
import "../../../Style/Pagescss/BusResultPage.css";

const SvgSeatIcon = ({ fill = "none", stroke = "#000" }) => (
  <svg width="30" height="40" viewBox="0 0 60 60">
    <rect x="10" y="10" width="25" height="40" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="30" y="10" width="18" height="10" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="45" y="10" width="10" height="40" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="30" y="40" width="18" height="10" rx="5" ry="5" fill={fill} stroke={stroke} strokeWidth="2" />
  </svg>
);

const SvgUpperBerthIcon = ({ fill = "none", stroke = "#000" }) => (
  <svg width="55" height="50" viewBox="0 0 60 50">
    <rect x="5" y="20" width="50" height="15" rx="3" ry="3" fill={fill} stroke={stroke} strokeWidth="2" />
    <rect x="45" y="20" width="8" height="15" rx="2" ry="1" fill="white" stroke={stroke} strokeWidth="1.5" />
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

  useEffect(() => {
    const loadSeatLayout = async () => {
      if (!show || !bus?.SearchTokenId) return;
      setLoading(true);
      try {
        const payload = {
          SearchTokenId: bus.SearchTokenId,
          ResultIndex: bus.ResultIndex,
          OriginId: bus.OriginId,
          DestinationId: bus.DestinationId,
          UserIp: bus.UserIp
        };
        const data = await fetchSeatLayout(payload);
        const seats = data?.Result?.SeatLayout?.SeatDetails?.flat() ?? [];
        setSeatLayout(seats);
      } catch (e) {
        console.error("Error fetching seat layout:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSeatLayout();
  }, [show, bus]);

  useEffect(() => {
    const loadPoints = async () => {
      if (!show || !bus?.SearchTokenId || !bus?.ResultIndex || !bus?.UserIp) return;

      try {
        const data = await fetchBoardingDroppingPoints({
          UserIp: bus.UserIp,
          SearchTokenId: bus.SearchTokenId,
          ResultIndex: bus.ResultIndex,
          OriginId: bus.OriginId,
          DestinationId: bus.DestinationId,
        });

        const boardingList = data?.BoardingPointsDetails || bus?.BoardingPointsDetails || [];
        const droppingList = data?.DroppingPointsDetails || bus?.DroppingPointsDetails || [];

        setBoardingPoints(boardingList);
        setDroppingPoints(droppingList);

        if (boardingList.length > 0) {
          setBoarding(boardingList[0]);
        }
        if (droppingList.length > 0) {
          setDropping(droppingList[0]);
        }
      } catch (error) {
        console.error("❌ Boarding/Dropping Point API Error:", error);
      }
    };

    loadPoints();
  }, [show, bus]);



  const toggleSeat = (seat) => {
    if (!seat.SeatStatus) return;
    setSelectedSeats((prev) =>
      prev.some((s) => s.SeatName === seat.SeatName)
        ? prev.filter((s) => s.SeatName !== seat.SeatName)
        : [...prev, seat]
    );
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + (s?.Price?.PublishedPrice || 450), 0);

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
        fromCity,
        toCity,
        departDate,
        arriveDate: bus?.arriveDate,
        departTime: bus?.departTime,
        arriveTime: bus?.arriveTime,
        boarding,
        dropping,
        boardingTime: boarding?.DepTime || new Date(boarding?.CityPointTime).toLocaleTimeString(),
        droppingTime: dropping?.ArrTime || new Date(dropping?.CityPointTime).toLocaleTimeString(),
      },
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
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
                  {/* Upper Berth */}
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

                  {/* Lower Berth */}
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
            <Card className="p-3 mb-3">
              <h6>{bus?.operator}</h6>
              <div>{bus?.departDate} | {bus?.departTime} - {bus?.arriveTime} | {bus?.busType}</div>

              <Form.Group className="mb-2 mt-3">
                <Form.Label>Boarding Point</Form.Label>
                <Form.Select value={JSON.stringify(boarding)} onChange={e => setBoarding(JSON.parse(e.target.value))}>
                  <option value="">Select</option>
                  {boardingPoints.map((bp, i) => (
                    <option key={i} value={JSON.stringify(bp)}>
                      {bp.CityPointName} – {new Date(bp.CityPointTime).toLocaleTimeString()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Dropping Point</Form.Label>
                <Form.Select value={JSON.stringify(dropping)} onChange={e => setDropping(JSON.parse(e.target.value))}>
                  <option value="">Select</option>
                  {droppingPoints.map((dp, i) => (
                    <option key={i} value={JSON.stringify(dp)}>
                      {dp.CityPointName} – {new Date(dp.CityPointTime).toLocaleTimeString()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div><strong>Seats:</strong> {selectedSeats.map(s => s.SeatName).join(", ")}</div>
              <div><strong>Total:</strong> ₹ {totalPrice.toFixed(2)}</div>

              <Button className="btn-red w-100 mt-3" onClick={handleContinue}>Continue</Button>
            </Card>
          </Col>
        </Row>

        {/* Final Table */}
        <Row className="mt-4">
          <Col>
            <Table bordered striped responsive size="sm">
              <thead className="table-light">
                <tr>
                  <th>Boarding Point</th><th>LandMark</th><th>Address</th><th>Time</th>
                  <th>Dropping Point</th><th>LandMark</th><th>Address</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{boarding?.CityPointName || "-"}</td>
                  <td>{boarding?.Landmark || "-"}</td>
                  <td>{boarding?.Address || "-"}</td>
                  <td>{boarding?.DepTime || new Date(boarding?.CityPointTime || "").toLocaleTimeString() || "-"}</td>
                  <td>{dropping?.CityPointName || "-"}</td>
                  <td>{dropping?.Landmark || "-"}</td>
                  <td>{dropping?.Address || "-"}</td>
                  <td>{dropping?.ArrTime || new Date(dropping?.CityPointTime || "").toLocaleTimeString() || "-"}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default BusSeatSelect;
