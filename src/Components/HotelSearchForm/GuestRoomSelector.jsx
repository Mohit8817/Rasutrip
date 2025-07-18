import { useState, useRef, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css'; // You can add additional custom styles here

const GuestRoomSelector = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [starRating, setStarRating] = useState('2 Star or More');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
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
                    <div className="guest-label">Rooms & Guests</div>
                    <div className="fw-bold fs-5">
                        {adults + children} Guest, 1 Rooms
                    </div>
                </Card.Body>
            </Card>
            {showPopup && (
                <Card
                    className="position-absolute rounded p-2"
                    style={{
                        width: '280px',
                        zIndex: 999,
                      
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                    }}
                >
                    <Form.Group className="mb-2">
                        <Row className="align-items-start">
                            <Col xs={6}>
                                <Form.Label className="fw-bold pt-2">Star Rating</Form.Label>
                            </Col>
                            <Col xs={6}>
                                <Form.Select
                                    value={starRating}
                                    onChange={(e) => setStarRating(e.target.value)}
                                >
                                    <option>2 Star or More</option>
                                    <option>3 Star or less</option>
                                    <option>4 Star</option>
                                    <option>5 Star</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Form.Group>

                    <hr />

                    <div className="fw-bold text-primary mb-2">Room 1</div>

                    <Form.Group className="mb-1">
                        <Row className="">
                            <Col xs={6} className='text-start'>
                                <Form.Label className="fw-bold mb-0">
                                    Adults <div className="text-muted small">12y +</div>
                                </Form.Label>
                            </Col>
                            <Col xs={6} >
                                <Form.Select
                                    value={adults}
                                    onChange={(e) => setAdults(parseInt(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Row className="align-items-center">
                            <Col xs={6}  className='text-start'>
                                <Form.Label className="fw-bold mb-0">
                                    Children <div className="text-muted small">Age 12y and below</div>
                                </Form.Label>
                            </Col>
                            <Col xs={6}>
                                <Form.Select
                                    value={children}
                                    onChange={(e) => setChildren(parseInt(e.target.value))}
                                >
                                    {[0, 1, 2, 3, 4].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </Form.Group>

                    <hr />

                    <div
                        className="text-success fw-bold"
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => alert('Add Room Clicked')} // You can handle add room functionality here
                    >
                        Add Room
                    </div>
                </Card>
            )}

        </div>
    );
};

export default GuestRoomSelector;
