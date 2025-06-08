import React, { useState, useRef, useEffect } from 'react';
import { Card, Dropdown, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css'; // Your custom styles

const GuestRoomSelector = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [starRating, setStarRating] = useState('3 Star or less');
    const [adults, setAdults] = useState(3);
    const [children, setChildren] = useState(2);
    const [childAge, setChildAge] = useState(1);
    const popupRef = useRef();

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="position-relative d-inline-block" ref={popupRef}>
            <Card
                className="guest-room-box"
                onClick={() => setShowPopup(!showPopup)}
                style={{ cursor: 'pointer' }}
            >
                <Card.Body>
                    <div className="guest-label text-muted">Rooms & Guests</div>
                    <div className="fw-bold fs-5">
                        {adults + children} Guest, 1 Rooms
                    </div>
                </Card.Body>
            </Card>

            {showPopup && (
                <Card className="position-absolute mt-2 p-3 shadow" style={{ width: '300px', zIndex: 999 }}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Star Rating</Form.Label>
                        <Form.Select
                            value={starRating}
                            onChange={(e) => setStarRating(e.target.value)}
                        >
                            <option>3 Star or less</option>
                            <option>4 Star</option>
                            <option>5 Star</option>
                        </Form.Select>
                    </Form.Group>

                    <hr />

                    <div className="fw-bold text-primary mb-2">Room 1</div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Adults <div className="text-muted small">12y +</div></Form.Label>
                        <Form.Select
                            value={adults}
                            onChange={(e) => setAdults(parseInt(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Children <div className="text-muted small">Age 12y and below</div></Form.Label>
                        <Form.Select
                            value={children}
                            onChange={(e) => setChildren(parseInt(e.target.value))}
                        >
                            {[0, 1, 2, 3, 4].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Age</Form.Label>
                        <Form.Select
                            value={childAge}
                            onChange={(e) => setChildAge(parseInt(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Card>
            )}
        </div>
    );
};

export default GuestRoomSelector;
