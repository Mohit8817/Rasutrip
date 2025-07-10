// src/Components/Bus/BusPage/BusSeatSelect.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Row, Col, Form, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../../Style/Pagescss/BusResultPage.css";
import { fetchSeatLayout } from "../../APIS/BusApi/BusApis";

const BusSeatSelect = ({ show, onHide, bus }) => {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [seatPositions, setSeatPositions] = useState({});
  const [loading, setLoading] = useState(false);

  // ────────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────────
  const parsePositionsFromHTML = useCallback((html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const divs = doc.querySelectorAll(".nseat, .bseat");

    const positions = {};
    divs.forEach((div) => {
      const onclickAttr = div.getAttribute("onclick");
      const seatNumMatch = onclickAttr?.match(/'([A-Za-z0-9]+)'/);
      const seatNum = seatNumMatch?.[1];
      const { top, left } = div.style;
      if (seatNum) positions[seatNum] = { top, left };
    });

    return positions;
  }, []);

  // ────────────────────────────────────────────────────────────────────────────────
  // Seat layout loader
  // ────────────────────────────────────────────────────────────────────────────────
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
        setSeatPositions(parsePositionsFromHTML(data?.Result?.HTMLLayout ?? ""));
      } catch (err) {
        console.error("Error loading seat layout:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSeatLayout();
  }, [
    bus?.DestinationId,
    bus?.OriginId,
    bus?.SearchTokenId,
    bus?.UserIp,
    bus?.resultIndex,
    parsePositionsFromHTML,
    show,
  ]);

  // ────────────────────────────────────────────────────────────────────────────────
  // Seat toggle
  // ────────────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────────
  // JSX
  // ────────────────────────────────────────────────────────────────────────────────
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body>
        <Row>
          {/* Layout column */}
          <Col md={6}>
            <h5 className="mb-4 fw-bold">Select Seats</h5>
            <div className="seat-layout-box border p-3" style={{ minHeight: 220 }}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : seatLayout.length ? (
                <div
                  className="seat-absolute-wrapper position-relative"
                  style={{ height: 200, width: 280 }}
                >
                  {seatLayout.map((seat) => {
                    const { top = "0px", left = "0px" } =
                      seatPositions[seat.SeatName] || {};
                    const isSelected = selectedSeats.some(
                      (s) => s.SeatName === seat.SeatName
                    );
                    const isBooked = seat.SeatStatus === false;

                    const classes = [
                      "seat",
                      "position-absolute",
                      isBooked
                        ? "booked"
                        : isSelected
                        ? "selected"
                        : "available",
                    ].join(" ");

                    return (
                      <div
                        key={seat.SeatName}
                        className={classes}
                        style={{ top, left }}
                        title={`Seat ${seat.SeatName}`}
                        onClick={() => toggleSeat(seat)}
                      >
                        <small>{seat.SeatName}</small>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted">No seat layout available.</div>
              )}
            </div>
          </Col>

          {/* Legend */}
          <Col md={2} className="mt-5">
            <div className="legend d-flex flex-column gap-2">
              <div>
                <span className="seat available" /> Available
              </div>
              <div>
                <span className="seat selected" /> Selected
              </div>
              <div>
                <span className="seat booked" /> Booked
              </div>
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
                <strong>Selected&nbsp;Seats:</strong>{" "}
                {selectedSeats.map((s) => s.SeatName).join(", ") || "None"}
              </div>

              <div className="mb-3">
                <strong>You&nbsp;Pay:</strong>{" "}
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
