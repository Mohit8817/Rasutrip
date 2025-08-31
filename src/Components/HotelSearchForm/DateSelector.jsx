import React, { useState, useEffect, useRef, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { HotelSearchContext } from "../Context/HotelSearchContext";

const DateSelector = () => {
  const [departDate, setDepartDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  ); // default next day

  const [activeCalendar, setActiveCalendar] = useState(null); // 'depart' or 'return'
  const [currentMonthDepart, setCurrentMonthDepart] = useState(new Date());
  const [currentMonthReturn, setCurrentMonthReturn] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  );

  const wrapperRef = useRef();
  const { setHotelSearchData } = useContext(HotelSearchContext);

  // 📌 Month & Day Names
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // 📌 Format Functions
  const formatDate = (date) =>
    date?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getDayName = (date) =>
    date?.toLocaleDateString("en-GB", { weekday: "long" });

  // 📌 Check if date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // 📌 Generate Calendar Days
  const generateDays = (month) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const days = [];
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) days.push(null);

    for (let d = 1; d <= end.getDate(); d++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    return days;
  };

  const daysDepart = generateDays(currentMonthDepart);
  const daysReturn = generateDays(currentMonthReturn);

  // 📌 Navigate Month
  const navigateMonth = (type, offset) => {
    if (type === "depart") {
      const newMonth = new Date(
        currentMonthDepart.getFullYear(),
        currentMonthDepart.getMonth() + offset,
        1
      );
      setCurrentMonthDepart(newMonth);
    } else {
      const newMonth = new Date(
        currentMonthReturn.getFullYear(),
        currentMonthReturn.getMonth() + offset,
        1
      );
      setCurrentMonthReturn(newMonth);
    }
  };

  // 📌 Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setActiveCalendar(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Update search context
  useEffect(() => {
    setHotelSearchData((prev) => ({
      ...prev,
      checkIn: formatDate(departDate),
      checkOut: formatDate(returnDate),
    }));
  }, [departDate, returnDate]);

  // ✅ Update nights count
  useEffect(() => {
    if (departDate && returnDate) {
      const nights = Math.max(
        1,
        Math.ceil((returnDate - departDate) / (1000 * 60 * 60 * 24))
      );
      setHotelSearchData((prev) => ({
        ...prev,
        nights: nights.toString(),
      }));
    }
  }, [departDate, returnDate]);

  return (
    <>
      <div
        className="d-flex flex-wrap align-items-start custom-date-picker"
        ref={wrapperRef}
      >
        {/* ✅ Check-In Date Picker */}
        <div className="date-button-wrapper position-relative Depart">
          <div
            className="date-button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCalendar((prev) =>
                prev === "depart" ? null : "depart"
              );
            }}
          >
            <span className="date_label">Check-In</span>
            <span className="date">{formatDate(departDate)}</span>
            <span className="day">{getDayName(departDate)}</span>
          </div>

          {activeCalendar === "depart" && (
            <div className="compact-calendar-popup position-absolute bg-white mt-2 shadow rounded">
              <div className="calendar-header">
                <button
                  className="nav-btn"
                  onClick={() => navigateMonth("depart", -1)}
                >
                  «
                </button>
                <div className="month-year">
                  {monthNames[currentMonthDepart.getMonth()]}{" "}
                  {currentMonthDepart.getFullYear()}
                </div>
                <button
                  className="nav-btn"
                  onClick={() => navigateMonth("depart", 1)}
                >
                  »
                </button>
              </div>

              <div className="days-header">
                {dayNames.map((day) => (
                  <div key={day} className="day-name">
                    {day}
                  </div>
                ))}
              </div>

              <div className="days-grid">
                {daysDepart.map((date, index) => {
                  if (!date) return <div key={index} className="day-cell empty"></div>;

                  const isSelected =
                    departDate &&
                    date.toDateString() === departDate.toDateString();
                  
                  const isPast = isPastDate(date);

                  return (
                    <div
                      key={index}
                      className={`day-cell ${isSelected ? "selected" : ""} ${isPast ? "disabled past" : ""}`}
                      onClick={() => {
                        if (!isPast) {
                          setDepartDate(date);
                          // Automatically set return date to next day
                          const nextDay = new Date(date);
                          nextDay.setDate(date.getDate() + 1);
                          setReturnDate(nextDay);
                          setActiveCalendar(null);
                        }
                      }}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Check-Out Date Picker */}
        <div className="date-button-wrapper position-relative Return">
          <div
            className="date-button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCalendar((prev) =>
                prev === "return" ? null : "return"
              );
            }}
          >
            <span className="date_label">Check-Out</span>
            <span className="date">{formatDate(returnDate)}</span>
            <span className="day">{getDayName(returnDate)}</span>
          </div>

          {activeCalendar === "return" && (
            <div className="compact-calendar-popup position-absolute bg-white mt-2 shadow rounded">
              <div className="calendar-header">
                <button
                  className="nav-btn"
                  onClick={() => navigateMonth("return", -1)}
                >
                  «
                </button>
                <div className="month-year">
                  {monthNames[currentMonthReturn.getMonth()]}{" "}
                  {currentMonthReturn.getFullYear()}
                </div>
                <button
                  className="nav-btn"
                  onClick={() => navigateMonth("return", 1)}
                >
                  »
                </button>
              </div>

              <div className="days-header">
                {dayNames.map((day) => (
                  <div key={day} className="day-name">
                    {day}
                  </div>
                ))}
              </div>

              <div className="days-grid">
                {daysReturn.map((date, index) => {
                  if (!date) return <div key={index} className="day-cell empty"></div>;

                  const isDisabled = date <= departDate; // Check-out should be after check-in
                  const isSelected =
                    returnDate &&
                    date.toDateString() === returnDate.toDateString();

                  return (
                    <div
                      key={index}
                      className={`day-cell ${isDisabled ? "disabled" : ""} ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => {
                        if (!isDisabled) {
                          setReturnDate(date);
                          setActiveCalendar(null);
                        }
                      }}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Internal CSS */}
      <style jsx>{`
        .compact-calendar-popup {
          z-index: 1050;
          border: 1px solid #ddd;
          width: 280px;
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

        .day-cell.past {
          color: #ddd;
          cursor: not-allowed;
          text-decoration: line-through;
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

export default DateSelector;