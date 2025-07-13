// src/Components/Hotel/Heading.jsx
import { StarFill } from "react-bootstrap-icons";
import "./HotelDetails.css";
import { Card } from "react-bootstrap";

const Heading = ({ name = "Unnamed Hotel", location = "Unknown location", rating = 0 }) => {
  return (
    <Card className="summ_header mt-4 pt-4">
      <h4 className="d-flex align-items-center gap-2 fw-semibold">
        {name}
        <span className="text-warning fs-6">
          {[...Array(Math.round(rating))].map((_, index) => (
            <StarFill key={index} />
          ))}
        </span>
      </h4>
      <p>📍 {location}</p>
    </Card>
  );
};

export default Heading;
