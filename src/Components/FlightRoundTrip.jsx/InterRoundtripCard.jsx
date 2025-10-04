import React, { useState } from "react";
import "./InterRoundtripCard.css";
import { FaPlaneDeparture, FaTimes } from "react-icons/fa";
import { Button, Col, Row, Tab, Nav } from "react-bootstrap";
import FarePopup from "../FlightOneWay/Farepopup";

const InterRoundtripCard = ({ flight, onBook, selectedFare }) => {
  const [showFarePopup, setShowFarePopup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("flight");
  const fare = flight?.FareList?.[0].Fare.BaseFare || 0;
  const refundable = flight?.FareList?.[0]?.IsRefundable
    ? "Refundable"
    : "Non-refundable";
  const cabinClass = flight?.FareList?.[0]?.CabinClass || "Economy";
  const seatsLeft =
    flight?.FareList?.[0]?.SeatBaggage?.[0]?.[0]?.NoOfSeatAvailable || 9;

  const formatTime = (str) => new Date(str).toTimeString().slice(0, 5);
  const formatDate = (str) => {
    const date = new Date(str);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const getTotalDuration = (segments) => {
    if (!segments || segments.length === 0) return "";
    const totalMinutes = segments[segments.length - 1]?.TotalDuration || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getStopsInfo = (segments) => {
    if (!segments || segments.length <= 1) return "Direct";
    return `${segments.length - 1} Stop${segments.length - 1 > 1 ? "s" : ""}`;
  };

  const handleBooking = () => {
    // Original functionality - open fare popup for booking
    setShowFarePopup(true);
  };

  const renderTripRow = (tripSegments, tripIndex) => {
    if (!tripSegments || tripSegments.length === 0) return null;

    const firstSegment = tripSegments[0];
    const lastSegment = tripSegments[tripSegments.length - 1];

    const airline = firstSegment?.Airline?.AirlineName || "Airline";
    const flightNumbers = tripSegments
      .map(
        (seg) => `${seg?.Airline?.AirlineCode}-${seg?.Airline?.FlightNumber}`
      )
      .join(", ");

    const fromCity = firstSegment?.Origin?.CityCode || "";
    const toCity = lastSegment?.Destination?.CityCode || "";

    const depTime = formatTime(firstSegment?.Origin?.DepartTime);
    const arrTime = formatTime(lastSegment?.Destination?.ArrivalTime);

    const depDate = formatDate(firstSegment?.Origin?.DepartTime);
    const arrDate = formatDate(lastSegment?.Destination?.ArrivalTime);

    const totalDuration = getTotalDuration(tripSegments);
    const stopsInfo = getStopsInfo(tripSegments);

    return (
      <div
        key={tripIndex}
        className="d-flex align-items-center py-3 border-bottom"
      >
        <div className="d-flex align-items-center" style={{ width: "200px" }}>
          <img
            src={firstSegment?.Airline?.airlineLogo}
            alt="logo"
            width={24}
            height={24}
            className="me-2"
          />
          <div>
            <div className="fw-semibold small">{airline}</div>
            <div className="text-muted" style={{ fontSize: "11px" }}>
              {flightNumbers}
            </div>
          </div>
        </div>

        <div className="text-center" style={{ width: "100px" }}>
          <div className="fw-bold">{fromCity}</div>
          <div className="fw-bold">{depTime}</div>
          <div className="text-muted small">{depDate}</div>
        </div>

        <div className="text-center flex-grow-1 px-3">
          <div className="text-muted small">{stopsInfo}</div>
          <div className="d-flex align-items-center justify-content-center my-1">
            <div className="border-top flex-grow-1"></div>
            <FaPlaneDeparture className="mx-2 text-muted" size={12} />
            <div className="border-top flex-grow-1"></div>
          </div>
          <div className="fw-semibold small">{totalDuration}</div>
        </div>

        <div className="text-center" style={{ width: "100px" }}>
          <div className="fw-bold">{toCity}</div>
          <div className="fw-bold">{arrTime}</div>
          <div className="text-muted small">{arrDate}</div>
        </div>
      </div>
    );
  };

  const renderFlightDetailsTab = () => {
    return flight.Segments.map((tripSegments, tripIndex) => (
      <div key={tripIndex} className="mb-4">
        <h6 className="fw-bold mb-3">
          {tripIndex === 0
            ? `${tripSegments[0]?.Origin?.CityName} → ${
                tripSegments[tripSegments.length - 1]?.Destination?.CityName
              } ${formatDate(tripSegments[0]?.Origin?.DepartTime)}`
            : `${tripSegments[0]?.Origin?.CityName} → ${
                tripSegments[tripSegments.length - 1]?.Destination?.CityName
              } ${formatDate(tripSegments[0]?.Origin?.DepartTime)}`}
        </h6>

        {tripSegments.map((segment, segIndex) => (
          <div
            key={segIndex}
            className="d-flex align-items-center mb-3 p-3 bg-light rounded"
          >
            <div className="me-3">
              <img
                src={segment?.Airline?.airlineLogo}
                alt="logo"
                width={32}
                height={32}
              />
            </div>

            <div style={{ width: "120px" }}>
              <div className="fw-bold">
                {segment?.Airline?.AirlineCode}-{segment?.Airline?.FlightNumber}
              </div>
              <div className="small text-muted">✈ {segment?.Craft}</div>
            </div>

            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-center">
                  <div className="fw-bold">
                    {formatTime(segment?.Origin?.DepartTime)}
                  </div>
                  <div className="small">
                    {formatDate(segment?.Origin?.DepartTime)}
                  </div>
                  <div className="small text-muted">
                    {segment?.Origin?.CityName}
                  </div>
                  <div className="small text-muted">
                    {segment?.Origin?.AirportName}
                  </div>
                  <div className="small text-muted">
                    Terminal {segment?.Origin?.Terminal}
                  </div>
                </div>

                <div className="text-center flex-grow-1">
                  <div className="small text-muted">Non-Stop</div>
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="border-top flex-grow-1"></div>
                    <FaPlaneDeparture className="mx-2 text-muted" />
                    <div className="border-top flex-grow-1"></div>
                  </div>
                  <div className="small fw-semibold">
                    {Math.floor(segment?.Duration / 60)}h{" "}
                    {segment?.Duration % 60}m
                  </div>
                </div>

                <div className="text-center">
                  <div className="fw-bold">
                    {formatTime(segment?.Destination?.ArrivalTime)}
                  </div>
                  <div className="small">
                    {formatDate(segment?.Destination?.ArrivalTime)}
                  </div>
                  <div className="small text-muted">
                    {segment?.Destination?.CityName}
                  </div>
                  <div className="small text-muted">
                    {segment?.Destination?.AirportName}
                  </div>
                  <div className="small text-muted">
                    Terminal {segment?.Destination?.Terminal}
                  </div>
                </div>
              </div>

              {segment?.LayoverTime > 0 && (
                <div className="text-center mt-2">
                  <div className="small text-warning">
                    Layover: {segment?.Layover}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ));
  };

  const renderFareDetailsTab = () => {
    const fareBreakdown = flight?.FareList?.[0]?.FareBreakdown?.ADT;
    const fareDetails = flight?.FareList?.[0]?.Fare;

    return (
      <div>
        <h6 className="mb-3">Fare Details for Adult</h6>
        <table className="table">
          <thead>
            <tr className="text-muted">
              <th>TYPE</th>
              <th>Fare</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base Price</td>
              <td>₹ {fareDetails?.BaseFare} x 1</td>
              <td>₹ {fareDetails?.BaseFare}</td>
            </tr>
            <tr>
              <td>Taxes and fees</td>
              <td>₹ {fareDetails?.Tax} x 1</td>
              <td>₹ {fareDetails?.Tax}</td>
            </tr>
            <tr>
              <td>Service and Other Charges</td>
              <td>₹ {fareDetails?.ServiceCharges || 0}</td>
              <td>₹ {fareDetails?.ServiceCharges || 0}</td>
            </tr>
            <tr>
              <td>GST</td>
              <td>₹ {fareDetails?.GST?.IGSTAmount || 0}</td>
              <td>₹ {fareDetails?.GST?.IGSTAmount || 0}</td>
            </tr>
            <tr>
              <td>Discount(-)</td>
              <td>₹ {fareDetails?.Discount || 0}</td>
              <td>₹ {fareDetails?.Discount || 0}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="fw-bold fs-4">
              <td>Total</td>
              <td></td>
              <td>₹ {fare}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const renderFareRulesTab = () => {
    return (
      <div>
        <p>
          <strong>Refundable:</strong> {refundable}
        </p>
        <p>
          <strong>Fare Type:</strong> {flight?.FareList?.[0]?.FareType}
        </p>
        <p>
          <strong>Cancellation:</strong> Charges may apply as per airline policy
        </p>
        <p>
          <strong>Date Change:</strong> Charges may apply + fare difference
        </p>
        <p>
          <strong>No-show:</strong> Only taxes may be refunded
        </p>
      </div>
    );
  };

  const renderBaggageTab = () => {
    const seatBaggage = flight?.FareList?.[0]?.SeatBaggage;
    if (!seatBaggage) return <p>Baggage information not available</p>;

    return (
      <div>
        <table className="table">
          <thead>
            <tr className="text-muted">
              <th>SECTOR</th>
              <th>CHECKIN</th>
              <th>CABIN</th>
            </tr>
          </thead>
          <tbody>
            {seatBaggage.map((trip, tripIndex) =>
              trip.map((segment, segIndex) => (
                <tr key={`${tripIndex}-${segIndex}`}>
                  <td>{segment.Sector}</td>
                  <td>
                    {segment.CheckIn === "0 KG" ? "20 KG" : segment.CheckIn}
                  </td>
                  <td>
                    {segment.Cabin === "Included" ? "7 KG" : segment.Cabin}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flight-card border rounded bg-white shadow-sm p-3 mb-3">
      {/* Main Flight Info */}
      {flight?.Segments?.map((tripSegments, tripIndex) =>
        renderTripRow(tripSegments, tripIndex)
      )}

      {/* Bottom Section */}
      <div className="d-flex justify-content-between align-items-center pt-3">
        <div className="d-flex align-items-center text-muted small">
          <FaPlaneDeparture className="me-2" />
          <span>Flight Arrives after 1 Day(s)</span>
          <span className="text-warning fw-semibold ms-3">
            Seats left: {seatsLeft}
          </span>
          <span className="ms-3">Airline Remark:</span>
        </div>

        <div className="d-flex align-items-center">
          <div className="text-end me-3">
            <div className="d-flex align-items-center">
              <span className="text-primary me-2">₹</span>
              <span className="fw-bold fs-4">{fare}</span>
              <span className="badge bg-secondary ms-2 small">Publish</span>
            </div>
            <div className="small">
              <span className="text-muted">{cabinClass}, </span>
              <span
                className={
                  refundable === "Refundable" ? "text-success" : "text-muted"
                }
              >
                {refundable}
              </span>
            </div>
          </div>

          <div className="d-flex flex-column">
            <Button
              variant="warning"
              size="sm"
              className="mb-2 fw-bold"
              onClick={handleBooking}
            >
              BOOK
            </Button>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide Details" : "View Details"}
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none text-dark p-0"
                onClick={() => setShowDetails(!showDetails)}
              >
                Flight Details —
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Flight Details Section */}
      {showDetails && (
        <div className="mt-4 p-3 bg-light border rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "flight"}
                  onClick={() => setActiveTab("flight")}
                  className={`${
                    activeTab === "flight" ? "bg-warning text-dark" : ""
                  } px-3 py-2`}
                >
                  Flight Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "fare"}
                  onClick={() => setActiveTab("fare")}
                  className={`${
                    activeTab === "fare" ? "bg-warning text-dark" : ""
                  } px-3 py-2`}
                >
                  Fare Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "rules"}
                  onClick={() => setActiveTab("rules")}
                  className={`${
                    activeTab === "rules" ? "bg-warning text-dark" : ""
                  } px-3 py-2`}
                >
                  Fare Rules
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "baggage"}
                  onClick={() => setActiveTab("baggage")}
                  className={`${
                    activeTab === "baggage" ? "bg-warning text-dark" : ""
                  } px-3 py-2`}
                >
                  Baggage
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Button
              variant="link"
              onClick={() => setShowDetails(false)}
              className="p-0"
            >
              <FaTimes />
            </Button>
          </div>

          <div className="tab-content">
            {activeTab === "flight" && renderFlightDetailsTab()}
            {activeTab === "fare" && renderFareDetailsTab()}
            {activeTab === "rules" && renderFareRulesTab()}
            {activeTab === "baggage" && renderBaggageTab()}
          </div>
        </div>
      )}

      {/* Fare Popup for additional fare details */}
      <FarePopup
        show={showFarePopup}
        onClose={() => setShowFarePopup(false)}
        fares={flight}
      />
    </div>
  );
};

export default InterRoundtripCard;
