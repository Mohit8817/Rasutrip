// src/Components/Hotel/Heading.jsx
import { StarFill } from "react-bootstrap-icons";
import "./HotelDetails.css";
import { Card } from "react-bootstrap";

const Heading = ({ name = "Unnamed Hotel", location = "Unknown location", rating = 0 }) => {
  return (
    <Card className="p-3 mt-3 pt-3">
      <h5 className="d-flex align-items-center gap-2 fw-semibold">
        {name}
        <span className="text-warning fs-6 d-flex align-items-center">
          {[...Array(Math.round(rating))].map((_, index) => (
            <StarFill key={index} className="me-1" />
          ))}
        </span>
      </h5>
      <p>{location}</p>
    </Card>
  );
};

export default Heading;
