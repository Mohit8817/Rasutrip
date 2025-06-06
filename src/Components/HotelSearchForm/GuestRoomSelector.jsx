import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css'; // Optional custom styles
const GuestRoomSelector = () => {
    return (
        <div>
            <Card className="guest-room-box">
                <Card.Body className="">
                    <div className="guest-label">
                        Rooms & Guests
                    </div>
                    <div className="fw-bold fs-5">2 Guest, 1 Rooms</div>
                </Card.Body>
            </Card>
        </div>
    )
}

export default GuestRoomSelector