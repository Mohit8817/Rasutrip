import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button } from "react-bootstrap";
import { HotelSearchContext } from "../../Context/HotelSearchContext";

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const { hotelSearchData } = useContext(HotelSearchContext);

  if (!hotel) return null;

  const handleBookClick = () => {
    const {
      city = "",
      checkIn = "",
      checkOut = "",
      guests,
      rooms,
      nights,
      RoomGuests = [],
      MinRating = 1,
      MaxRating = 5,
      GuestNationality = "IN",
      DestinationCityId,
      CountryCode = "IN",
      ResultCount = null,
      UserIp = "49.36.217.215",
    } = hotelSearchData || {};

    // Fallback if nights not present
    const getNights = (checkInDate, checkOutDate) => {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = end - start;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const stayNights = nights || getNights(checkIn, checkOut);

    const hotelPayload = {
      ...hotel,
      ResultIndex: hotel.resultIndex,
      HotelCode: hotel.id,
      SearchTokenId: hotel.SearchTokenId,
    };

    // Pass full payload with search + hotel info
    navigate(`/HotelDetailsPage/${hotel.id}`, {
      state: {
        hotel: hotelPayload,
        searchDetails: {
          city: city?.trim() || hotel.location || "",
          checkIn,
          checkOut,
          guests: Number(guests),
          rooms: Number(rooms),
          nights: stayNights,
          RoomGuests,
          MinRating,
          MaxRating,
          GuestNationality,
          DestinationCityId,
          CountryCode,
          ResultCount,
          UserIp,
        },
      },
    });
  };

  const {
    image,
    name = "Unnamed Hotel",
    location = "Location not available",
    rating = 0,
    description = "No description available.",
    price = 0,
    tax = 0,
  } = hotel;

  return (
    <Card className="mb-3 p-3 shadow-sm rounded-3 hotel-card-box">
      <Row className="g-3 align-items-center">
        {/* Image */}
        <Col md={3}>
          <img
            src={image || "https://via.placeholder.com/300x200?text=No+Image"}
            alt={name}
            className="img-fluid rounded w-100"
            style={{ height: "180px", objectFit: "cover" }}
          />
        </Col>

        {/* Hotel Info */}
        <Col md={6}>
          <h5 className="fw-bold mb-1">{name}</h5>
          <div className="text-muted small mb-2">{location}</div>
          <div className="text-warning mb-2">
            {[...Array(Math.round(rating))].map((_, i) => (
              <i key={i} className="bi bi-star-fill me-1" />
            ))}
          </div>
          <p className="text-muted small mb-0">{description?.slice(0, 100)}...</p>
        </Col>

        {/* Price & Book */}
        <Col md={3} className="text-end d-flex flex-column justify-content-between">
          <div>
            <h5 className="fw-bold text-dark mb-1">₹ {price.toFixed(2)}</h5>
            <div className="small text-muted">Per Night</div>
            <div className="small text-muted">+ ₹ {tax.toFixed(2)} taxes & fees</div>
          </div>
          <Button className="btn-red mt-3" onClick={handleBookClick}>
            Book
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default HotelCard;
