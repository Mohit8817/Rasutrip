import React from 'react';
import { Container } from 'react-bootstrap';
import houseIcon from '../../../assest/hotel.gif'; // make sure this path is correct

const HotelLoader = () => {
    return (
        <Container fluid className="d-flex justify-content-center align-items-center">
            <div className="bg-white p-5 rounded-4 shadow text-center" style={{ width: '100%', maxWidth: '400px' }}>
                <img src={houseIcon} alt="Hotel Icon" className="mb-4 loader-icon" style={{ width: '80px' }} />

                <h5 className="fw-bold mb-2">Please Wait.....</h5>
                <p className="text-muted mb-4">We are looking for all available hotels for you</p>

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
