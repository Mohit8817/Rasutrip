import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/FlightBooking.css"; // use your existing styles

const DateSelector = () => {
  const [departDate, setDepartDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [activeCalendar, setActiveCalendar] = useState(null); // 'depart' or 'return'

  const wrapperRef = useRef();

  // close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setActiveCalendar(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (date) =>
    date?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getDayName = (date) =>
    date?.toLocaleDateString("en-GB", { weekday: "long" });

  return (
    <div
      className="d-flex flex-wrap align-items-start custom-date-picker"
      ref={wrapperRef}
    >
      {/* Depart */}
      <div className="date-button-wrapper position-relative Depart">
        <div
          className="date-button"
          onClick={(e) => {
            e.stopPropagation(); // stop bubbling
            setActiveCalendar((prev) => (prev === "depart" ? null : "depart"));
          }}
        >
          <span className="date_label">Check-In</span>
          <span className="date">{formatDate(departDate)}</span>
          <span className="day">{getDayName(departDate)}</span>
        </div>
        {activeCalendar === "depart" && (
          <div className="calendar-popup position-absolute bg-white mt-2 shadow rounded">
            <DayPicker
              mode="single"
              selected={departDate}
              onSelect={(date) => {
                setDepartDate(date);
                setActiveCalendar(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Return */}
      <div className="date-button-wrapper position-relative Return">
        <div
          className="date-button"
          onClick={(e) => {
            e.stopPropagation(); // stop bubbling
            setActiveCalendar((prev) => (prev === "return" ? null : "return"));
          }}
        >
          <span className="date_label">Check-Out</span>
          <span className="date">{formatDate(returnDate)}</span>
          <span className="day">{getDayName(returnDate)}</span>
        </div>
        {activeCalendar === "return" && (
          <div className="calendar-popup position-absolute bg-white mt-2 shadow rounded">
            <DayPicker
              mode="single"
              selected={returnDate}
              onSelect={(date) => {
                setReturnDate(date);
                setActiveCalendar(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelector;
