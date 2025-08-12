import React, { useState, useContext, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { LocationContext } from "../Context/LocationContext";
import "react-day-picker/dist/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/BusBooking.css";

const TravelDate = () => {
    const { locationData, setLocationData } = useContext(LocationContext);
    const [showCalendar, setShowCalendar] = useState(false);
    const [travelDate, setTravelDate] = useState(() => new Date());

    useEffect(() => {
        const parsed = new Date(locationData?.departDate);
        const isValid = parsed instanceof Date && !isNaN(parsed);

        const date = isValid ? parsed : new Date();
        setTravelDate(date);

        if (!isValid) {
            // Fix: Store date in local timezone format instead of ISO string
            const localDateString = formatDateForStorage(date);
            setLocationData((prev) => ({
                ...prev,
                departDate: localDateString,
            }));
        }
    }, [locationData?.departDate, setLocationData]);

    // Helper function to format date for storage (avoids timezone issues)
    const formatDateForStorage = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00.000Z`; // Keep time as midnight UTC
    };

    const handleDateSelect = (date) => {
        if (!date || isNaN(date)) return;
        
        setTravelDate(date);
        setShowCalendar(false);
        
        // Fix: Store date in correct format to avoid timezone issues
        const localDateString = formatDateForStorage(date);
        setLocationData((prev) => ({
            ...prev,
            departDate: localDateString,
        }));

        console.log("Selected date:", date.toDateString()); // Debug log
        console.log("Stored as:", localDateString); // Debug log
    };

    const formatDate = (date) =>
        date?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }) || "Invalid Date";

    return (
        <div className="single-date-picker position-relative text-start">
            <div className="date-button p-3" onClick={() => setShowCalendar((prev) => !prev)}>
                <span className="city-label">TRAVEL DATE</span>
                <span className="date d-block fs-4 fw-bold">{formatDate(travelDate)}</span>
            </div>

            {showCalendar && (
                <div className="calendar-popup position-absolute bg-white mt-2 shadow rounded">
                    <DayPicker 
                        mode="single" 
                        selected={travelDate} 
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()} // Disable past dates
                    />
                </div>
            )}
        </div>
    );
};

export default TravelDate;