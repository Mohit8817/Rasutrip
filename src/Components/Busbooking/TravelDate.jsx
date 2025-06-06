import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import '../../Style/BusBooking.css'; // Your custom styles

const TravelDate = () => {

     const [travelDate, setTravelDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);

    const formatDate = (date) =>
        date?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
  return (
    <div>

       <div className="single-date-picker position-relative text-start">
            <div
                className="date-button border rounded p-3"
                onClick={() => setShowCalendar((prev) => !prev)}
            >
                <span className="label d-block small">TRAVEL DATE</span>
                <span className="date d-block fs-4 fw-bold">{formatDate(travelDate)}</span>
            </div>

            {showCalendar && (
                <div className="calendar-popup position-absolute bg-white mt-2 shadow rounded">
                    <DayPicker
                        mode="single"
                        selected={travelDate}
                        onSelect={(date) => {
                            setTravelDate(date);
                            setShowCalendar(false);
                        }}
                    />
                </div>
            )}
        </div>


    </div>
  )
}

export default TravelDate