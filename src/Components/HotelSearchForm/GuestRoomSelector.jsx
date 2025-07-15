import { useState, useRef, useEffect, useContext } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import '../../Style/FlightBooking.css';
import { HotelSearchContext } from '../Context/HotelSearchContext';

const GuestRoomSelector = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [starRating, setStarRating] = useState('2 Star or More');
  const [rooms, setRooms] = useState([
    { adults: 2, children: 0 } // Room 1 default
  ]);
  const popupRef = useRef();
  const { setHotelSearchData } = useContext(HotelSearchContext);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update context when rooms change
  useEffect(() => {
    const totalGuests = rooms.reduce((total, room) => total + room.adults + room.children, 0);
    setHotelSearchData((prev) => ({
      ...prev,
      guests: totalGuests,
      rooms: rooms.length
    }));
  }, [rooms]);

  // Update adults/children in a specific room
  const handleRoomChange = (index, type, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][type] = parseInt(value);
    setRooms(updatedRooms);
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { adults: 2, children: 0 }]); // Add new room with default values
  };

  return (
    <div className="position-relative d-inline-block" ref={popupRef}>
      <Card className="guest-room-box" onClick={() => setShowPopup(!showPopup)} style={{ cursor: 'pointer' }}>
        <Card.Body>
          <div className="guest-label">Rooms & Guests</div>
          <div className="fw-bold fs-5">
            {rooms.reduce((sum, r) => sum + r.adults + r.children, 0)} Guest, {rooms.length} Room
          </div>
        </Card.Body>
      </Card>

      {showPopup && (
        <Card className="position-absolute rounded p-2" style={{ width: '300px', zIndex: 999 }}>
          <Form.Group className="mb-2">
            <Row>
              <Col xs={6}><Form.Label className="fw-bold pt-2">Star Rating</Form.Label></Col>
              <Col xs={6}>
                <Form.Select value={starRating} onChange={(e) => setStarRating(e.target.value)}>
                  <option>2 Star or More</option>
                  <option>3 Star or less</option>
                  <option>4 Star</option>
                  <option>5 Star</option>
                </Form.Select>
              </Col>
            </Row>
          </Form.Group>

          <hr />

          {rooms.map((room, index) => (
            <div key={index}>
              <div className="fw-bold text-primary mb-2">Room {index + 1}</div>

              <Form.Group className="mb-1">
                <Row>
                  <Col xs={6} className="text-start">
                    <Form.Label className="fw-bold mb-0">Adults
                      <div className="text-muted small">12y +</div>
                    </Form.Label>
                  </Col>
                  <Col xs={6}>
                    <Form.Select
                      value={room.adults}
                      onChange={(e) => handleRoomChange(index, 'adults', e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group className="mb-3">
                <Row>
                  <Col xs={6} className="text-start">
                    <Form.Label className="fw-bold mb-0">Children
                      <div className="text-muted small">Under 12y</div>
                    </Form.Label>
                  </Col>
                  <Col xs={6}>
                    <Form.Select
                      value={room.children}
                      onChange={(e) => handleRoomChange(index, 'children', e.target.value)}
                    >
                      {[0, 1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>

              <hr />
            </div>
          ))}

          <div
            className="text-success fw-bold text-center"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={handleAddRoom}
          >
            + Add Room
          </div>
        </Card>
      )}
    </div>
  );
};

export default GuestRoomSelector;
