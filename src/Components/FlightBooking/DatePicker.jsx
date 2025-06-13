import React, { useState, useEffect, useRef, useContext } from "react";
import { LocationContext } from "../Context/LocationContext";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import '../../Style/FlightBooking.css';

const DatePicker = ({ tripType, setTripType }) => {
    const [departDate, setDepartDate] = useState(new Date());
    const [returnDate, setReturnDate] = useState(new Date());
    const [activeCalendar, setActiveCalendar] = useState(null);
    const { setLocationData } = useContext(LocationContext);

    // refs for both date picker wrappers
    const departRef = useRef(null);
    const returnRef = useRef(null);

    const formatDate = (date) =>
        date?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const getDayName = (date) =>
        date?.toLocaleDateString("en-GB", { weekday: "long" });

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside depart and return refs
            if (
                departRef.current && !departRef.current.contains(event.target) &&
                returnRef.current && !returnRef.current.contains(event.target)
            ) {
                setActiveCalendar(null);
            }
        };

        // Attach listener
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            // Cleanup listener on unmount
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="d-flex flex-wrap align-items-start custom-date-picker">
            {/* Depart */}
            <div
                ref={departRef}
                className="date-button-wrapper position-relative Depart"
            >
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
                                setLocationData(prev => ({
                                    ...prev,
                                    departDate: date, // ✅ store in context
                                }));
                                setActiveCalendar(null);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Return */}
            <div
                ref={returnRef}
                className="date-button-wrapper position-relative Return"
            >
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
                                setLocationData(prev => ({
                                    ...prev,
                                    returnDate: date, // ✅ store in context
                                }));
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
