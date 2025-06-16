import React from 'react';
import { FaPlaneDeparture, FaUser, FaClipboardCheck, FaReceipt, FaCreditCard } from 'react-icons/fa';
import '../../Style/Pagescss/FlightResultsPage.css'; // CSS file we'll define below

const steps = [
    { label: 'Flight Details', icon: <FaPlaneDeparture /> },
    { label: 'Traveller Details', icon: <FaUser /> },
    { label: 'Addons', icon: <FaClipboardCheck /> },
    { label: 'Review', icon: <FaReceipt /> },
    { label: 'Payment', icon: <FaCreditCard /> }
];

const BookingSteps = ({ activeIndex = 0 }) => {
    return (
        <div className="booking-steps-container container">
            {steps.map((step, index) => (
                <div key={index} className={`step-item ${index === activeIndex ? 'active' : ''}`}>
                    <div className="step-icon">
                        <span className="icon">{step.icon}</span>
                    </div>
                    <div className="step-label">{step.label}</div>
                    {index < steps.length -1 && <div className="step-line" />}
                </div>
            ))}
        </div>
    );
};

export default BookingSteps;
