import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import './MultiCity.css'; // Your custom styles


const AddMorecitydatapick = () => {

    const [travelDate, setTravelDate] = useState(null); // Initially no date selected
    const [showCalendar, setShowCalendar] = useState(false);

    const calendarRef = useRef(null); // Ref for the calendar wrapper

    const formatDate = (date) =>
        date?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // Cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCalendar]);
    return (
        <div>
            <div
                className="multi-city-date-picker position-relative text-start "
                ref={calendarRef}>
                <div
                    className="sec-multi-city-date-button p-3"
                    onClick={() => setShowCalendar((prev) => !prev)}>
                    <span className="Date_label d-block">TRAVEL DATE</span>
                    <span
                        className={`date d-block fs-5 fw-bold ${!travelDate ? "text-muted" : ""
                            }`}>
                        {travelDate ? formatDate(travelDate) : "Depart date"}
                    </span>
                </div>

                {showCalendar && (
                    <div className="multi-city-calendar-popup position-absolute bg-white mt-2 shadow rounded">
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

export default AddMorecitydatapick