import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button } from "react-bootstrap";
import "./HotelListingPage.css";

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  if (!hotel) return null;

  const handleBookClick = () => {
    navigate(`/HotelDetailsPage/${hotel.id}`, { state: { hotel } });
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
            alt={name || "Hotel Image"}
            className="img-fluid rounded w-100"
            style={{ height: "180px", objectFit: "cover" }}
          />
        </Col>

        {/* Details */}
        <Col md={6}>
          <h5 className="fw-bold mb-1">{name}</h5>
          <div className="text-muted small mb-2">{location}</div>

          <div className="text-warning mb-2">
            {[...Array(Math.round(rating))].map((_, i) => (
              <i key={i} className="bi bi-star-fill me-1" />
            ))}
          </div>

          <p className="text-muted small mb-0">
            {description?.slice(0, 100)}...
          </p>
        </Col>

        {/* Price & Book Button */}
        <Col md={3} className="text-end d-flex flex-column justify-content-between">
          <div>
            <h5 className="fw-bold text-dark mb-1">₹ {price.toFixed(2)}</h5>
            <div className="small text-muted">Per Night</div>
            <div className="small text-muted">+ ₹ {tax.toFixed(2)} taxes & fees</div>
          </div>
          <Button
            className="btn-red mt-3"
            onClick={handleBookClick}
          >
            Book
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default HotelCard;
