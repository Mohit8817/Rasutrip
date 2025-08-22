import React from 'react';

const Busloader = ({ from, to, departDate }) => {
    return (
        <div className="d-flex justify-content-center align-items-center mt-0 pt-0">
            <div className="text-center bg-white p-4  rounded-4">
                {/* Bus Animation */}
                <div className="loader-wrapper mb-4">
                    <div className="truck-wrapper">
                        <div className="truck">
                            <div className="truck-container"></div>
                            <div className="glases"></div>
                            <div className="bonet"></div>
                            <div className="base"></div>
                            <div className="base-aux"></div>
                            <div className="wheel-back"></div>
                            <div className="wheel-front"></div>
                            <div className="smoke"></div>
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <h5 className="fw-bold mb-2">Please Wait...</h5>
                <p className="text-muted mb-3">We are looking for all available buses for you</p>

                {/* Dots Animation */}
                <div className="mb-4 d-flex justify-content-center gap-2">
                    <span className="dot dot1"></span>
                    <span className="dot dot2"></span>
                    <span className="dot dot3"></span>
                </div>

                {/* Route & Date Info - Only show if data is available */}
                {from && to && (
                    <div className="fw-bold mb-1">
                        <span className="text-dark">{from}</span> 
                        <span className="text-muted mx-2">→</span> 
                        <span className="text-dark">{to}</span>
                    </div>
                )}
                
                {departDate && (
                    <div className="text-muted">
                        <span className="fw-bold">Departure:</span> 
                        <span className="text-dark ms-1">{departDate}</span>
                    </div>
                )}
                
                {/* Show fallback message if no route info */}
                {(!from || !to) && (
                    <div className="text-muted">
                        Searching for buses...
                    </div>
                )}
            </div>
        </div>
    );
};

export default Busloader;