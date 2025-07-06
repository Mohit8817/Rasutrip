import React, { useState, useContext, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { LocationContext } from "../Context/LocationContext";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/BusBooking.css";

const TravelDate = () => {
  const { locationData, setLocationData } = useContext(LocationContext);
  const [travelDate, setTravelDate] = useState(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (locationData?.departDate) {
      const parsedDate = new Date(locationData.departDate);
      if (!isNaN(parsedDate)) {
        setTravelDate(parsedDate);
      } else {
        setTravelDate(new Date());
      }
    }
  }, [locationData.departDate]);

  const formatDate = (date) => {
    if (!date || isNaN(date)) return "Invalid Date";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDateSelect = (date) => {
    if (!date || isNaN(date)) return;
    setTravelDate(date);
    setShowCalendar(false);

    // ✅ Set selected date in LocationContext
    setLocationData((prev) => ({
      ...prev,
      departDate: date.toISOString(), // Store as ISO format
    }));
  };

  return (
    <div className="single-date-picker position-relative text-start">
      <div
        className="date-button p-3"
        onClick={() => setShowCalendar((prev) => !prev)}
      >
        <span className="city-label">TRAVEL DATE</span>
        <span className="date d-block fs-4 fw-bold">
          {formatDate(travelDate)}
        </span>
      </div>

      {showCalendar && (
        <div className="calendar-popup position-absolute bg-white mt-2 shadow rounded">
          <DayPicker
            mode="single"
            selected={travelDate}
            onSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  );
};

export default TravelDate;
