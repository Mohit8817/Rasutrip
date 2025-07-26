import React from "react";
import { Card } from "react-bootstrap";
import { FaCalendarCheck, FaCalendarTimes, FaMoon } from "react-icons/fa";
import { PiBed } from "react-icons/pi";
import "./HotelDetails.css";

const BookingInfoCard = ({ searchDetails }) => {
  const {
    checkIn = "",
    checkOut = "",
    nights = 1,
    rooms = 1,
    guests = 1,
  } = searchDetails || {};

  // Optional: Get weekday names
  const getDay = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? "" : date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div className="booking-info-wrapper p-3">
      {/* Check In */}
      <Card className="mb-2 box-card">
        <Card.Body className="d-flex justify-content-between align-items-center py-2 px-3">
          <div className="d-flex align-items-center">
            <FaCalendarCheck size={22} className="me-3" />
            <span className="fw-medium text-muted">Check In</span>
          </div>
          <div className="text-end">
            <div className="fw-bold">{checkIn}</div>
            <div className="text-muted small">{getDay(checkIn)}</div>
          </div>
        </Card.Body>
      </Card>

      {/* Nights */}
      <Card className="mb-2 box-card">
        <Card.Body className="d-flex justify-content-between align-items-center py-2 px-3">
          <div>
            <FaMoon size={22} className="me-3" />
            <span className="fw-medium text-muted">Nights</span>
          </div>
          <div>
            <span className="fw-bold">{nights} Night{nights > 1 ? "s" : ""}</span>
          </div>
        </Card.Body>
      </Card>

      {/* Check Out */}
      <Card className="mb-2 box-card">
        <Card.Body className="d-flex justify-content-between align-items-center py-2 px-3">
          <div className="d-flex align-items-center">
            <FaCalendarTimes size={22} className="me-3" />
            <span className="fw-medium text-muted">Check Out</span>
          </div>
          <div className="text-end">
            <div className="fw-bold">{checkOut}</div>
            <div className="text-muted small">{getDay(checkOut)}</div>
          </div>
        </Card.Body>
      </Card>

      {/* Rooms & Guests */}
      <Card className="box-card">
        <Card.Body className="d-flex justify-content-between align-items-center py-2 px-3">
          <div className="d-flex align-items-center">
            <PiBed size={22} className="me-3" />
            <span className="fw-medium text-muted">Rooms & guests</span>
          </div>
          <div className="fw-bold text-end">
            {rooms} Room <span className="fw-normal">{guests} Guest</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BookingInfoCard;
