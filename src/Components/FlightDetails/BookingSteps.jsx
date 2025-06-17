import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlaneDeparture, FaUser, FaClipboardCheck, FaReceipt, FaCreditCard } from 'react-icons/fa';
import '../../Style/Pagescss/FlightResultsPage.css';

const steps = [
    { label: 'Flight Details', icon: <FaPlaneDeparture />, path: '/flight-details' },
    { label: 'Traveller Details', icon: <FaUser />, path: '/traveller-details' },
    { label: 'Addons', icon: <FaClipboardCheck />, path: '/addons' },
    { label: 'Review', icon: <FaReceipt />, path: '/review' },
    { label: 'Payment', icon: <FaCreditCard />, path: '/Payment' }
];

const BookingSteps = () => {
    const location = useLocation();

    return (
        <div className="booking-steps-container container d-flex justify-content-between">
            {steps.map((step, index) => {
                const isActive = location.pathname.includes(step.path); // match by path
                return (
                    <div key={index} className={`step-item text-center px-2 ${isActive ? 'active' : ''}`}>
                        <div className="step-icon mb-1">
                            <span className="icon">{step.icon}</span>
                        </div>
                        <div className="step-label">{step.label}</div>
                        {index < steps.length - 1 && <div className="step-line" />}
                    </div>
                );
            })}
        </div>
    );
};

export default BookingSteps;
