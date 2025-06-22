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

        console.log("DatePicker Component Rendered", departDate);

        const departRef = useRef(null);
        const returnRef = useRef(null);

        const formatDate = (date) => {
            // console.log("Raw JS Date:", date); // Log original date
            return date?.toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "2-digit",
            }, []);

        };

        const getDayName = (date) =>
            date?.toLocaleDateString("en-GB", { weekday: "long" });

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    departRef.current && !departRef.current.contains(event.target) &&
                    returnRef.current && !returnRef.current.contains(event.target)
                ) {
                    setActiveCalendar(null);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

        const formatToPreferredTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-based
            const day = String(date.getDate()).padStart(2, '0');

            const formatted = `${year}-${month}-${day}T00:00:00`; // Local midnight
            return { PreferredTime: formatted };
        };


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
                                    const preferredTimeObj = formatToPreferredTime(date);
                                    console.log("Depart PreferredTime Object:", preferredTimeObj);
                                    setLocationData(prev => ({
                                        ...prev,
                                        departDate: preferredTimeObj,
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
                                    const preferredTimeObj = formatToPreferredTime(date);
                                    console.log("Return PreferredTime Object:", preferredTimeObj);
                                    setLocationData(prev => ({
                                        ...prev,
                                        returnDate: preferredTimeObj,
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
