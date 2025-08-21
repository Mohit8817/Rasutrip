import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import './MultiCity.css'; // Your custom styles

const DateSelect = ({onDateChange}) => {

    const [travelDate, setTravelDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);


    const handleSelect = (date) => {
        setTravelDate(date);
        setShowCalendar(false);
    
        onDateChange(date)
        
      };

    const formatDate = (date) =>
        date?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    return (
        <div>
            <div>
                <div className="multi-city-date-picker position-relative text-start">
                    <div
                        className="multi-city-date-button"
                        onClick={() => setShowCalendar((prev) => !prev)}
                    >
                        <span className="Date_label d-block">TRAVEL DATE</span>
                        <span className="multidate d-block fs-5">{formatDate(travelDate)}</span>
                    </div>

                    {showCalendar && (
                        <div className="multi-city-calendar-popup position-absolute bg-white mt-2 shadow rounded">
                            <DayPicker
                                mode="single"
                                selected={travelDate}
                                onSelect={handleSelect}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DateSelect;
