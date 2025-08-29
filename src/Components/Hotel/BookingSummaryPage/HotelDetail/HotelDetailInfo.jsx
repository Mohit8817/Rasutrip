import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { StarFill } from "react-bootstrap-icons";
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

    //  Total guests = sum of adults + children in each room
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
      <Card className="p-2 rounded fw-bold mb-3 ">
        Review Your Hotel Details
      </Card>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="align-items-center text-center text-md-start">
            {/* ✅ Left Side - Hotel Name & Location */}
            <Col xs={12} md>
              <h5 className="fw-bold text-dark text-sm md:text-lg">
                {hotel.name}
              </h5>
              <p className="text-muted mb-2 text-xs md:text-base">
                {hotel.location || "N/A"}
              </p>
            </Col>

            {/* ✅ Right Side - Rating Stars */}
            <Col
              xs={12}
              md="auto"
              className="d-flex justify-content-center justify-content-md-end mt-2 mt-md-0"
            >
              {Array.from({ length: hotel.rating || 3 }).map((_, index) => (
                <StarFill key={index} className="text-warning text-md md:fs-3" />
              ))}
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
              <Row className="pt-3">
                {/* ✅ Mobile: 2 per row, Desktop: 4 per row */}
                <Col xs={6} md={3} className="mb-3">
                  <FaCalendarAlt className="me-1" />
                  <strong> Check-in</strong>
                  <div className="text-dark fw-semibold">{hotel.checkInDate}</div>
                </Col>

                <Col xs={6} md={3} className="mb-3">
                  <FaMoon className="me-1" />
                  <strong> Nights</strong>
                  <div className="fw-semibold mt-1">{hotel.nights}</div>
                </Col>

                <Col xs={6} md={3} className="mb-3">
                  <FaCalendarAlt className="me-1" />
                  <strong> Check-out</strong>
                  <div className="text-dark fw-semibold">{hotel.checkOutDate}</div>
                </Col>

                <Col xs={6} md={3} className="mb-3">
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
                <Col xs={12} md={4} className="mb-3">
                  <span className="text-muted">Room Type</span>
                  <div className="fw-bold">{room.RoomTypeName || "N/A"}</div>
                </Col>

                <Col xs={12} md={4} className="mb-3">
                  <span className="text-muted">No. of Guests</span>
                  <div className="fw-bold">
                    {room.Adult || hotelSearchData?.guests || hotel.guests} Adult(s)
                  </div>
                </Col>

                <Col xs={12} md={4} className="mb-3">
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
      <div className="text-start mb-4">
        <Button variant="danger" className="btn-red" onClick={handleContinue}>
          Continue Booking
        </Button>
      </div>
    </div>
  );
};

export default HotelDetailInfo;
