import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import '../../Style/FlightBooking.css';

const DatePicker = ({ tripType, setTripType }) => {
    const [departDate, setDepartDate] = useState(new Date());
    const [returnDate, setReturnDate] = useState(new Date());
    const [activeCalendar, setActiveCalendar] = useState(null);

    const formatDate = (date) =>
        date?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const getDayName = (date) =>
        date?.toLocaleDateString("en-GB", { weekday: "long" });


    return (
        <div className="d-flex flex-wrap align-items-start custom-date-picker">
            {/* Depart */}
            <div className="date-button-wrapper position-relative Depart">
                <div
                    className="date-button"
                    onClick={() =>
                        setActiveCalendar((prev) => (prev === "depart" ? null : "depart"))
                    }
                >
                    <span className="label">DEPART</span>
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
                    onClick={() => {
                        if (tripType === 'oneway') {
                            setTripType('roundtrip');
                            setTimeout(() => {
                                setActiveCalendar("return");
                            }, 0);
                        } else {
                            setActiveCalendar((prev) => (prev === "return" ? null : "return"));
                        }
                    }}
                >
                    <span className="label">RETURN</span>

                    {/* Always render these spans to keep structure consistent */}
                    <span className="date">
                        {tripType !== 'oneway' ? formatDate(returnDate) : ' --/--/----'}
                    </span>
                    <span className="day">
                        {tripType !== 'oneway' ? getDayName(returnDate) : 'Book a round trip..'}
                    </span>
                </div>


                {activeCalendar === "return" && (tripType === 'roundtrip' || tripType === 'multicity') && (
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

export default DatePicker;
