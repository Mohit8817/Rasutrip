import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaMapMarkerAlt, FaCalendarAlt, FaBed, FaMoon } from "react-icons/fa";
import hotelFallbackImage from "../../../../assest/hotel1.jpg";
import { HotelSearchContext } from "../../../Context/HotelSearchContext";

const HotelDetailInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { hotel, room, payload, priceDetails } = location.state || {}; // ✅ read priceDetails
  const { hotelSearchData } = useContext(HotelSearchContext);

const handleContinue = () => {
  const roomDetails = hotelSearchData?.roomDetails || [{ adults: 2, children: 0 }];

  // 👇 Total guests = sum of adults + children in each room
  const totalGuests = roomDetails.reduce((acc, room) => {
    return acc + (room.adults || 0) + (room.children || 0);
  }, 0);

  navigate("/guest-details", {
    state: {
      hotel: {
        ...hotel,
        rooms: hotelSearchData?.rooms,
        guests: hotelSearchData?.guests,
        roomDetails,
      },
      room,
      priceDetails,
      roomDetails,
      totalGuests,
      payload,
    },
  });
};


  if (!hotel || !room) {
    return (
      <div className="p-4 text-danger text-center">
        ❌ Missing hotel or room details. Please go back and try again.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-light shadow-sm p-2 rounded fw-bold mb-3">
        Review Your Hotel Details
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h5 className="fw-bold text-dark">{hotel.name}</h5>
              <p className="text-muted mb-2">
                <FaMapMarkerAlt className="me-1 text-danger" />
                {hotel.location || "N/A"}
              </p>
            </Col>
            <Col xs="auto">
              <div className="text-warning fs-5">
                {"⭐".repeat(hotel.rating || 3)}
              </div>
            </Col>
          </Row>

          <hr />

          <Row className="align-items-center mb-3">
            <Col md={3}>
              <img
                src={hotel.image || hotelFallbackImage}
                alt="Hotel"
                className="img-fluid rounded"
                style={{ height: "180px", objectFit: "cover" }}
              />
            </Col>

            <Col md={9}>
              <Row>
                <Col md={3} className="mb-3">
                  <FaCalendarAlt className="me-1" />
                  <strong> Check-in</strong>
                  <div className="text-dark fw-semibold">{hotel.checkInDate}</div>
                </Col>

                <Col md={3} className="mb-3">
                  <FaMoon className="me-1" />
                  <strong> Nights</strong>
                  <div className="fw-semibold mt-1">{hotel.nights}</div>
                </Col>

                <Col md={3} className="mb-3">
                  <FaCalendarAlt className="me-1" />
                  <strong> Check-out</strong>
                  <div className="text-dark fw-semibold">{hotel.checkOutDate}</div>
                </Col>

                <Col md={3} className="mb-3">
                  <FaBed className="me-1" />
                  <strong> Rooms & Guests</strong>
                  <div className="text-dark fw-semibold mt-1">
                    {hotelSearchData?.rooms || hotel.rooms} Room(s),{" "}
                    {hotelSearchData?.guests || hotel.guests} Guest(s)
                  </div>
                </Col>
              </Row>

              <hr className="my-3" />
              <Row>
                <Col md={4}>
                  <span className="text-muted">Room Type</span>
                  <div className="fw-bold">{room.RoomTypeName || "N/A"}</div>
                </Col>
                <Col md={4}>
                  <span className="text-muted">No. of Guests</span>
                  <div className="fw-bold">
                    {room.Adult || hotelSearchData?.guests || hotel.guests} Adult(s)
                  </div>
                </Col>
                <Col md={4}>
                  <span className="text-muted">Cancellation Policy</span>
                  <div className="fw-bold text-primary">
                    {room.CancellationPolicy || "Free Cancellation"}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="text-start">
        <Button variant="primary" className="btn-red" onClick={handleContinue}>
          Continue Booking
        </Button>
      </div>
    </div>
  );
};

export default HotelDetailInfo;
