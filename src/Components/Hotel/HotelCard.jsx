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

  return (
    <Card className="mb-3 p-3 hotel-card-box">
      <Row className="g-3">
        {/* Hotel Image */}
        <Col md={3}>
          <img
            src={hotel.image || "https://via.placeholder.com/300x200?text=No+Image"}
            alt={hotel.name || "Hotel"}
            className="img-fluid rounded w-100"
          />
        </Col>

        {/* Hotel Info */}
        <Col md={6}>
          <h5 className="fw-bold">{hotel.name}</h5>
          <small className="text-muted mb-1">{hotel.location}</small>
          <div className="star-rating text-warning">
            {[...Array(hotel.rating || 0)].map((_, idx) => (
              <i key={idx} className="bi bi-star-fill me-1"></i>
            ))}
          </div>
        </Col>

        {/* Price + Book Button */}
        <Col md={3} className="text-end d-flex flex-column justify-content-between">
          <div>
            <div className="fw-bold fs-5 text-dark">₹ {hotel.price}</div>
            <div className="text-muted small">Per Night</div>
            <div className="text-muted small">+ ₹ 0.00 taxes & fees</div>
          </div>
          <div>
            <Button className="btn-red" onClick={handleBookClick}>
              Book
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default HotelCard;
