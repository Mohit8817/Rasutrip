// src/Components/Hotel/Heading.jsx
import { StarFill } from "react-bootstrap-icons";
import "./HotelDetails.css";
import { Card } from "react-bootstrap";

const Heading = ({ name = "Unnamed Hotel", location = "Unknown location", rating = 0 }) => {
  return (
    <Card className="p-2 p-md-3 mt-2 mt-md-3 pt-2 pt-md-3">
      <div className="d-flex align-items-center gap-1 gap-md-2 fw-semibold mb-2">
        <span className="text-lg sm:text-base md:text-lg font-semibold">{name}</span>
        <span className="text-warning fs-6 fs-md-6 d-flex align-items-center">
          {[...Array(Math.round(rating))].map((_, index) => (
            <StarFill key={index} className="me-1" style={{ fontSize: window.innerWidth < 768 ? '0.8rem' : '1rem' }} />
          ))}
        </span>
      </div>
      <p className="mb-1 mb-md-2 fs-6 fs-md-5 text-muted">{location}</p>
    </Card>
  );
};

export default Heading;
