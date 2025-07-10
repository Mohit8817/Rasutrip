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

  // Parse seat data from raw HTML
  const parseSeatsFromHTML = useCallback((html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const divs = doc.querySelectorAll(".seatcontainer div");

    const seatMap = {};
    divs.forEach((div) => {
      const id = div.getAttribute("id");
      const className = div.className;
      const onclickAttr = div.getAttribute("onclick");
      const seatMatch = onclickAttr?.match(/'([A-Za-z0-9]+)'/);
      const fareMatch = onclickAttr?.match(/, *'([\d.]+)'/);

      const seatName = seatMatch?.[1] || id;
      const fare = fareMatch ? parseFloat(fareMatch[1]) : 0;

      seatMap[seatName] = {
        top: div.style.top || "0px",
        left: div.style.left || "0px",
        className,
        fare,
      };
    });

    return seatMap;
  }, []);

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
        setSeatPositions(parseSeatsFromHTML(data?.Result?.HTMLLayout ?? ""));
      } catch (err) {
        console.error("Error loading seat layout:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSeatLayout();
  }, [
    show,
    bus?.SearchTokenId,
    bus?.resultIndex,
    bus?.UserIp,
    bus?.OriginId,
    bus?.DestinationId,
    parseSeatsFromHTML,
  ]);

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
            <div className="seat-layout-box border p-3" style={{ minHeight: 220 }}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : seatLayout.length ? (
                <div
                  className="seat-absolute-wrapper position-relative"
                  style={{ height: 220, width: 300 }}
                >
                  {seatLayout.map((seat) => {
                    const info = seatPositions[seat.SeatName] || {};
                    const { top = "0px", left = "0px", className = "hseat" } = info;

                    const isSelected = selectedSeats.some(
                      (s) => s.SeatName === seat.SeatName
                    );
                    const isBooked = seat.SeatStatus === false;

                    const finalClass = [
                      "seat",
                      className,
                      "position-absolute",
                      isSelected ? "selected" : "",
                    ].join(" ");

                    return (
                      <div
                        key={seat.SeatName}
                        className={finalClass}
                        style={{ top, left }}
                        title={`Seat: ${seat.SeatName} | ₹${info.fare || seat?.Price?.PublishedPrice || 450}`}
                        onClick={() => !isBooked && toggleSeat(seat)}
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

          {/* Seat type legend */}
          <Col md={2} className="mt-5">
            <div className="legend d-flex flex-column gap-2">
              <div>
                <span className="seat hseat" /> Available
              </div>
              <div>
                <span className="seat selected" /> Selected
              </div>
              <div>
                <span className="seat bhseat" /> Booked
              </div>
              <div>
                <span className="seat rseat" /> Discounted
              </div>
              <div>
                <span className="seat bseat" /> Empty Space
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
