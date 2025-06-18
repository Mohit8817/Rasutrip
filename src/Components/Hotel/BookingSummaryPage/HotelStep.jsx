import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaHotel, FaUser, FaClipboardList, FaCreditCard } from 'react-icons/fa';

const steps = [
    { label: 'Hotel Details', icon: <FaHotel />, path: '/HotelDetail' },
    { label: 'Guest Details', icon: <FaUser />, path: '/guest-details' },
    { label: 'Review', icon: <FaClipboardList />, path: '/review' },
    { label: 'Payment', icon: <FaCreditCard />, path: '/payment' }
];

const HotelStep = () => {
    const location = useLocation();

    return (
        <Container className="booking-steps-container container d-flex justify-content-between mt-5 pt-5">
            {steps.map((step, index) => {
                const isActive = location.pathname.includes(step.path);
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
        </Container>
    );
};

export default HotelStep;
