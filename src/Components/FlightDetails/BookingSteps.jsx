import React from 'react';

const steps = ['Flight Details', 'Traveller Details', 'Addons', 'Review', 'Payment'];

const BookingSteps = ({ activeIndex = 0 }) => {
    return (
        <div className="step-progress d-flex justify-content-between align-items-center mt-5 pt-5">
            {steps.map((step, index) => (
                <div key={index} className={`step ${index === activeIndex ? 'active' : ''}`}>
                    <div className="circle">{index + 1}</div>
                    <div className="label">{step}</div>
                </div>
            ))}
        </div>
    );
};

export default BookingSteps;
