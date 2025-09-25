import React, { useState, useContext, useEffect } from "react";
import { LocationContext } from "../Context/LocationContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/BusBooking.css";

const TravelDate = () => {
  const { locationData, setLocationData } = useContext(LocationContext);
  const [showCalendar, setShowCalendar] = useState(false);
  const [travelDate, setTravelDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // useEffect(() => {
  //   const parsed = new Date(locationData?.departDate);
  //   const isValid = parsed instanceof Date && !isNaN(parsed);

  //   const date = isValid ? parsed : new Date();
  //   setTravelDate(date);
  //   setCurrentMonth(date);

  //   if (!isValid) {
  //     const localDateString = formatDateForStorage(date);
  //     setLocationData((prev) => ({
  //       ...prev,
  //       departDate: localDateString,
  //     }));
  //   }
  // }, [locationData?.departDate, setLocationData]);
  useEffect(() => {
    let date;
    if (locationData?.departDate) {
      const parsed = new Date(locationData.departDate);
      if (!isNaN(parsed)) {
        date = parsed;
      }
    }

    if (!date) {
      date = new Date(); // default to today
      const localDateString = formatDateForStorage(date);
      setLocationData((prev) => ({
        ...prev,
        departDate: localDateString,
      }));
    }

    setTravelDate(date);
    setCurrentMonth(date);
  }, [locationData?.departDate, setLocationData]);

  const formatDateForStorage = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const handleDateSelect = (date) => {
    if (!date || isNaN(date)) return;

    setTravelDate(date);
    setShowCalendar(false);

    const localDateString = formatDateForStorage(date);
    setLocationData((prev) => ({
      ...prev,
      departDate: localDateString,
    }));

    console.log("Selected date:", date.toDateString());
    console.log("Stored as:", localDateString);
  };

  const formatDate = (date) =>
    date?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) || "Invalid Date";

  // Calendar logic
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date) => {
    if (!date || !travelDate) return false;
    return date.toDateString() === travelDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <>
      <div className="container">
        <div className="single-date-picker text-start">
          <div
            className="date-button"
            onClick={() => setShowCalendar((prev) => !prev)}
          >
            <span className="city-label">TRAVEL DATE</span>
            <span className="date d-block fs-5 fw-bold">
              {formatDate(travelDate)}
            </span>
          </div>
        </div>

        {showCalendar && (
          <div className="compact-calendar-popup position-absolute bg-white mt-2 shadow rounded">
            {/* Header */}
            <div className="calendar-header">
              <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                «
              </button>
              <div className="month-year">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </div>
              <button className="nav-btn" onClick={() => navigateMonth(1)}>
                »
              </button>
            </div>

            {/* Day Headers */}
            <div className="days-header">
              {dayNames.map((day) => (
                <div key={day} className="day-name">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="days-grid">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="day-cell empty"></div>;
                }

                const isDisabled = isDateDisabled(date);
                const isSelected = isDateSelected(date);

                return (
                  <div
                    key={index}
                    className={`day-cell ${isDisabled ? "disabled" : ""} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .compact-calendar-popup {
          z-index: 1050;
          border: 1px solid #ddd;
          width: 280px;
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .calendar-header {
          background: #c41e3a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          font-weight: 600;
        }

        .nav-btn {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .month-year {
          font-size: 14px;
          font-weight: 600;
        }

        .days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .day-name {
          padding: 8px 4px;
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          color: #666;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          padding: 8px;
          gap: 2px;
        }

        .day-cell {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
          color: #333;
        }

        .day-cell:not(.empty):not(.disabled):hover {
          background: #e3f2fd;
          color: #1976d2;
        }

        .day-cell.selected {
          background: #c41e3a !important;
          color: white !important;
          font-weight: 600;
        }

        .day-cell.disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        .day-cell.empty {
          cursor: default;
        }

        @media (max-width: 768px) {
          .compact-calendar-popup {
            width: 260px;
          }
        }
      `}</style>
    </>
  );
};

export default TravelDate;
