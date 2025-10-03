import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Modal } from "react-bootstrap";
import { HotelSearchContext } from "../../Context/HotelSearchContext";
import { AuthContext } from "../../Context/AuthContext"; // Add this import

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const { hotelSearchData } = useContext(HotelSearchContext);
  const { isLoggedIn } = useContext(AuthContext); // Add this line
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Add this state

  if (!hotel) return null;

  const handleBookClick = () => {
    // Check if user is logged in first
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // Original booking logic - only executes if user is logged in
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

  // Handle login prompt close
  const handleLoginPromptClose = () => {
    setShowLoginPrompt(false);
  };

  // Handle redirect to login
  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    window.location.href = "/login/customer";
  };
  const finalPrice = hotel.originalPriceData?.OfferedPrice ?? hotel.price;
  const offeredPrice = hotel.originalPriceData?.OfferedPrice ?? hotel.price;

  const {
    image,
    name = "Unnamed Hotel",
    location = "Location not available",
    rating = 0,
    description = "No description available.",
    price = 0,
    tax = 0,
  } = hotel;
  console.log(hotel);
  return (
    <>
      <Card className="mb-3 p-3 shadow-sm rounded-3 hotel-card-box">
        <Row className="g-3 align-items-stretch">
          {/* Image */}
          <Col xs={12} md={3}>
            <img
              src={image || "https://via.placeholder.com/300x200?text=No+Image"}
              alt={name}
              className="img-fluid rounded w-100"
              style={{
                height: window.innerWidth < 768 ? "150px" : "150px",
                objectFit: "cover",
              }}
            />
          </Col>

          {/* Hotel Info */}
          <Col xs={12} md={6}>
            <h5 className="fw-bold mb-1">{name}</h5>
            <div className="text-muted small mb-1">{location}</div>
            <div className="text-warning">
              {[...Array(Math.round(rating))].map((_, i) => (
                <i key={i} className="bi bi-star-fill me-1" />
              ))}
            </div>
            <p className="text-muted small mb-0 d-none d-md-block">
              {description?.slice(0, 100)}...
            </p>
            <p className="text-muted small mb-0 d-md-none">
              {description?.slice(0, 80)}...
            </p>
          </Col>

          {/* Price & Book */}
          <Col
            xs={12}
            md={3}
            className="text-end d-flex flex-column justify-content-between"
          >
            {/* Desktop Layout - Column (Original) */}
            <div className="d-none d-md-block">
              {/* <h5 className="fw-bold text-dark mb-1">₹ {price.toFixed(2)}</h5> */}
              <h5 className="fw-bold text-dark mb-1">
                ₹ {offeredPrice.toFixed(2)}
              </h5>

              <div className="small text-muted">Per Night</div>
              <div className="small text-muted">
                + ₹ {tax.toFixed(2)} taxes & fees
              </div>
            </div>
            <div className="d-none d-md-block">
              <Button className="btn-red mt-3 w-75" onClick={handleBookClick}>
                Book
              </Button>
            </div>

            {/* Mobile Layout - Row */}
            <div className="d-md-none d-flex justify-content-between align-items-center">
              <div>
                {/* <h5 className="fw-bold text-dark mb-0">₹ {price.toFixed(2)}</h5> */}
                <h5 className="fw-bold text-dark mb-0">
                  ₹ {finalPrice.toFixed(2)}
                </h5>

                <div className="small text-muted">
                  Per Night + ₹ {tax.toFixed(2)} tax
                </div>
              </div>
              <div>
                <Button className="btn-red px-4" onClick={handleBookClick}>
                  Book
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Login Prompt Modal */}
      <Modal
        show={showLoginPrompt}
        onHide={handleLoginPromptClose}
        centered
        size="md"
      >
        <Modal.Body className="text-center p-5">
          <div className="mb-3">
            <h5 className="fw-bold text-danger">Login Required</h5>
          </div>
          <p className="text-muted mb-4">
            Please login first to continue with hotel booking and enjoy
            exclusive deals!
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-danger"
              onClick={handleLoginPromptClose}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLoginRedirect}
              size="sm"
              className="px-4 btn-red"
            >
              Login Now
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HotelCard;
