import { useState, useRef, useEffect, useContext } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import "../../Style/FlightBooking.css";
import { HotelSearchContext } from "../Context/HotelSearchContext";

const GuestRoomSelector = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [starRating, setStarRating] = useState("2 Star or More");
  const [rooms, setRooms] = useState([
    { adults: 2, children: 0 }, // Room 1 default
  ]);
  const popupRef = useRef();
  const { setHotelSearchData } = useContext(HotelSearchContext);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update context when rooms change
  useEffect(() => {
    const totalGuests = rooms.reduce(
      (total, room) => total + room.adults + room.children,
      0
    );
    const totalAdults = rooms.reduce((sum, r) => sum + r.adults, 0);
    const totalChildren = rooms.reduce((sum, r) => sum + r.children, 0);

    setHotelSearchData((prev) => ({
      ...prev,
      guests: totalGuests,
      rooms: rooms.length,
      adultsCount: totalAdults,
      childrenCount: totalChildren,
      roomDetails: rooms,
    }));
  }, [rooms]);

  // Update adults or children in a room
  const handleRoomChange = (index, type, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][type] = parseInt(value);
    setRooms(updatedRooms);
  };

  // Add another room
  const handleAddRoom = () => {
    setRooms([...rooms, { adults: 2, children: 0 }]);
  };

  return (
    // <div className="container">
    <div className=" position-relative d-inline-block w-100" ref={popupRef}>
      {/* Main Summary Box */}
      <Card
        className="guest-room-box w-100"
        onClick={() => setShowPopup(!showPopup)}
      >
        <Card.Body>
          <div className="guest-label">Rooms & Guests</div>
          <div className="fw-bold fs-5 guest-count">
            {rooms.reduce((sum, r) => sum + r.adults + r.children, 0)} Guest
            <span> {rooms.length} Room</span>
          </div>
        </Card.Body>
      </Card>
      {/* </div> */}
      {/* Popup Panel */}
      {showPopup && (
        <div
          className="absolute  top-full mt-1 z-[9999]   
  sm:w-100 
  md:w-100 
  lg:w-[40px] 
  xl:w-[450px]"
        >
          <Card className="rounded-lg shadow-lg w-11/12 sm:w-70 p-3">
            {/* Star Rating */}
            <Form.Group className="mb-3">
              <Row className="align-items-center">
                <Col xs={6}>
                  <Form.Label className="fw-bold">Star Rating</Form.Label>
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

            {/* Room Inputs */}
            {rooms.map((room, index) => (
              <div key={index}>
                <div className="fw-bold text-primary mb-2">
                  Room {index + 1}
                </div>

                {/* Adults */}
                <Form.Group className="mb-2">
                  <Row className="align-items-center">
                    <Col xs={6} className="text-start">
                      <Form.Label className="fw-bold mb-0">
                        Adults
                        <div className="text-muted small">12y +</div>
                      </Form.Label>
                    </Col>
                    <Col xs={6}>
                      <Form.Select
                        value={room.adults}
                        onChange={(e) =>
                          handleRoomChange(index, "adults", e.target.value)
                        }
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

                {/* Children */}
                <Form.Group className="mb-3">
                  <Row className="align-items-center">
                    <Col xs={6} className="text-start">
                      <Form.Label className="fw-bold mb-0">
                        Children
                        <div className="text-muted small">Under 12y</div>
                      </Form.Label>
                    </Col>
                    <Col xs={6}>
                      <Form.Select
                        value={room.children}
                        onChange={(e) =>
                          handleRoomChange(index, "children", e.target.value)
                        }
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
              </div>
            ))}

            {/* Add Room Button */}
            <div
              className="text-success fw-bold text-center cursor-pointer underline"
              onClick={handleAddRoom}
            >
              + Add Room
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GuestRoomSelector;
