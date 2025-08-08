import React from 'react';
import { Container } from 'react-bootstrap';
import houseIcon from '../../../assest/hotel.gif'; // make sure this path is correct

const HotelLoader = ({ city, checkIn, checkOut, guests, rooms }) => {
    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="bg-white p-5 rounded-4 shadow text-center" style={{ width: '100%', maxWidth: '450px' }}>
                {/* Centered GIF with better styling */}
                <div className="d-flex justify-content-center align-items-center mb-4">
                    <img 
                        src={houseIcon} 
                        alt="Hotel Icon" 
                        className="loader-icon" 
                        style={{ 
                            width: '80px', 
                            height: 'auto',
                            display: 'block'
                        }} 
                    />
                </div>

                <h5 className="fw-bold mb-2">Please Wait.....</h5>
                <p className="text-muted mb-4">We are looking for all available hotels for you</p>

                {/* Search Parameters Display */}
                <div className="mb-4">
                    <p className="text-secondary mb-1">
                        <strong>{city}</strong>
                    </p>
                    <p className="text-secondary mb-1">
                        <strong>{checkIn}</strong> → <strong>{checkOut}</strong>
                    </p>
                    <p className="text-secondary mb-1">
                        Guests: <strong>{guests}</strong> | Rooms: <strong>{rooms}</strong>
                    </p>
                </div>

                <div className="dot-loader d-flex justify-content-center gap-2">
                    <span className="dot dot1"></span>
                    <span className="dot dot2"></span>
                    <span className="dot dot3"></span>
                    <span className="dot dot4"></span>
                </div>
            </div>
        </Container>
    );
};

export default HotelLoader;