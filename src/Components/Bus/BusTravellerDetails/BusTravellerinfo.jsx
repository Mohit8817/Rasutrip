import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
const BusTravellerinfo = () => {

        const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/bus-Review');
    };
    return (
        <div>

            <h2 className="text-center">Bus Traveller Information</h2>
            Page Coomming soom

            <div className="text-start mt-2">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Booking
                </Button>
            </div>
        </div>



    )
}

export default BusTravellerinfo